"use client";

import { useState } from "react";
import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";
import { trpc } from "@shared/lib/trpc";
import { TiptapEditor } from "@social/components/editor/tiptap-editor";

interface OrgPostComposerProps {
  orgId: number;
}

export function OrgPostComposer({ orgId }: OrgPostComposerProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<"public" | "followers" | "organization">(
    "public"
  );
  const [expanded, setExpanded] = useState(false);

  const utils = trpc.useUtils();

  const createMutation = trpc.orgPost.create.useMutation({
    onSuccess: () => {
      setTitle("");
      setBody("");
      setVisibility("public");
      setExpanded(false);
      utils.orgPost.listByOrg.invalidate({ orgId });
    },
  });

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full rounded-lg border border-dashed border-muted-foreground/30 px-4 py-3 text-left text-sm text-muted-foreground hover:border-muted-foreground/60 hover:bg-muted/50 transition-colors"
      >
        Write a post for this organization...
      </button>
    );
  }

  const handlePublish = () => {
    createMutation.mutate({
      orgId,
      type: "article",
      title: title || undefined,
      body: body || undefined,
      visibility,
      publish: true,
    });
  };

  const handleSaveDraft = () => {
    createMutation.mutate({
      orgId,
      type: "article",
      title: title || undefined,
      body: body || undefined,
      visibility,
      publish: false,
    });
  };

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title"
        className="text-lg font-semibold border-none px-0 focus-visible:ring-0"
      />

      <TiptapEditor
        content={body}
        onChange={setBody}
        placeholder="Write something..."
      />

      <div className="flex items-center gap-3">
        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as typeof visibility)}
        >
          <option value="public">Public</option>
          <option value="followers">Followers only</option>
          <option value="organization">Organization only</option>
        </select>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(false)}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={createMutation.isPending}
          >
            Save Draft
          </Button>
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={createMutation.isPending || !title}
          >
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
}
