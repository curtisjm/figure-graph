import { router } from "./trpc";
import { danceRouter } from "@syllabus/routers/dance";
import { figureRouter } from "@syllabus/routers/figure";
import { routineRouter } from "@routines/routers/routine";
import { followRouter } from "@social/routers/follow";
import { profileRouter } from "@social/routers/profile";
import { postRouter } from "@social/routers/post";

export const appRouter = router({
  dance: danceRouter,
  figure: figureRouter,
  routine: routineRouter,
  follow: followRouter,
  profile: profileRouter,
  post: postRouter,
});

export type AppRouter = typeof appRouter;
