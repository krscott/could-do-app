import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "./button";

// const DEFAULT_AVATAR_URL =
//   "https://cdn.discordapp.com/embed/avatars/1.png";

// TODO
const DEFAULT_AVATAR_URL = "/favicon.ico";

export const LoginLink = (): JSX.Element => {
  return <button onClick={() => signIn()}>Sign Up or Login</button>;
};

export const LoginButton = (): JSX.Element => {
  return (
    <div>
      <Button onClick={() => signIn()}>Sign Up or Login</Button>
    </div>
  );
};

export const Header = ({ title }: { title?: string }): JSX.Element => {
  const { data: session, status } = useSession();

  const user = session?.user;

  if (session && user === undefined) {
    console.error(`seission exists but user is undefined`);
  }

  return (
    <header className="w-full h-16 flex flex-row gap-4 items-center px-5">
      <div className="hidden md:block text-xl font-mono">
        <Link href="/">CouldDo.app</Link>
      </div>

      <h1 className="block md:hidden text-xl md:text-3xl pt-4 self-baseline">
        {title}
      </h1>

      {/* Spacer */}
      <div className="grow"></div>

      {status === "loading" ? (
        <></>
      ) : !session || !user ? (
        <LoginLink />
      ) : (
        <>
          <Link href="/user">{user.name || "User Settings"}</Link>
          <Link href="/user">
            <a className="hidden md:block [&>*]:align-middle">
              <Image
                className="rounded-full"
                alt="avatar"
                width={32}
                height={32}
                src={user.image || DEFAULT_AVATAR_URL}
              />
            </a>
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
      <Header title={title} />
      <main className="flex flex-col md:gap-8 items-center">
        {title && (
          <h1 className="hidden md:block text-xl md:text-3xl pt-4">{title}</h1>
        )}
        <div className="p-6 w-full sm:max-w-screen-sm">{children}</div>
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
    <PageLayout title={title}>
      <div className="w-full text-center text-gray-500">Loading...</div>
    </PageLayout>
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
