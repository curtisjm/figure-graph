import { eq } from "drizzle-orm";
import { getDb } from "@shared/db";
import { users } from "@shared/schema";

/**
 * Ensures a row exists in the users table for the given Clerk user ID.
 * Called from protectedProcedure so that FK constraints on routines and
 * figure_notes are satisfied on first use.
 */
export async function ensureUser(userId: string) {
  const db = getDb();
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId));

  if (!existing) {
    await db.insert(users).values({ id: userId });
  }
}
