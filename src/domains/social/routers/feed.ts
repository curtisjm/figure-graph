import { z } from "zod";
import { and, desc, eq, inArray, isNotNull, lt, or } from "drizzle-orm";
import { protectedProcedure, publicProcedure, router } from "@shared/auth/trpc";
import { db } from "@shared/db";
import { users } from "@shared/schema";
import { posts, follows } from "@social/schema";

const FEED_PAGE_SIZE = 20;

const cursorInput = z.object({
  cursor: z
    .object({
      publishedAt: z.string(),
      id: z.number(),
    })
    .nullable()
    .optional(),
  limit: z.number().min(1).max(50).default(FEED_PAGE_SIZE),
});

export const feedRouter = router({
  following: protectedProcedure
    .input(cursorInput)
    .query(async ({ ctx, input }) => {
      const followedUsers = await db
        .select({ followingId: follows.followingId })
        .from(follows)
        .where(
          and(
            eq(follows.followerId, ctx.userId),
            eq(follows.status, "active")
          )
        );

      const followedIds = followedUsers.map((f) => f.followingId);

      if (followedIds.length === 0) {
        return { posts: [], nextCursor: null };
      }

      const cursorCondition = input.cursor
        ? or(
            lt(posts.publishedAt, new Date(input.cursor.publishedAt)),
            and(
              eq(posts.publishedAt, new Date(input.cursor.publishedAt)),
              lt(posts.id, input.cursor.id)
            )
          )
        : undefined;

      const feedPosts = await db
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
          authorUsername: users.username,
          authorDisplayName: users.displayName,
          authorAvatarUrl: users.avatarUrl,
        })
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id))
        .where(
          and(
            inArray(posts.authorId, followedIds),
            isNotNull(posts.publishedAt),
            or(
              eq(posts.visibility, "public"),
              eq(posts.visibility, "followers")
            ),
            cursorCondition
          )
        )
        .orderBy(desc(posts.publishedAt), desc(posts.id))
        .limit(input.limit + 1);

      const hasMore = feedPosts.length > input.limit;
      const results = hasMore ? feedPosts.slice(0, input.limit) : feedPosts;
      const lastPost = results[results.length - 1];

      return {
        posts: results,
        nextCursor: hasMore && lastPost?.publishedAt
          ? { publishedAt: lastPost.publishedAt.toISOString(), id: lastPost.id }
          : null,
      };
    }),

  explore: publicProcedure
    .input(cursorInput)
    .query(async ({ input }) => {
      const cursorCondition = input.cursor
        ? or(
            lt(posts.publishedAt, new Date(input.cursor.publishedAt)),
            and(
              eq(posts.publishedAt, new Date(input.cursor.publishedAt)),
              lt(posts.id, input.cursor.id)
            )
          )
        : undefined;

      const feedPosts = await db
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
          authorUsername: users.username,
          authorDisplayName: users.displayName,
          authorAvatarUrl: users.avatarUrl,
        })
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id))
        .where(
          and(
            eq(posts.visibility, "public"),
            isNotNull(posts.publishedAt),
            cursorCondition
          )
        )
        .orderBy(desc(posts.publishedAt), desc(posts.id))
        .limit(input.limit + 1);

      const hasMore = feedPosts.length > input.limit;
      const results = hasMore ? feedPosts.slice(0, input.limit) : feedPosts;
      const lastPost = results[results.length - 1];

      return {
        posts: results,
        nextCursor: hasMore && lastPost?.publishedAt
          ? { publishedAt: lastPost.publishedAt.toISOString(), id: lastPost.id }
          : null,
      };
    }),
});
