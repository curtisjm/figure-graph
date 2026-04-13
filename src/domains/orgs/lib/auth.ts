import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { db } from "@shared/db";
import { organizations, memberships } from "@orgs/schema";

export async function requireAdminOrOwner(orgId: number, userId: string) {
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, orgId),
  });

  if (!org) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });
  }

  const isOwner = org.ownerId === userId;

  if (!isOwner) {
    const membership = await db.query.memberships.findFirst({
      where: and(eq(memberships.orgId, orgId), eq(memberships.userId, userId)),
    });

    if (!membership || membership.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin or owner required" });
    }
  }

  return org;
}
