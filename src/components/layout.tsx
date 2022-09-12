import type { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "./button";

const DEFAULT_DISCORD_AVATAR_URL =
  "https://cdn.discordapp.com/embed/avatars/1.png";

export const LoginLink = (): JSX.Element => {
  return <button onClick={() => signIn("discord")}>Login with Discord</button>;
};

export const LoginButton = (): JSX.Element => {
  return (
    <div>
      <Button onClick={() => signIn("discord")}>Login with Discord</Button>
    </div>
  );
};

export const Header: NextPage = (): JSX.Element => {
  const { data: session, status } = useSession();

  const user = session?.user;

  if (session && user === undefined) {
    console.error(`seission exists but user is undefined`);
  }

  return (
    <header className="w-full flex flex-row gap-4 items-center py-4 px-5">
      <div className="text-xl font-mono">
        <Link href="/">CouldDoApp</Link>
      </div>

      {/* Spacer */}
      <div className="grow"></div>

      {status === "loading" ? (
        <></>
      ) : !session || !user ? (
        <LoginLink />
      ) : (
        <>
          <Link href="/user">{user.name || "User"}</Link>
          <Link href="/user">
            <Image
              className="rounded-full align-middle cursor-pointer"
              alt="avatar"
              width={32}
              height={32}
              src={user.image || DEFAULT_DISCORD_AVATAR_URL}
            />
          </Link>
          <button onClick={() => signOut()}>Logout</button>
        </>
      )}
    </header>
  );
};

type LayoutProps = {
  title?: string;
  children?: ReactNode;
};

export const PageLayout = ({ title, children }: LayoutProps) => {
  return (
    <>
      <Header />
      <main className="flex flex-col items-center">
        <h1 className="text-3xl pt-4">{title ?? "Could-Do List"}</h1>

        <div className="pt-10 w-1/2 min-w-max">
          <>{children}</>
        </div>
      </main>
    </>
  );
};

type SessionLayoutProps = LayoutProps & {
  unauthorized?: JSX.Element;
};

/**
 * Only displays content if user is logged in. Otherwise, show login menu.
 */
export const SessionLayout = ({
  title,
  children,
  unauthorized,
}: SessionLayoutProps): JSX.Element => {
  const { data: session, status } = useSession();

  return status === "loading" ? (
    <div className="w-full text-center text-gray-700">Loading...</div>
  ) : !session ? (
    unauthorized ?? (
      <PageLayout title={title}>
        <div className="w-full flex flex-col gap-4 text-center">
          <div>You must be logged in to access this page</div>
          <LoginButton />
        </div>
      </PageLayout>
    )
  ) : (
    <PageLayout title={title}>
      <div className="w-full flex flex-col gap-4">{children}</div>
    </PageLayout>
  );
};
