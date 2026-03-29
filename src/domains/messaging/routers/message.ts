import { z } from "zod";
import { eq, and, lt, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "@shared/auth/trpc";
import { db } from "@shared/db";
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

      // Publish to Ably
      await publishToConversation(input.conversationId, "message", message).catch(() => {
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

      const items = await db
        .select()
        .from(messages)
        .where(and(...conditions))
        .orderBy(desc(messages.id))
        .limit(input.limit + 1);

      let nextCursor: number | undefined;
      if (items.length > input.limit) {
        items.pop();
        nextCursor = items[items.length - 1]!.id;
      }

      // Reverse for chronological order
      const chronological = items.reverse();

      return { items: chronological, nextCursor };
    }),
});
