import Link from "next/link";
import { useRouter } from "next/router";

type LinkTabsProps = {
  links: [title: string, href: string][];
};

export const LinkTabs = ({ links }: LinkTabsProps) => {
  const { pathname } = useRouter();

  return (
    <div className="flex gap-4 w-full">
      {links.map(([title, href]) =>
        href === pathname ? (
          <span className="font-bold text-gray-300 underline underline-offset-8 decoration-2 cursor-default">
            {title}
          </span>
        ) : (
          <span className="font-bold text-gray-500">
            <Link href={href}>{title}</Link>
          </span>
        ),
      )}
    </div>
  );
};

export const DoDoneTabs = () =>
  LinkTabs({
    links: [
      ["Do", "/"],
      ["Done", "/done"],
    ],
  });
