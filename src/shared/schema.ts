import { boolean, index, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { competitionLevelEnum, notificationTypeEnum } from "./db/enums";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").unique(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  competitionLevel: competitionLevelEnum("competition_level"),
  competitionLevelHigh: competitionLevelEnum("competition_level_high"),
  isPrivate: boolean("is_private").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    type: notificationTypeEnum("type").notNull(),
    actorId: text("actor_id").references(() => users.id),
    postId: integer("post_id"),
    commentId: integer("comment_id"),
    orgId: integer("org_id"),
    conversationId: integer("conversation_id"),
    read: boolean("read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userUnreadIdx: index("notifications_user_unread_idx").on(
      table.userId,
      table.read,
      table.createdAt
    ),
  })
);
