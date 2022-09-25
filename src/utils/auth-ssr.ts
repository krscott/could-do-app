import type { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../pages/api/auth/[...nextauth]";

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      session: await unstable_getServerSession(
        context.req,
        context.res,
        authOptions,
      ),
    },
  };
};
