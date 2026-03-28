import { router, protectedProcedure } from "@shared/auth/trpc";
import { db } from "@shared/db";
import { eq } from "drizzle-orm";
import { conversationMembers } from "@messaging/schema";
import { createAblyTokenRequest } from "@messaging/lib/ably-server";

export const ablyAuthRouter = router({
  getToken: protectedProcedure.mutation(async ({ ctx }) => {
    const members = await db
      .select({ conversationId: conversationMembers.conversationId })
      .from(conversationMembers)
      .where(eq(conversationMembers.userId, ctx.userId));

    const conversationIds = members.map((m) => m.conversationId);

    return createAblyTokenRequest(ctx.userId, conversationIds);
  }),
});
