import { TRPCError } from "@trpc/server";
import { Session } from "next-auth";

type ContextType = {
  session: Session | null;
  prisma: unknown;
};

export const getSessionUserId = (ctx: ContextType) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const userId = ctx.session.user?.id;

  if (!userId) {
    console.error(`Invalid user id: ${userId}`);
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return userId;
};
