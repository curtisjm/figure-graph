import { pgEnum } from "drizzle-orm/pg-core";

export const competitionLevelEnum = pgEnum("competition_level", [
  "newcomer", "bronze", "silver", "gold", "novice", "prechamp", "champ", "professional",
]);

export const levelEnum = pgEnum("level", [
  "student_teacher",
  "associate",
  "licentiate",
  "fellow",
]);

export const wallSegmentEnum = pgEnum("wall_segment", [
  "long1",
  "short1",
  "long2",
  "short2",
]);
