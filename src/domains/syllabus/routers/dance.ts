import { publicProcedure, router } from "@shared/auth/trpc";
import { db } from "@shared/db";
import { dances } from "@syllabus/schema";

export const danceRouter = router({
  list: publicProcedure.query(async () => {
    return db.select().from(dances);
  }),
});
