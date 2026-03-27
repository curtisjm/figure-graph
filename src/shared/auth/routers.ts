import { router } from "./trpc";
import { danceRouter } from "@syllabus/routers/dance";
import { figureRouter } from "@syllabus/routers/figure";
import { routineRouter } from "@routines/routers/routine";

export const appRouter = router({
  dance: danceRouter,
  figure: figureRouter,
  routine: routineRouter,
});

export type AppRouter = typeof appRouter;
