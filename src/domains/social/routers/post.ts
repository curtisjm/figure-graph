import { z } from "zod";
import { and, eq, desc, isNull, isNotNull } from "drizzle-orm";
import { protectedProcedure, publicProcedure, router } from "@shared/auth/trpc";
import { db } from "@shared/db";
import { users } from "@shared/schema";
import { posts } from "@social/schema";

export const postRouter = router({
  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const [post] = await db
        .select({
          id: posts.id,
          authorId: posts.authorId,
          type: posts.type,
          visibility: posts.visibility,
          title: posts.title,
          body: posts.body,
          routineId: posts.routineId,
          publishedAt: posts.publishedAt,
          createdAt: posts.createdAt,
          updatedAt: posts.updatedAt,
          authorUsername: users.username,
          authorDisplayName: users.displayName,
          authorAvatarUrl: users.avatarUrl,
        })
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id))
        .where(eq(posts.id, input.id));
      return post ?? null;
    }),

  createArticle: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        body: z.string(),
        visibility: z.enum(["public", "followers", "organization"]).default("public"),
        publish: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [post] = await db
        .insert(posts)
        .values({
          authorId: ctx.userId,
          type: "article",
          title: input.title,
          body: input.body,
          visibility: input.visibility,
          publishedAt: input.publish ? new Date() : null,
        })
        .returning();
      return post;
    }),

  createRoutineShare: protectedProcedure
    .input(
      z.object({
        routineId: z.number(),
        body: z.string().max(1000).nullable(),
        visibility: z.enum(["public", "followers", "organization"]).default("public"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [post] = await db
        .insert(posts)
        .values({
          authorId: ctx.userId,
          type: "routine_share",
          body: input.body,
          routineId: input.routineId,
          visibility: input.visibility,
          publishedAt: new Date(),
        })
        .returning();
      return post;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(200).optional(),
        body: z.string().optional(),
        visibility: z.enum(["public", "followers", "organization"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      const [post] = await db
        .update(posts)
        .set({ ...updates, updatedAt: new Date() })
        .where(and(eq(posts.id, id), eq(posts.authorId, ctx.userId)))
        .returning();
      return post ?? null;
    }),

  publish: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const [post] = await db
        .update(posts)
        .set({ publishedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(posts.id, input.id), eq(posts.authorId, ctx.userId)))
        .returning();
      return post ?? null;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(posts)
        .where(and(eq(posts.id, input.id), eq(posts.authorId, ctx.userId)));
      return { success: true };
    }),

  myDrafts: protectedProcedure.query(async ({ ctx }) => {
    return db
      .select()
      .from(posts)
      .where(
        and(
          eq(posts.authorId, ctx.userId),
          eq(posts.type, "article"),
          isNull(posts.publishedAt)
        )
      )
      .orderBy(desc(posts.updatedAt));
  }),
});
