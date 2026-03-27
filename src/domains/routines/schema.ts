import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { wallSegmentEnum } from "../../shared/db/enums";
import { users } from "../../shared/schema";
import { dances, figures } from "../syllabus/schema";

export { wallSegmentEnum } from "../../shared/db/enums";

export const routines = pgTable(
  "routines",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .references(() => users.id)
      .notNull(),
    danceId: integer("dance_id")
      .references(() => dances.id)
      .notNull(),
    name: text("name").notNull(),
    description: text("description"),
    isPublished: boolean("is_published").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("routines_user_idx").on(table.userId),
    danceIdx: index("routines_dance_idx").on(table.danceId),
  })
);

export const routineEntries = pgTable(
  "routine_entries",
  {
    id: serial("id").primaryKey(),
    routineId: integer("routine_id")
      .references(() => routines.id)
      .notNull(),
    figureId: integer("figure_id")
      .references(() => figures.id)
      .notNull(),
    position: integer("position").notNull(),
    wallSegment: wallSegmentEnum("wall_segment"),
    notes: text("notes"),
  },
  (table) => ({
    routineIdx: index("routine_entries_routine_idx").on(table.routineId),
    positionUnique: uniqueIndex("routine_entries_routine_position_idx").on(
      table.routineId,
      table.position
    ),
  })
);
