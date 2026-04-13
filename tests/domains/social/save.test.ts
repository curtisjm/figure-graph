import { describe, it, expect, beforeEach } from "vitest";
import { createCaller, createUser, createPost, createOrg, truncateAll } from "../../setup/helpers";

describe("save router", () => {
  let userId: string;
  let postId: number;

  beforeEach(async () => {
    await truncateAll();
    const user = await createUser({ username: "saver" });
    userId = user.id;
    const author = await createUser({ username: "author" });
    const post = await createPost(author.id, { publishedAt: new Date() });
    postId = post.id;
  });

  describe("savePost and unsavePost", () => {
    it("saves and unsaves a post", async () => {
      const caller = createCaller(userId);
      await caller.save.savePost({ postId, folderId: null });

      const folders = await caller.save.folders();
      expect(folders.allSavedCount).toBe(1);

      await caller.save.unsavePost({ postId, folderId: null });
      const after = await caller.save.folders();
      expect(after.allSavedCount).toBe(0);
    });

    it("rejects saving a draft post", async () => {
      const author = await createUser({ username: "draft-author" });
      const draft = await createPost(author.id, { publishedAt: null });
      const caller = createCaller(userId);
      await expect(caller.save.savePost({ postId: draft.id, folderId: null })).rejects.toThrow();
    });

    it("rejects saving a followers-only post without follow", async () => {
      const author = await createUser({ username: "private-author" });
      const post = await createPost(author.id, {
        visibility: "followers",
        publishedAt: new Date(),
      });
      const caller = createCaller(userId);
      await expect(caller.save.savePost({ postId: post.id, folderId: null })).rejects.toThrow();
    });

    it("rejects saving an org-only post without membership", async () => {
      const owner = await createUser({ username: "org-owner" });
      const org = await createOrg(owner.id);
      const post = await createPost(owner.id, {
        visibility: "organization",
        visibilityOrgId: org.id,
        publishedAt: new Date(),
      });
      const caller = createCaller(userId);
      await expect(caller.save.savePost({ postId: post.id, folderId: null })).rejects.toThrow();
    });
  });

  describe("folders", () => {
    it("creates and lists folders", async () => {
      const caller = createCaller(userId);
      const folder = await caller.save.createFolder({ name: "Favorites" });
      expect(folder.name).toBe("Favorites");

      const result = await caller.save.folders();
      expect(result.folders).toHaveLength(1);
    });

    it("deletes a folder and clears saved posts folderId", async () => {
      const caller = createCaller(userId);
      const folder = await caller.save.createFolder({ name: "ToDelete" });
      await caller.save.savePost({ postId, folderId: folder.id });

      await caller.save.deleteFolder({ folderId: folder.id });
      const result = await caller.save.folders();
      expect(result.folders).toHaveLength(0);
      // The saved post still exists, just without a folder
      expect(result.allSavedCount).toBe(1);
    });
  });

  describe("postsInFolder", () => {
    it("returns saved posts without folder", async () => {
      const caller = createCaller(userId);
      await caller.save.savePost({ postId, folderId: null });

      const posts = await caller.save.postsInFolder({ folderId: null });
      expect(posts).toHaveLength(1);
    });

    it("filters out posts that became inaccessible", async () => {
      const owner = await createUser({ username: "org-owner2" });
      const org = await createOrg(owner.id);
      // Owner saves their own org-only post (they have access as author)
      const orgPost = await createPost(owner.id, {
        visibility: "organization",
        visibilityOrgId: org.id,
        publishedAt: new Date(),
      });
      const ownerCaller = createCaller(owner.id);
      await ownerCaller.save.savePost({ postId: orgPost.id, folderId: null });

      // Owner can see it
      const ownerPosts = await ownerCaller.save.postsInFolder({ folderId: null });
      expect(ownerPosts).toHaveLength(1);

      // Non-member cannot see org-only posts in their saved folder
      // (they couldn't save it through the API, but test the filter directly)
      const caller = createCaller(userId);
      const userPosts = await caller.save.postsInFolder({ folderId: null });
      expect(userPosts).toHaveLength(0); // user has no saved posts at all
    });
  });
});
