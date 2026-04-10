import { z } from "zod";
import { eq, and, ne, or, ilike, sql, desc, asc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "@shared/auth/trpc";
import { db } from "@shared/db";
import {
  competitions,
  competitionRegistrations,
  competitionEvents,
  entries,
  payments,
  pricingTiers,
} from "@competitions/schema";
import { users } from "@shared/schema";
import { organizations } from "@orgs/schema";
import { requireCompStaffRole } from "@competitions/lib/auth";

function calculateAmountOwed(
  comp: typeof competitions.$inferSelect,
  tier: typeof pricingTiers.$inferSelect | null,
): string {
  if (tier) return tier.price;
  return comp.baseFee ?? "0";
}

export const registrationRouter = router({
  getMyRegistration: protectedProcedure
    .input(z.object({ competitionId: z.number() }))
    .query(async ({ ctx, input }) => {
      const reg = await db.query.competitionRegistrations.findFirst({
        where: and(
          eq(competitionRegistrations.competitionId, input.competitionId),
          eq(competitionRegistrations.userId, ctx.userId),
        ),
      });
      if (!reg) return null;

      const entryList = await db
        .select({
          id: entries.id,
          eventId: entries.eventId,
          eventName: competitionEvents.name,
          eventStyle: competitionEvents.style,
          eventLevel: competitionEvents.level,
          scratched: entries.scratched,
          leaderRegistrationId: entries.leaderRegistrationId,
          followerRegistrationId: entries.followerRegistrationId,
          leaderDisplayName: sql<string>`lu.display_name`,
          leaderUsername: sql<string>`lu.username`,
          leaderAvatarUrl: sql<string | null>`lu.avatar_url`,
          followerDisplayName: sql<string>`fu.display_name`,
          followerUsername: sql<string>`fu.username`,
          followerAvatarUrl: sql<string | null>`fu.avatar_url`,
        })
        .from(entries)
        .innerJoin(competitionEvents, eq(competitionEvents.id, entries.eventId))
        .innerJoin(
          sql`competition_registrations lr`,
          sql`lr.id = ${entries.leaderRegistrationId}`,
        )
        .innerJoin(sql`users lu`, sql`lu.id = lr.user_id`)
        .innerJoin(
          sql`competition_registrations fr`,
          sql`fr.id = ${entries.followerRegistrationId}`,
        )
        .innerJoin(sql`users fu`, sql`fu.id = fr.user_id`)
        .where(
          sql`${entries.leaderRegistrationId} = ${reg.id}
              OR ${entries.followerRegistrationId} = ${reg.id}`,
        )
        .orderBy(asc(competitionEvents.position));

      const paymentList = await db
        .select()
        .from(payments)
        .where(eq(payments.registrationId, reg.id))
        .orderBy(desc(payments.createdAt));

      const totalPaid = paymentList.reduce(
        (sum, p) => sum + parseFloat(p.amount),
        0,
      );

      return {
        ...reg,
        entries: entryList,
        payments: paymentList,
        totalPaid: totalPaid.toFixed(2),
      };
    }),

  listByCompetition: protectedProcedure
    .input(
      z.object({
        competitionId: z.number(),
        sortBy: z.enum(["org", "name", "paid", "checked_in"]).default("org"),
      }),
    )
    .query(async ({ ctx, input }) => {
      await requireCompStaffRole(input.competitionId, ctx.userId, ["registration"]);

      const regs = await db
        .select({
          id: competitionRegistrations.id,
          userId: competitionRegistrations.userId,
          competitorNumber: competitionRegistrations.competitorNumber,
          amountOwed: competitionRegistrations.amountOwed,
          paidConfirmed: competitionRegistrations.paidConfirmed,
          checkedIn: competitionRegistrations.checkedIn,
          orgId: competitionRegistrations.orgId,
          registeredAt: competitionRegistrations.registeredAt,
          cancelled: competitionRegistrations.cancelled,
          username: users.username,
          displayName: users.displayName,
          orgName: organizations.name,
          totalPaid: sql<string>`coalesce((
            SELECT sum(p.amount) FROM payments p WHERE p.registration_id = ${competitionRegistrations.id}
          ), '0')`,
        })
        .from(competitionRegistrations)
        .innerJoin(users, eq(users.id, competitionRegistrations.userId))
        .leftJoin(organizations, eq(organizations.id, competitionRegistrations.orgId))
        .where(eq(competitionRegistrations.competitionId, input.competitionId))
        .orderBy(
          input.sortBy === "name"
            ? users.displayName
            : input.sortBy === "checked_in"
              ? competitionRegistrations.checkedIn
              : organizations.name,
        );

      return regs;
    }),

  getById: protectedProcedure
    .input(z.object({ registrationId: z.number() }))
    .query(async ({ ctx, input }) => {
      const reg = await db.query.competitionRegistrations.findFirst({
        where: eq(competitionRegistrations.id, input.registrationId),
      });
      if (!reg) throw new TRPCError({ code: "NOT_FOUND", message: "Registration not found" });

      await requireCompStaffRole(reg.competitionId, ctx.userId, ["registration"]);

      const entryList = await db
        .select()
        .from(entries)
        .where(
          sql`${entries.leaderRegistrationId} = ${reg.id} OR ${entries.followerRegistrationId} = ${reg.id}`,
        );

      const paymentList = await db
        .select()
        .from(payments)
        .where(eq(payments.registrationId, reg.id))
        .orderBy(desc(payments.createdAt));

      const user = await db.query.users.findFirst({
        where: eq(users.id, reg.userId),
      });

      return {
        ...reg,
        user,
        entries: entryList,
        payments: paymentList,
        totalPaid: paymentList
          .reduce((sum, p) => sum + parseFloat(p.amount), 0)
          .toFixed(2),
      };
    }),

  register: protectedProcedure
    .input(
      z.object({
        competitionId: z.number(),
        partnerUsername: z.string().optional(),
        orgId: z.number().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const comp = await db.query.competitions.findFirst({
        where: eq(competitions.id, input.competitionId),
      });
      if (!comp) throw new TRPCError({ code: "NOT_FOUND", message: "Competition not found" });

      if (comp.status !== "accepting_entries") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Competition is not accepting entries",
        });
      }

      // Check if user is already registered
      const existing = await db.query.competitionRegistrations.findFirst({
        where: and(
          eq(competitionRegistrations.competitionId, input.competitionId),
          eq(competitionRegistrations.userId, ctx.userId),
        ),
      });
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Already registered for this competition" });
      }

      const amountOwed = comp.baseFee ?? "0";

      // Register self
      const [selfReg] = await db
        .insert(competitionRegistrations)
        .values({
          competitionId: input.competitionId,
          userId: ctx.userId,
          orgId: input.orgId ?? null,
          amountOwed,
          registeredBy: ctx.userId,
        })
        .returning();

      let partnerReg = null;

      if (input.partnerUsername) {
        const partner = await db.query.users.findFirst({
          where: eq(users.username, input.partnerUsername),
        });
        if (!partner) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Partner not found" });
        }

        // Check if partner is already registered
        const existingPartner = await db.query.competitionRegistrations.findFirst({
          where: and(
            eq(competitionRegistrations.competitionId, input.competitionId),
            eq(competitionRegistrations.userId, partner.id),
          ),
        });

        if (!existingPartner) {
          [partnerReg] = await db
            .insert(competitionRegistrations)
            .values({
              competitionId: input.competitionId,
              userId: partner.id,
              orgId: input.orgId ?? null,
              amountOwed,
              registeredBy: ctx.userId,
            })
            .returning();
        } else {
          partnerReg = existingPartner;
        }
      }

      return { self: selfReg, partner: partnerReg };
    }),

  updateOrgAffiliation: protectedProcedure
    .input(
      z.object({
        registrationId: z.number(),
        orgId: z.number().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const reg = await db.query.competitionRegistrations.findFirst({
        where: eq(competitionRegistrations.id, input.registrationId),
      });
      if (!reg) throw new TRPCError({ code: "NOT_FOUND", message: "Registration not found" });

      // Only the registered user or staff can change affiliation
      if (reg.userId !== ctx.userId) {
        await requireCompStaffRole(reg.competitionId, ctx.userId, ["registration"]);
      }

      const [updated] = await db
        .update(competitionRegistrations)
        .set({ orgId: input.orgId })
        .where(eq(competitionRegistrations.id, input.registrationId))
        .returning();

      return updated;
    }),

  updateTier: protectedProcedure
    .input(
      z.object({
        registrationId: z.number(),
        pricingTierId: z.number().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const reg = await db.query.competitionRegistrations.findFirst({
        where: eq(competitionRegistrations.id, input.registrationId),
      });
      if (!reg) throw new TRPCError({ code: "NOT_FOUND", message: "Registration not found" });

      await requireCompStaffRole(reg.competitionId, ctx.userId, ["registration"]);

      const comp = await db.query.competitions.findFirst({
        where: eq(competitions.id, reg.competitionId),
      });
      if (!comp) throw new TRPCError({ code: "NOT_FOUND", message: "Competition not found" });

      let tier = null;
      if (input.pricingTierId) {
        tier = await db.query.pricingTiers.findFirst({
          where: eq(pricingTiers.id, input.pricingTierId),
        });
        if (!tier) throw new TRPCError({ code: "NOT_FOUND", message: "Pricing tier not found" });
      }

      const amountOwed = calculateAmountOwed(comp, tier);

      const [updated] = await db
        .update(competitionRegistrations)
        .set({ pricingTierId: input.pricingTierId, amountOwed })
        .where(eq(competitionRegistrations.id, input.registrationId))
        .returning();

      return updated;
    }),

  toggleCheckedIn: protectedProcedure
    .input(z.object({ registrationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const reg = await db.query.competitionRegistrations.findFirst({
        where: eq(competitionRegistrations.id, input.registrationId),
      });
      if (!reg) throw new TRPCError({ code: "NOT_FOUND", message: "Registration not found" });

      await requireCompStaffRole(reg.competitionId, ctx.userId, ["registration"]);

      const [updated] = await db
        .update(competitionRegistrations)
        .set({ checkedIn: !reg.checkedIn })
        .where(eq(competitionRegistrations.id, input.registrationId))
        .returning();

      return updated;
    }),

  cancel: protectedProcedure
    .input(z.object({ registrationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const reg = await db.query.competitionRegistrations.findFirst({
        where: eq(competitionRegistrations.id, input.registrationId),
      });
      if (!reg) throw new TRPCError({ code: "NOT_FOUND", message: "Registration not found" });

      // User can cancel their own, staff can cancel any
      if (reg.userId !== ctx.userId) {
        await requireCompStaffRole(reg.competitionId, ctx.userId, ["registration"]);
      }

      const [updated] = await db
        .update(competitionRegistrations)
        .set({ cancelled: true })
        .where(eq(competitionRegistrations.id, input.registrationId))
        .returning();

      return updated;
    }),

  searchPartners: protectedProcedure
    .input(
      z.object({
        competitionId: z.number(),
        query: z.string().min(1).max(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      const pattern = `%${input.query}%`;
      const results = await db
        .select({
          userId: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          registrationId: competitionRegistrations.id,
        })
        .from(users)
        .leftJoin(
          competitionRegistrations,
          and(
            eq(competitionRegistrations.userId, users.id),
            eq(competitionRegistrations.competitionId, input.competitionId),
            eq(competitionRegistrations.cancelled, false),
          ),
        )
        .where(
          and(
            ne(users.id, ctx.userId),
            or(
              ilike(users.username, pattern),
              ilike(users.displayName, pattern),
            ),
          ),
        )
        .limit(20);

      return results;
    }),

  ensurePartnerRegistered: protectedProcedure
    .input(
      z.object({
        competitionId: z.number(),
        partnerUserId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const comp = await db.query.competitions.findFirst({
        where: eq(competitions.id, input.competitionId),
      });
      if (!comp) throw new TRPCError({ code: "NOT_FOUND", message: "Competition not found" });

      if (comp.status !== "accepting_entries") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Competition is not accepting entries",
        });
      }

      if (input.partnerUserId === ctx.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot register yourself as a partner",
        });
      }

      // Check if partner user exists
      const partner = await db.query.users.findFirst({
        where: eq(users.id, input.partnerUserId),
      });
      if (!partner) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      // Return existing registration if present
      const existing = await db.query.competitionRegistrations.findFirst({
        where: and(
          eq(competitionRegistrations.competitionId, input.competitionId),
          eq(competitionRegistrations.userId, input.partnerUserId),
        ),
      });
      if (existing) return existing;

      // Auto-register the partner
      const amountOwed = comp.baseFee ?? "0";
      const [reg] = await db
        .insert(competitionRegistrations)
        .values({
          competitionId: input.competitionId,
          userId: input.partnerUserId,
          amountOwed,
          registeredBy: ctx.userId,
        })
        .returning();

      return reg;
    }),

  getPartnerEntries: protectedProcedure
    .input(
      z.object({
        competitionId: z.number(),
        registrationId: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const reg = await db.query.competitionRegistrations.findFirst({
        where: and(
          eq(competitionRegistrations.id, input.registrationId),
          eq(competitionRegistrations.competitionId, input.competitionId),
        ),
      });
      if (!reg) throw new TRPCError({ code: "NOT_FOUND", message: "Registration not found" });

      const user = await db.query.users.findFirst({
        where: eq(users.id, reg.userId),
      });

      const entryList = await db
        .select({
          id: entries.id,
          eventId: entries.eventId,
          eventName: competitionEvents.name,
          eventStyle: competitionEvents.style,
          eventLevel: competitionEvents.level,
          scratched: entries.scratched,
          leaderRegistrationId: entries.leaderRegistrationId,
          followerRegistrationId: entries.followerRegistrationId,
          leaderDisplayName: sql<string>`lu.display_name`,
          leaderUsername: sql<string>`lu.username`,
          followerDisplayName: sql<string>`fu.display_name`,
          followerUsername: sql<string>`fu.username`,
        })
        .from(entries)
        .innerJoin(competitionEvents, eq(competitionEvents.id, entries.eventId))
        .innerJoin(
          sql`competition_registrations lr`,
          sql`lr.id = ${entries.leaderRegistrationId}`,
        )
        .innerJoin(sql`users lu`, sql`lu.id = lr.user_id`)
        .innerJoin(
          sql`competition_registrations fr`,
          sql`fr.id = ${entries.followerRegistrationId}`,
        )
        .innerJoin(sql`users fu`, sql`fu.id = fr.user_id`)
        .where(
          sql`${entries.leaderRegistrationId} = ${input.registrationId}
              OR ${entries.followerRegistrationId} = ${input.registrationId}`,
        )
        .orderBy(asc(competitionEvents.position));

      return {
        registration: reg,
        user: user
          ? {
              id: user.id,
              username: user.username,
              displayName: user.displayName,
              avatarUrl: user.avatarUrl,
            }
          : null,
        entries: entryList,
      };
    }),
});
