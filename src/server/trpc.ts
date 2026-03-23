import { auth } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ensureUser } from "./auth";

export const createTRPCContext = async () => {
  try {
    const { userId } = await auth();
    return { userId: userId ?? null };
  } catch {
    return { userId: null };
  }
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  await ensureUser(ctx.userId);

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
