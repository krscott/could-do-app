import type { ReactNode } from "react";

const Icon = ({ children }: { children: ReactNode }) => {
  return <span className="grayscale brightness-75">{children}</span>;
};

export default Icon;
