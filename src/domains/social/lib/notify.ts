import { db } from "@shared/db";
import { notifications } from "@shared/schema";
import { eq, and, gte } from "drizzle-orm";

interface NotifyParams {
  userId: string;
  type: typeof notifications.$inferInsert.type;
  actorId?: string;
  postId?: number;
  commentId?: number;
  orgId?: number;
  conversationId?: number;
}

const AGGREGATION_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const AGGREGATABLE_TYPES = new Set(["like", "comment"]);

/**
 * Create a notification. For aggregatable types (like, comment),
 * skips if a recent notification of the same type+target exists.
 * Never notifies the user about their own actions.
 */
export async function createNotification(params: NotifyParams) {
  if (params.actorId && params.actorId === params.userId) return;

  if (AGGREGATABLE_TYPES.has(params.type) && params.postId) {
    const windowStart = new Date(Date.now() - AGGREGATION_WINDOW_MS);
    const existing = await db.query.notifications.findFirst({
      where: and(
        eq(notifications.userId, params.userId),
        eq(notifications.type, params.type),
        eq(notifications.postId, params.postId),
        gte(notifications.createdAt, windowStart)
      ),
    });
    if (existing) return;
  }

  await db.insert(notifications).values({
    userId: params.userId,
    type: params.type,
    actorId: params.actorId,
    postId: params.postId,
    commentId: params.commentId,
    orgId: params.orgId,
    conversationId: params.conversationId,
  });
}

/**
 * Create notifications for multiple users (e.g., all org members).
 */
export async function createBulkNotifications(
  userIds: string[],
  params: Omit<NotifyParams, "userId">
) {
  const rows = userIds
    .filter((uid) => uid !== params.actorId)
    .map((userId) => ({
      userId,
      type: params.type,
      actorId: params.actorId,
      postId: params.postId,
      commentId: params.commentId,
      orgId: params.orgId,
      conversationId: params.conversationId,
    }));

  if (rows.length === 0) return;
  await db.insert(notifications).values(rows);
}
