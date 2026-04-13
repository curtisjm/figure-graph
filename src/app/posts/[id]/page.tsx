import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@shared/db";
import { users } from "@shared/schema";
import { posts, follows } from "@social/schema";
import { memberships } from "@orgs/schema";
import { ArticleRenderer } from "@/domains/social/components/article-renderer";
import { CommentThread } from "@/domains/social/components/comment-thread";
import { Badge } from "@shared/ui/badge";
import Link from "next/link";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDb();
  const { userId } = await auth();

  const [post] = await db
    .select({
      id: posts.id,
      authorId: posts.authorId,
      type: posts.type,
      visibility: posts.visibility,
      visibilityOrgId: posts.visibilityOrgId,
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
    .where(eq(posts.id, parseInt(id, 10)));

  if (!post) notFound();

  // Author can always see their own posts
  const isAuthor = userId && post.authorId === userId;

  if (!isAuthor) {
    // Drafts are not visible to others
    if (!post.publishedAt) notFound();

    if (post.visibility === "followers") {
      // Followers-only: must be authenticated and following
      if (!userId || !post.authorId) notFound();
      const [follow] = await db
        .select({ id: follows.id })
        .from(follows)
        .where(
          and(
            eq(follows.followerId, userId),
            eq(follows.followingId, post.authorId),
            eq(follows.status, "active")
          )
        );
      if (!follow) notFound();
    } else if (post.visibility === "organization") {
      // Org-only: must be authenticated and a member
      if (!userId || !post.visibilityOrgId) notFound();
      const [membership] = await db
        .select({ id: memberships.id })
        .from(memberships)
        .where(
          and(
            eq(memberships.userId, userId),
            eq(memberships.orgId, post.visibilityOrgId)
          )
        );
      if (!membership) notFound();
    }
  }

  const authorName = post.authorDisplayName ?? post.authorUsername ?? "Anonymous";

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/users/${post.authorUsername}`}
          className="text-sm font-medium hover:underline"
        >
          {authorName}
        </Link>
        {post.publishedAt && (
          <span className="text-xs text-muted-foreground">
            {new Date(post.publishedAt).toLocaleDateString()}
          </span>
        )}
        <Badge variant="secondary" className="text-xs">
          {post.type === "article" ? "Article" : "Routine Share"}
        </Badge>
      </div>

      {post.title && <h1 className="text-3xl font-bold mb-6">{post.title}</h1>}

      {post.body && <ArticleRenderer html={post.body} />}

      <div className="mt-8">
        <CommentThread postId={post.id} />
      </div>
    </div>
  );
}
