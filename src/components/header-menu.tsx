import type { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";

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
    <header className="w-full flex flex-row justify-end space-x-4 p-4">
      {status === "loading" ? (
        <>Loading...</>
      ) : !session || !userId ? (
        <LoginButton />
      ) : (
        <>
          <p>Hello, {session.user?.name}</p>
          <button onClick={() => signOut()}>Logout</button>
        </>
      )}
    </header>
  );
};
