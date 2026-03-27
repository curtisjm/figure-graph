"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";
import { trpc } from "@shared/lib/trpc";
import { TiptapEditor } from "./editor/tiptap-editor";

interface ArticleEditorProps {
  existingPost?: {
    id: number;
    title: string | null;
    body: string | null;
    visibility: "public" | "followers" | "organization";
    publishedAt: Date | null;
  };
}

export function ArticleEditor({ existingPost }: ArticleEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(existingPost?.title ?? "");
  const [body, setBody] = useState(existingPost?.body ?? "");
  const [visibility, setVisibility] = useState<"public" | "followers" | "organization">(
    existingPost?.visibility ?? "public"
  );

  const createMutation = trpc.post.createArticle.useMutation({
    onSuccess: (post) => {
      router.push(`/posts/${post.id}`);
    },
  });

  const updateMutation = trpc.post.update.useMutation();
  const publishMutation = trpc.post.publish.useMutation({
    onSuccess: (post) => {
      if (post) router.push(`/posts/${post.id}`);
    },
  });

  // Auto-save for existing drafts (debounced)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const autoSave = useCallback(() => {
    if (!existingPost) return;
    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      updateMutation.mutate({
        id: existingPost.id,
        title: title || undefined,
        body: body || undefined,
        visibility,
      });
    }, 2000);
  }, [existingPost, title, body, visibility, updateMutation]);

  useEffect(() => {
    autoSave();
    return () => clearTimeout(saveTimeoutRef.current);
  }, [title, body, visibility, autoSave]);

  const handleSaveDraft = () => {
    if (existingPost) {
      updateMutation.mutate({
        id: existingPost.id,
        title: title || undefined,
        body: body || undefined,
        visibility,
      });
    } else {
      createMutation.mutate({ title, body, visibility, publish: false });
    }
  };

  const handlePublish = () => {
    if (existingPost) {
      publishMutation.mutate({ id: existingPost.id });
    } else {
      createMutation.mutate({ title, body, visibility, publish: true });
    }
  };

  const isPending =
    createMutation.isPending || updateMutation.isPending || publishMutation.isPending;
  const isPublished = !!existingPost?.publishedAt;

  return (
    <div className="space-y-6">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Article title"
        className="text-xl font-bold border-none px-0 focus-visible:ring-0"
      />

      <TiptapEditor
        content={body}
        onChange={setBody}
        placeholder="Start writing your article..."
      />

      <div className="flex items-center gap-4">
        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as typeof visibility)}
        >
          <option value="public">Public</option>
          <option value="followers">Followers only</option>
          <option value="organization">Organization only</option>
        </select>

        {!isPublished && (
          <Button variant="outline" onClick={handleSaveDraft} disabled={isPending}>
            Save Draft
          </Button>
        )}

        <Button onClick={handlePublish} disabled={isPending || !title}>
          {isPublished ? "Update" : "Publish"}
        </Button>
      </div>
    </div>
  );
}
