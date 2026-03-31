import { z } from "zod";
import { eq, and, lt, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "@shared/auth/trpc";
import { db } from "@shared/db";
import { users } from "@shared/schema";
import { conversations, conversationMembers, messages } from "@messaging/schema";
import { publishToConversation } from "@messaging/lib/ably-server";
import { createNotification } from "@social/lib/notify";

export const messageRouter = router({
  send: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        body: z.string().min(1).max(5000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify membership
      const member = await db.query.conversationMembers.findFirst({
        where: and(
          eq(conversationMembers.conversationId, input.conversationId),
          eq(conversationMembers.userId, ctx.userId)
        ),
      });

      if (!member) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not a member of this conversation" });
      }

      const [message] = await db
        .insert(messages)
        .values({
          conversationId: input.conversationId,
          senderId: ctx.userId,
          body: input.body,
        })
        .returning();

      // Update conversation updatedAt
      await db
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, input.conversationId));

      // Look up sender info for real-time payload
      const senderRow = await db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        })
        .from(users)
        .where(eq(users.id, ctx.userId))
        .then((rows) => rows[0] ?? null);

      // Publish to Ably with sender info
      await publishToConversation(input.conversationId, "message", {
        ...message,
        sender: senderRow,
      }).catch(() => {
        // Non-fatal: Ably publish failure should not break the mutation
      });

      // Get all members except sender
      const allMembers = await db
        .select({ userId: conversationMembers.userId })
        .from(conversationMembers)
        .where(eq(conversationMembers.conversationId, input.conversationId));

      const otherUserIds = allMembers
        .map((m) => m.userId)
        .filter((uid) => uid !== ctx.userId);

      await Promise.all(
        otherUserIds.map((userId) =>
          createNotification({
            userId,
            type: "message",
            actorId: ctx.userId,
            conversationId: input.conversationId,
          })
        )
      );

      return message;
    }),

  history: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        cursor: z.number().optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify membership
      const member = await db.query.conversationMembers.findFirst({
        where: and(
          eq(conversationMembers.conversationId, input.conversationId),
          eq(conversationMembers.userId, ctx.userId)
        ),
      });

      if (!member) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not a member of this conversation" });
      }

      const conditions = [eq(messages.conversationId, input.conversationId)];
      if (input.cursor !== undefined) {
        conditions.push(lt(messages.id, input.cursor));
      }

      const rows = await db
        .select({
          id: messages.id,
          conversationId: messages.conversationId,
          senderId: messages.senderId,
          body: messages.body,
          createdAt: messages.createdAt,
          sender: {
            id: users.id,
            username: users.username,
            displayName: users.displayName,
            avatarUrl: users.avatarUrl,
          },
        })
        .from(messages)
        .innerJoin(users, eq(messages.senderId, users.id))
        .where(and(...conditions))
        .orderBy(desc(messages.id))
        .limit(input.limit + 1);

      let nextCursor: number | undefined;
      if (rows.length > input.limit) {
        rows.pop();
        nextCursor = rows[rows.length - 1]!.id;
      }

      // Reverse for chronological order
      const chronological = rows.reverse();

      return { items: chronological, nextCursor };
    }),
});
