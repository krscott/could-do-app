import type { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export const LoginButton = (): JSX.Element => {
  return <button onClick={() => signIn("discord")}>Login with Discord</button>;
};

export const HeaderMenu: NextPage = (): JSX.Element => {
  const { data: session, status } = useSession();

  const userId = session?.user?.id;

  if (session && !userId) {
    console.error(`seission exists but user id is invalid: ${userId}`);
  }

  return (
    <header className="w-full flex flex-row items-baseline space-x-4 py-4 px-5">
      <div className="text-xl font-mono">
        <Link href="/">CouldDoApp</Link>
      </div>

      {/* Spacer */}
      <div className="grow"></div>

      {status === "loading" ? (
        <></>
      ) : !session || !userId ? (
        <LoginButton />
      ) : (
        <>
          <Link href="/user">{session.user?.name}</Link>
          <button onClick={() => signOut()}>Logout</button>
        </>
      )}
    </header>
  );
};
