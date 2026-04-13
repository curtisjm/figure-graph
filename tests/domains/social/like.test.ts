import { describe, it, expect, beforeEach } from "vitest";
import {
  createCaller,
  createPublicCaller,
  createUser,
  createPost,
  createOrg,
  truncateAll,
} from "../../setup/helpers";

describe("like router", () => {
  let userId: string;
  let postId: number;

  beforeEach(async () => {
    await truncateAll();
    const author = await createUser({ username: "author" });
    const liker = await createUser({ username: "liker" });
    userId = liker.id;
    const post = await createPost(author.id, { publishedAt: new Date() });
    postId = post.id;
  });

  describe("togglePost", () => {
    it("likes a post", async () => {
      const caller = createCaller(userId);
      const result = await caller.like.togglePost({ postId });
      expect(result.liked).toBe(true);
    });

    it("unlikes a post on second toggle", async () => {
      const caller = createCaller(userId);
      await caller.like.togglePost({ postId });
      const result = await caller.like.togglePost({ postId });
      expect(result.liked).toBe(false);
    });

    it("rejects liking a draft post", async () => {
      const author = await createUser({ username: "draft-author" });
      const draft = await createPost(author.id, { publishedAt: null });
      const caller = createCaller(userId);
      await expect(caller.like.togglePost({ postId: draft.id })).rejects.toThrow();
    });

    it("rejects liking a followers-only post without follow", async () => {
      const author = await createUser({ username: "private-author" });
      const post = await createPost(author.id, {
        visibility: "followers",
        publishedAt: new Date(),
      });
      const caller = createCaller(userId);
      await expect(caller.like.togglePost({ postId: post.id })).rejects.toThrow();
    });

    it("rejects liking an org-only post without membership", async () => {
      const owner = await createUser({ username: "org-owner" });
      const org = await createOrg(owner.id);
      const post = await createPost(owner.id, {
        visibility: "organization",
        visibilityOrgId: org.id,
        publishedAt: new Date(),
      });
      const caller = createCaller(userId);
      await expect(caller.like.togglePost({ postId: post.id })).rejects.toThrow();
    });
  });

  describe("postStatus", () => {
    it("returns like count and status", async () => {
      const caller = createCaller(userId);
      await caller.like.togglePost({ postId });

      const publicCaller = createPublicCaller();
      const status = await publicCaller.like.postStatus({ postId, userId });
      expect(status.count).toBe(1);
      expect(status.liked).toBe(true);
    });

    it("returns zero when not liked", async () => {
      const publicCaller = createPublicCaller();
      const status = await publicCaller.like.postStatus({ postId, userId });
      expect(status.count).toBe(0);
      expect(status.liked).toBe(false);
    });

    it("returns zero for a draft post", async () => {
      const author = await createUser({ username: "draft-author2" });
      const draft = await createPost(author.id, { publishedAt: null });
      const publicCaller = createPublicCaller();
      const status = await publicCaller.like.postStatus({ postId: draft.id, userId: null });
      expect(status.count).toBe(0);
      expect(status.liked).toBe(false);
    });

    it("returns zero for an org-only post when unauthenticated", async () => {
      const owner = await createUser({ username: "org-owner2" });
      const org = await createOrg(owner.id);
      const post = await createPost(owner.id, {
        visibility: "organization",
        visibilityOrgId: org.id,
        publishedAt: new Date(),
      });
      const publicCaller = createPublicCaller();
      const status = await publicCaller.like.postStatus({ postId: post.id, userId: null });
      expect(status.count).toBe(0);
      expect(status.liked).toBe(false);
    });
  });
});
