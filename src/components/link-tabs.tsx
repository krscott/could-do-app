import Link from "next/link";
import { useRouter } from "next/router";

export type LinkTabProps = readonly [title: string, href: string];

type LinkTabsProps = {
  links: LinkTabProps[];
};

export const LinkTabs = ({ links }: LinkTabsProps) => {
  const { asPath } = useRouter();

  return (
    <div className="flex gap-4 w-full">
      {links.map(([title, href]) => {
        if (!href) {
          href = "/";
        }

        return href === asPath ? (
          <span
            key={href}
            className="font-bold text-gray-300 underline underline-offset-8 decoration-2 cursor-default"
          >
            {title}
          </span>
        ) : (
          <span key={href} className="font-bold text-gray-500">
            <Link href={href}>{title}</Link>
          </span>
        );
      })}
    </div>
  );
};
