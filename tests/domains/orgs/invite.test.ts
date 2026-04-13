import { describe, it, expect, beforeEach } from "vitest";
import { createCaller, createUser, createOrg, truncateAll } from "../../setup/helpers";

describe("invite router", () => {
  let owner: { id: string };

  beforeEach(async () => {
    await truncateAll();
    owner = await createUser({ username: "owner" });
  });

  describe("generateLink", () => {
    it("generates a link invite with token", async () => {
      const org = await createOrg(owner.id);
      const caller = createCaller(owner.id);
      const invite = await caller.invite.generateLink({ orgId: org.id });
      expect(invite.token).toBeDefined();
      expect(invite.token!.length).toBeGreaterThan(0);
    });
  });
});
