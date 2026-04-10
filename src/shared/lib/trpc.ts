import { createTRPCReact } from "@trpc/react-query";
import type { inferRouterOutputs, inferRouterInputs } from "@trpc/server";
import type { AppRouter } from "@shared/auth/routers";

export const trpc = createTRPCReact<AppRouter>();

export type RouterOutput = inferRouterOutputs<AppRouter>;
export type RouterInput = inferRouterInputs<AppRouter>;
