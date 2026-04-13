import { and, eq } from "drizzle-orm";
import { db } from "@shared/db";
import { follows } from "@social/schema";
import { memberships } from "@orgs/schema";

/**
 * Check if a post with given visibility fields is accessible to the viewer.
 * The post author can always see their own posts (including drafts).
 * Others can only see published posts matching their visibility level.
 */
export async function isPostAccessible(
  post: {
    authorId: string | null;
    visibility: "public" | "followers" | "organization";
    visibilityOrgId: number | null;
    publishedAt: Date | null;
  },
  viewerId: string | null
): Promise<boolean> {
  // Author can always see their own posts
  if (viewerId && post.authorId === viewerId) return true;

  // Drafts are not visible to others
  if (!post.publishedAt) return false;

  // Public posts are visible to anyone
  if (post.visibility === "public") return true;

  // Non-public posts require authentication
  if (!viewerId) return false;

  if (post.visibility === "followers" && post.authorId) {
    const [follow] = await db
      .select({ id: follows.id })
      .from(follows)
      .where(
        and(
          eq(follows.followerId, viewerId),
          eq(follows.followingId, post.authorId),
          eq(follows.status, "active")
        )
      );
    return !!follow;
  }

  if (post.visibility === "organization" && post.visibilityOrgId) {
    const [membership] = await db
      .select({ id: memberships.id })
      .from(memberships)
      .where(
        and(
          eq(memberships.userId, viewerId),
          eq(memberships.orgId, post.visibilityOrgId)
        )
      );
    return !!membership;
  }

  return false;
}
