import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "@shared/auth/trpc";
import { db } from "@shared/db";
import { competitionStaff } from "@competitions/schema";
import { users } from "@shared/schema";
import { requireCompOrgRole } from "@competitions/lib/auth";

export const staffRouter = router({
  listByCompetition: protectedProcedure
    .input(z.object({ competitionId: z.number() }))
    .query(async ({ ctx, input }) => {
      await requireCompOrgRole(input.competitionId, ctx.userId);

      const staffList = await db
        .select({
          id: competitionStaff.id,
          userId: competitionStaff.userId,
          role: competitionStaff.role,
          createdAt: competitionStaff.createdAt,
          username: users.username,
          displayName: users.displayName,
        })
        .from(competitionStaff)
        .innerJoin(users, eq(users.id, competitionStaff.userId))
        .where(eq(competitionStaff.competitionId, input.competitionId));

      return staffList;
    }),

  assign: protectedProcedure
    .input(
      z.object({
        competitionId: z.number(),
        userId: z.string(),
        role: z.enum([
          "scrutineer",
          "chairman",
          "judge",
          "emcee",
          "deck_captain",
          "registration",
          "dj",
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await requireCompOrgRole(input.competitionId, ctx.userId);

      // Verify target user exists
      const targetUser = await db.query.users.findFirst({
        where: eq(users.id, input.userId),
      });
      if (!targetUser) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // Check for duplicate assignment
      const existing = await db.query.competitionStaff.findFirst({
        where: and(
          eq(competitionStaff.competitionId, input.competitionId),
          eq(competitionStaff.userId, input.userId),
          eq(competitionStaff.role, input.role),
        ),
      });
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "User already has this role" });
      }

      const [staff] = await db
        .insert(competitionStaff)
        .values({
          competitionId: input.competitionId,
          userId: input.userId,
          role: input.role,
        })
        .returning();

      return staff;
    }),

  remove: protectedProcedure
    .input(
      z.object({
        competitionId: z.number(),
        userId: z.string(),
        role: z.enum([
          "scrutineer",
          "chairman",
          "judge",
          "emcee",
          "deck_captain",
          "registration",
          "dj",
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await requireCompOrgRole(input.competitionId, ctx.userId);

      const result = await db
        .delete(competitionStaff)
        .where(
          and(
            eq(competitionStaff.competitionId, input.competitionId),
            eq(competitionStaff.userId, input.userId),
            eq(competitionStaff.role, input.role),
          ),
        )
        .returning();

      if (result.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Staff assignment not found" });
      }

      return { success: true };
    }),
});
