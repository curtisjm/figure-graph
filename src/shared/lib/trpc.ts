import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@shared/auth/routers";

export const trpc = createTRPCReact<AppRouter>();
