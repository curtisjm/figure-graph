import { z } from "zod";
import { eq, and, asc, isNull, inArray } from "drizzle-orm";
import { router, publicProcedure } from "@shared/auth/trpc";
import { db } from "@shared/db";
import {
  competitions,
  competitionEvents,
  competitionDays,
  scheduleBlocks,
  rounds,
  entries,
  competitionRegistrations,
  activeRounds,
  announcementNotes,
  roundResultsMeta,
  finalResults,
} from "@competitions/schema";
import { users } from "@shared/schema";

export const liveViewRouter = router({
  getSchedule: publicProcedure
    .input(z.object({ competitionId: z.number() }))
    .query(async ({ input }) => {
      const comp = await db.query.competitions.findFirst({
        where: eq(competitions.id, input.competitionId),
      });
      if (!comp) return null;

      const days = await db.query.competitionDays.findMany({
        where: eq(competitionDays.competitionId, input.competitionId),
        orderBy: asc(competitionDays.position),
      });

      const dayIds = days.map((d) => d.id);
      const blocks =
        dayIds.length > 0
          ? await db.query.scheduleBlocks.findMany({
              where: inArray(scheduleBlocks.dayId, dayIds),
              orderBy: asc(scheduleBlocks.position),
            })
          : [];

      const events = await db.query.competitionEvents.findMany({
        where: eq(competitionEvents.competitionId, input.competitionId),
        orderBy: asc(competitionEvents.position),
      });

      // Get active round for current event highlighting
      const active = await db.query.activeRounds.findFirst({
        where: and(
          eq(activeRounds.competitionId, input.competitionId),
          isNull(activeRounds.endedAt),
        ),
      });

      let activeEventId: number | null = null;
      if (active) {
        const round = await db.query.rounds.findFirst({
          where: eq(rounds.id, active.roundId),
        });
        activeEventId = round?.eventId ?? null;
      }

      // Batch: fetch all rounds and entries for all events
      const eventIds = events.map((e) => e.id);

      const [allRounds, allEntries] = await Promise.all([
        eventIds.length > 0
          ? db.query.rounds.findMany({ where: inArray(rounds.eventId, eventIds) })
          : [],
        eventIds.length > 0
          ? db.query.entries.findMany({
              where: and(inArray(entries.eventId, eventIds), eq(entries.scratched, false)),
            })
          : [],
      ]);

      // Group rounds and entries by eventId
      const roundsByEvent = new Map<number, typeof allRounds>();
      for (const r of allRounds) {
        const arr = roundsByEvent.get(r.eventId) ?? [];
        arr.push(r);
        roundsByEvent.set(r.eventId, arr);
      }

      const entriesByEvent = new Map<number, typeof allEntries>();
      for (const e of allEntries) {
        const arr = entriesByEvent.get(e.eventId) ?? [];
        arr.push(e);
        entriesByEvent.set(e.eventId, arr);
      }

      // Batch: fetch all registrations needed for couple numbers
      const allRegIds = [
        ...new Set(allEntries.flatMap((e) => [e.leaderRegistrationId, e.followerRegistrationId])),
      ];

      const allRegs =
        allRegIds.length > 0
          ? await db.query.competitionRegistrations.findMany({
              where: inArray(competitionRegistrations.id, allRegIds),
            })
          : [];

      const regMap = new Map(allRegs.map((r) => [r.id, r]));

      // Assemble event data
      const eventData = events.map((event) => {
        const eventRounds = roundsByEvent.get(event.id) ?? [];
        const eventEntries = entriesByEvent.get(event.id) ?? [];

        // Determine event status
        let status: "upcoming" | "in_progress" | "completed" = "upcoming";
        if (event.id === activeEventId) {
          status = "in_progress";
        } else if (eventRounds.length > 0 && eventRounds.every((r) => r.status === "completed")) {
          status = "completed";
        } else if (eventRounds.some((r) => r.status !== "pending")) {
          status = "completed"; // Past events that finished
        }

        // Get couple numbers from pre-fetched regs
        const coupleNumbers = [
          ...new Set(
            eventEntries
              .flatMap((e) => [e.leaderRegistrationId, e.followerRegistrationId])
              .map((id) => regMap.get(id)?.competitorNumber)
              .filter((n): n is number => n !== null && n !== undefined),
          ),
        ].sort((a, b) => a - b);

        return {
          id: event.id,
          name: event.name,
          sessionId: event.sessionId,
          position: event.position,
          status,
          coupleNumbers,
          entryCount: eventEntries.length,
        };
      });

      // Get announcement notes (projector-visible only)
      const notes = await db.query.announcementNotes.findMany({
        where: and(
          eq(announcementNotes.competitionId, input.competitionId),
          eq(announcementNotes.visibleOnProjector, true),
        ),
        orderBy: asc(announcementNotes.createdAt),
      });

      return {
        competition: { id: comp.id, name: comp.name, slug: comp.slug },
        days,
        blocks,
        events: eventData,
        activeEventId,
        notes,
      };
    }),

  getMyEvents: publicProcedure
    .input(z.object({ competitionId: z.number() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // If not authenticated, just return empty set
      if (!userId) return { myEventIds: [] };

      // Find user's registration
      const reg = await db.query.competitionRegistrations.findFirst({
        where: and(
          eq(competitionRegistrations.competitionId, input.competitionId),
          eq(competitionRegistrations.userId, userId),
          eq(competitionRegistrations.cancelled, false),
        ),
      });

      if (!reg) return { myEventIds: [] };

      // Find all entries where this user is leader or follower
      const myEntries = await db.query.entries.findMany({
        where: and(
          eq(entries.leaderRegistrationId, reg.id),
          eq(entries.scratched, false),
        ),
      });

      const myFollowerEntries = await db.query.entries.findMany({
        where: and(
          eq(entries.followerRegistrationId, reg.id),
          eq(entries.scratched, false),
        ),
      });

      const allMyEntries = [...myEntries, ...myFollowerEntries];
      const myEventIds = [...new Set(allMyEntries.map((e) => e.eventId))];

      return { myEventIds };
    }),

  getAblyToken: publicProcedure
    .input(z.object({ competitionId: z.number() }))
    .query(async ({ input }) => {
      const { createPublicAblyToken } = await import("@competitions/lib/ably-comp");
      return createPublicAblyToken(input.competitionId);
    }),

  getPublishedResults: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input }) => {
      const event = await db.query.competitionEvents.findFirst({
        where: eq(competitionEvents.id, input.eventId),
      });
      if (!event) return null;

      // Fetch rounds and published meta in batch
      const eventRounds = await db.query.rounds.findMany({
        where: eq(rounds.eventId, input.eventId),
        orderBy: asc(rounds.position),
      });

      if (eventRounds.length === 0) return { eventName: event.name, rounds: [] };

      const roundIds = eventRounds.map((r) => r.id);
      const allMeta = await db.query.roundResultsMeta.findMany({
        where: and(
          inArray(roundResultsMeta.roundId, roundIds),
          eq(roundResultsMeta.status, "published"),
        ),
      });

      const publishedRoundIds = new Set(allMeta.map((m) => m.roundId));
      const publishedRounds = eventRounds.filter((r) => publishedRoundIds.has(r.id));

      if (publishedRounds.length === 0) return { eventName: event.name, rounds: [] };

      // Batch: fetch all final results for published rounds
      const publishedIds = publishedRounds.map((r) => r.id);
      const allFinalResults = await db.query.finalResults.findMany({
        where: inArray(finalResults.roundId, publishedIds),
        orderBy: asc(finalResults.placement),
      });

      // Group results by round
      const resultsByRound = new Map<number, typeof allFinalResults>();
      for (const r of allFinalResults) {
        const arr = resultsByRound.get(r.roundId) ?? [];
        arr.push(r);
        resultsByRound.set(r.roundId, arr);
      }

      // Collect all entry IDs we need
      const allEntryIds = [...new Set(allFinalResults.map((r) => r.entryId))];

      // Batch: fetch all entries
      const allEntriesData =
        allEntryIds.length > 0
          ? await db.query.entries.findMany({ where: inArray(entries.id, allEntryIds) })
          : [];
      const entryMap = new Map(allEntriesData.map((e) => [e.id, e]));

      // Collect all registration IDs from entries
      const allRegIds = [
        ...new Set(
          allEntriesData.flatMap((e) => [e.leaderRegistrationId, e.followerRegistrationId]),
        ),
      ];

      // Batch: fetch all registrations
      const allRegs =
        allRegIds.length > 0
          ? await db.query.competitionRegistrations.findMany({
              where: inArray(competitionRegistrations.id, allRegIds),
            })
          : [];
      const regMap = new Map(allRegs.map((r) => [r.id, r]));

      // Batch: fetch all users
      const allUserIds = [...new Set(allRegs.map((r) => r.userId))];
      const allUsers =
        allUserIds.length > 0
          ? await db.query.users.findMany({ where: inArray(users.id, allUserIds) })
          : [];
      const userMap = new Map(allUsers.map((u) => [u.id, u]));

      // Assemble results
      const results = publishedRounds.map((round) => {
        const roundResults = resultsByRound.get(round.id) ?? [];
        const overallResults = roundResults.filter((r) => r.danceName === null);
        const actualResults = overallResults.length > 0 ? overallResults : roundResults;

        const enriched = actualResults.map((r) => {
          const entry = entryMap.get(r.entryId);
          if (!entry) return { ...r, coupleNumber: null, leaderName: null, followerName: null };

          const leaderReg = regMap.get(entry.leaderRegistrationId);
          const followerReg = regMap.get(entry.followerRegistrationId);
          const leader = leaderReg ? userMap.get(leaderReg.userId) : null;
          const follower = followerReg ? userMap.get(followerReg.userId) : null;

          return {
            ...r,
            coupleNumber: leaderReg?.competitorNumber ?? followerReg?.competitorNumber ?? null,
            leaderName: leader?.displayName ?? null,
            followerName: follower?.displayName ?? null,
          };
        });

        return {
          roundId: round.id,
          roundType: round.roundType,
          results: enriched,
        };
      });

      return { eventName: event.name, rounds: results };
    }),
});
