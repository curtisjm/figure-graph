import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { competitionLevelEnum } from "./db/enums";

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
