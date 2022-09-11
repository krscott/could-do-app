import { useSession } from "next-auth/react";
import type { ReactNode } from "react";
import { HeaderMenu, LoginButton } from "./header-menu";

type LayoutProps = {
  title?: string;
  children?: ReactNode;
};

export const Layout = ({ title, children }: LayoutProps) => {
  return (
    <>
      <HeaderMenu />
      <main className="flex flex-col items-center">
        <h1 className="text-3xl pt-4">{title ?? "Could-Do List"}</h1>

        <div className="pt-10 w-1/2 min-w-max">
          <>{children}</>
        </div>
      </main>
    </>
  );
};

/**
 * Only displays content if user is logged in. Otherwise, show login menu.
 */
export const SessionLayout = ({ title, children }: LayoutProps) => {
  const { data: session, status } = useSession();

  return (
    <Layout title={title}>
      {status === "loading" ? (
        <div className="w-full text-center text-gray-700">Loading...</div>
      ) : !session ? (
        <div className="w-full text-center">
          <LoginButton />
        </div>
      ) : (
        <div className="w-full flex flex-col gap-4">{children}</div>
      )}
    </Layout>
  );
};
