import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { protectedProcedure, router } from "../trpc";
import { db } from "@/db";
import { routines, routineEntries } from "@/db/schema";

export const routineRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db
      .select()
      .from(routines)
      .where(eq(routines.userId, ctx.userId));
  }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const [routine] = await db
        .select()
        .from(routines)
        .where(and(eq(routines.id, input.id), eq(routines.userId, ctx.userId)));

      if (!routine) return null;

      const entries = await db
        .select()
        .from(routineEntries)
        .where(eq(routineEntries.routineId, input.id));

      return { ...routine, entries };
    }),

  create: protectedProcedure
    .input(
      z.object({
        danceId: z.number(),
        name: z.string(),
        description: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [routine] = await db
        .insert(routines)
        .values({
          ...input,
          userId: ctx.userId,
        })
        .returning();
      return routine;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const [routine] = await db
        .select({ id: routines.id })
        .from(routines)
        .where(and(eq(routines.id, input.id), eq(routines.userId, ctx.userId)));

      if (!routine) {
        return { success: false };
      }

      await db
        .delete(routineEntries)
        .where(eq(routineEntries.routineId, input.id));
      await db.delete(routines).where(eq(routines.id, input.id));
      return { success: true };
    }),
});
