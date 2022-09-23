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

/**
 * Check if window width satisfies tailwind media query 'sm'
 */
export const useMediaSm = () => {
  const windowWidth = useWindowWidth();

  return windowWidth >= 640;
};
