import { describe, it, expect, beforeEach } from "vitest";
import { createCaller, createUser, createConversation, truncateAll } from "../../setup/helpers";

describe("message router", () => {
  let alice: { id: string };
  let bob: { id: string };
  let conversationId: number;

  beforeEach(async () => {
    await truncateAll();
    alice = await createUser({ username: "alice" });
    bob = await createUser({ username: "bob" });
    const conv = await createConversation("direct", [alice.id, bob.id]);
    conversationId = conv.id;
  });

  describe("send", () => {
    it("sends a message", async () => {
      const caller = createCaller(alice.id);
      const message = await caller.message.send({
        conversationId,
        body: "Hello Bob!",
      });
      expect(message.body).toBe("Hello Bob!");
      expect(message.senderId).toBe(alice.id);
      expect(message.conversationId).toBe(conversationId);
    });

    it("rejects message from non-member", async () => {
      const charlie = await createUser({ username: "charlie" });
      const caller = createCaller(charlie.id);
      await expect(
        caller.message.send({ conversationId, body: "Unauthorized" })
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
    });
  });

  describe("history", () => {
    it("returns messages in chronological order", async () => {
      const caller = createCaller(alice.id);
      await caller.message.send({ conversationId, body: "First" });
      await caller.message.send({ conversationId, body: "Second" });
      await caller.message.send({ conversationId, body: "Third" });

      const result = await caller.message.history({ conversationId });
      expect(result.items).toHaveLength(3);
      expect(result.items[0].body).toBe("First");
      expect(result.items[2].body).toBe("Third");
    });

    it("supports cursor-based pagination", async () => {
      const caller = createCaller(alice.id);
      for (let i = 0; i < 5; i++) {
        await caller.message.send({ conversationId, body: `Message ${i}` });
      }

      const page1 = await caller.message.history({
        conversationId,
        limit: 3,
      });
      expect(page1.items).toHaveLength(3);
      expect(page1.nextCursor).toBeDefined();

      const page2 = await caller.message.history({
        conversationId,
        limit: 3,
        cursor: page1.nextCursor,
      });
      expect(page2.items).toHaveLength(2);
      expect(page2.nextCursor).toBeUndefined();
    });

    it("rejects history from non-member", async () => {
      const charlie = await createUser({ username: "charlie" });
      const caller = createCaller(charlie.id);
      await expect(
        caller.message.history({ conversationId })
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
    });
  });
});
