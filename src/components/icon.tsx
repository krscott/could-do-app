import type { ReactNode } from "react";

type IconProps = {
  children: ReactNode;
};

export const Icon = ({ children }: IconProps) => {
  return <span className={"grayscale brightness-75"}>{children}</span>;
};

export const IconHover = ({ children }: IconProps) => {
  return (
    <span className={"grayscale brightness-50 hover:brightness-100"}>
      {children}
    </span>
  );
};
