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

/**
 * Check if user prefers reduced motion (if SSR, assume `prefers-reduced-motion` is set)
 */

const mediaMotionNoPrefMatch =
  typeof window === "undefined"
    ? undefined
    : window.matchMedia("(prefers-reduced-motion: no-preference)");

export const usePrefersReducedMotion = (): boolean => {
  const [prm, setPrm] = useState(
    mediaMotionNoPrefMatch ? !mediaMotionNoPrefMatch.matches : true,
  );

  useEffect(() => {
    if (!mediaMotionNoPrefMatch) {
      return;
    }

    const onChange = (e: MediaQueryListEvent) => {
      setPrm(!e.matches);
    };

    mediaMotionNoPrefMatch.addEventListener("change", onChange);
    return () => mediaMotionNoPrefMatch.removeEventListener("change", onChange);
  }, []);

  return prm;
};
