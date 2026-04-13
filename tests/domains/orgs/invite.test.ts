import { describe, it, expect, beforeEach } from "vitest";
import { createCaller, createUser, createOrg, createInvite, truncateAll } from "../../setup/helpers";

describe("invite router", () => {
  let owner: { id: string };
  let invitee: { id: string };

  beforeEach(async () => {
    await truncateAll();
    owner = await createUser({ username: "owner" });
    invitee = await createUser({ username: "invitee" });
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

  describe("accept", () => {
    it("accepts a direct invite", async () => {
      const org = await createOrg(owner.id);
      const invite = await createInvite(org.id, owner.id, {
        invitedUserId: invitee.id,
      });

      const inviteeCaller = createCaller(invitee.id);
      const result = await inviteeCaller.invite.accept({ inviteId: invite.id });
      expect(result.success).toBe(true);

      // Verify membership was created
      const membership = await inviteeCaller.membership.getMyMembership({
        orgId: org.id,
      });
      expect(membership.membership).not.toBeNull();
    });

    it("accepts a link invite", async () => {
      const org = await createOrg(owner.id);
      const ownerCaller = createCaller(owner.id);
      const invite = await ownerCaller.invite.generateLink({ orgId: org.id });

      const inviteeCaller = createCaller(invitee.id);
      const result = await inviteeCaller.invite.accept({ token: invite.token! });
      expect(result.success).toBe(true);
    });
  });

  describe("decline", () => {
    it("declines a direct invite", async () => {
      const org = await createOrg(owner.id);
      const invite = await createInvite(org.id, owner.id, {
        invitedUserId: invitee.id,
      });

      const inviteeCaller = createCaller(invitee.id);
      const result = await inviteeCaller.invite.decline({ inviteId: invite.id });
      expect(result.success).toBe(true);
    });
  });

  describe("listMyInvites", () => {
    it("returns pending invites for the user", async () => {
      const org = await createOrg(owner.id);
      await createInvite(org.id, owner.id, {
        invitedUserId: invitee.id,
      });

      const inviteeCaller = createCaller(invitee.id);
      const invites = await inviteeCaller.invite.listMyInvites();
      expect(invites).toHaveLength(1);
      expect(invites[0].orgId).toBe(org.id);
    });
  });
});
