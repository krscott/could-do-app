import { useState, useEffect } from "react";

export const useWindowWidth = () => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window === "undefined" ? 0 : window.innerWidth,
  );

  useEffect(() => {
    const onResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return windowWidth;
};
