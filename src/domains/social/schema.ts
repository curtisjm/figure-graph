import { index, pgEnum, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "@shared/schema";

export const followStatusEnum = pgEnum("follow_status", ["active", "pending"]);

export const follows = pgTable(
  "follows",
  {
    id: serial("id").primaryKey(),
    followerId: text("follower_id").references(() => users.id).notNull(),
    followingId: text("following_id").references(() => users.id).notNull(),
    status: followStatusEnum("status").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    followerIdx: index("follows_follower_idx").on(table.followerId),
    followingIdx: index("follows_following_idx").on(table.followingId),
    uniqueFollow: uniqueIndex("follows_unique_idx").on(table.followerId, table.followingId),
  })
);
