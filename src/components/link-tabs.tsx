import Link from "next/link";

type LinkTabsProps = {
  currentHref: string;
  links: [title: string, href: string][];
};

export const LinkTabs = ({ currentHref, links }: LinkTabsProps) => {
  return (
    <div className="flex gap-4 w-full">
      {links.map(([title, href]) =>
        href === currentHref ? (
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

export const TaskTableTabs = ({ currentHref }: { currentHref: string }) =>
  LinkTabs({
    currentHref,
    links: [
      ["Do", "/"],
      ["Done", "/completed"],
    ],
  });
