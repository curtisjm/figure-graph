import { z } from "zod";
import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { protectedProcedure, router } from "@shared/auth/trpc";
import { db } from "@shared/db";
import { saveFolders, savedPosts, posts } from "@social/schema";
import { users } from "@shared/schema";

export const saveRouter = router({
  folders: protectedProcedure.query(async ({ ctx }) => {
    const folders = await db
      .select()
      .from(saveFolders)
      .where(eq(saveFolders.userId, ctx.userId))
      .orderBy(asc(saveFolders.name));

    const [allSavedCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(savedPosts)
      .where(
        and(
          eq(savedPosts.userId, ctx.userId),
          isNull(savedPosts.folderId)
        )
      );

    const folderCounts = folders.length > 0
      ? await db
          .select({
            folderId: savedPosts.folderId,
            count: sql<number>`count(*)::int`,
          })
          .from(savedPosts)
          .where(eq(savedPosts.userId, ctx.userId))
          .groupBy(savedPosts.folderId)
      : [];

    const countMap = new Map(
      folderCounts.map((fc) => [fc.folderId, fc.count])
    );

    return {
      allSavedCount: allSavedCount?.count ?? 0,
      folders: folders.map((f) => ({
        ...f,
        postCount: countMap.get(f.id) ?? 0,
      })),
    };
  }),

  createFolder: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const [folder] = await db
        .insert(saveFolders)
        .values({ userId: ctx.userId, name: input.name })
        .returning();
      return folder;
    }),

  deleteFolder: protectedProcedure
    .input(z.object({ folderId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .update(savedPosts)
        .set({ folderId: null })
        .where(
          and(
            eq(savedPosts.folderId, input.folderId),
            eq(savedPosts.userId, ctx.userId)
          )
        );

      await db
        .delete(saveFolders)
        .where(
          and(
            eq(saveFolders.id, input.folderId),
            eq(saveFolders.userId, ctx.userId)
          )
        );

      return { success: true };
    }),

  savePost: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        folderId: z.number().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db
        .insert(savedPosts)
        .values({
          userId: ctx.userId,
          postId: input.postId,
          folderId: input.folderId,
        })
        .onConflictDoNothing();
      return { success: true };
    }),

  unsavePost: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        folderId: z.number().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const conditions = [
        eq(savedPosts.userId, ctx.userId),
        eq(savedPosts.postId, input.postId),
      ];
      if (input.folderId === null) {
        conditions.push(isNull(savedPosts.folderId));
      } else {
        conditions.push(eq(savedPosts.folderId, input.folderId));
      }
      await db.delete(savedPosts).where(and(...conditions));
      return { success: true };
    }),

  postFolders: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ ctx, input }) => {
      const saved = await db
        .select({ folderId: savedPosts.folderId })
        .from(savedPosts)
        .where(
          and(
            eq(savedPosts.userId, ctx.userId),
            eq(savedPosts.postId, input.postId)
          )
        );
      return saved.map((s) => s.folderId);
    }),

  postsInFolder: protectedProcedure
    .input(z.object({ folderId: z.number().nullable() }))
    .query(async ({ ctx, input }) => {
      const conditions = [eq(savedPosts.userId, ctx.userId)];
      if (input.folderId === null) {
        conditions.push(isNull(savedPosts.folderId));
      } else {
        conditions.push(eq(savedPosts.folderId, input.folderId));
      }

      return db
        .select({
          savedPostId: savedPosts.id,
          postId: posts.id,
          type: posts.type,
          title: posts.title,
          body: posts.body,
          publishedAt: posts.publishedAt,
          authorUsername: users.username,
          authorDisplayName: users.displayName,
          authorAvatarUrl: users.avatarUrl,
        })
        .from(savedPosts)
        .innerJoin(posts, eq(savedPosts.postId, posts.id))
        .leftJoin(users, eq(posts.authorId, users.id))
        .where(and(...conditions))
        .orderBy(asc(savedPosts.createdAt));
    }),
});
