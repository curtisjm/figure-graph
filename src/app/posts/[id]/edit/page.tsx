"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { trpc } from "@shared/lib/trpc";
import { ArticleEditor } from "@/domains/social/components/article-editor";

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: post, isLoading } = trpc.post.get.useQuery({
    id: parseInt(id, 10),
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!post) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-xl font-bold mb-4 sm:text-2xl sm:mb-6">Edit Article</h1>
      <ArticleEditor
        existingPost={{
          id: post.id,
          title: post.title,
          body: post.body,
          visibility: post.visibility as "public" | "followers" | "organization",
          visibilityOrgId: post.visibilityOrgId,
          publishedAt: post.publishedAt,
        }}
      />
    </div>
  );
}
