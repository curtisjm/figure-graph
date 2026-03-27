import Link from "next/link";
import { Card, CardContent, CardHeader } from "@shared/ui/card";
import { Badge } from "@shared/ui/badge";

interface PostCardProps {
  post: {
    id: number;
    type: "routine_share" | "article";
    title: string | null;
    body: string | null;
    publishedAt: Date | null;
    authorUsername: string | null;
    authorDisplayName: string | null;
    authorAvatarUrl: string | null;
  };
}

export function PostCard({ post }: PostCardProps) {
  const authorName = post.authorDisplayName ?? post.authorUsername ?? "Anonymous";
  const isArticle = post.type === "article";

  const preview = post.body
    ? post.body.replace(/<[^>]*>/g, "").slice(0, 200)
    : null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
            {post.authorAvatarUrl ? (
              <img
                src={post.authorAvatarUrl}
                alt={authorName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              authorName[0]?.toUpperCase() ?? "?"
            )}
          </div>

          <div className="flex-1 min-w-0">
            <Link
              href={`/users/${post.authorUsername}`}
              className="text-sm font-medium hover:underline"
            >
              {authorName}
            </Link>
            {post.publishedAt && (
              <p className="text-xs text-muted-foreground">
                {new Date(post.publishedAt).toLocaleDateString()}
              </p>
            )}
          </div>

          <Badge variant="secondary" className="text-xs">
            {isArticle ? "Article" : "Routine"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Link href={`/posts/${post.id}`} className="block">
          {post.title && (
            <h3 className="font-semibold mb-1 hover:underline">{post.title}</h3>
          )}
          {preview && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {preview}
            </p>
          )}
        </Link>
      </CardContent>
    </Card>
  );
}
