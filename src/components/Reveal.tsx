"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * - Fades [data-reveal] elements up as they scroll into view. Content is only
 *   hidden once this has run (see `.js` in globals.css), so it's always visible
 *   without JavaScript.
 * - Marks [data-motion] containers with data-onscreen while visible, so their
 *   looping animations only run when someone can see them.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const reveals = document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-visible])");
    const motion = document.querySelectorAll<HTMLElement>("[data-motion]");
    if (!("IntersectionObserver" in window)) {
      reveals.forEach((el) => el.setAttribute("data-visible", ""));
      motion.forEach((el) => el.setAttribute("data-onscreen", ""));
      return;
    }

    const revealIO = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute("data-visible", "");
          revealIO.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    reveals.forEach((el) => revealIO.observe(el));

    const motionIO = new IntersectionObserver((entries) => {
      for (const e of entries) e.target.toggleAttribute("data-onscreen", e.isIntersecting);
    });
    motion.forEach((el) => motionIO.observe(el));

    return () => {
      revealIO.disconnect();
      motionIO.disconnect();
    };
  }, [pathname]);

  return null;
}
