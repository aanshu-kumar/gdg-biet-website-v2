"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const SELECTOR = "[data-reveal]:not([data-visible]), [data-motion]";

/**
 * - Fades [data-reveal] elements up as they scroll into view. Content is only
 *   hidden once this has run (see `.js` in globals.css), so it's always visible
 *   without JavaScript.
 * - Marks [data-motion] containers with data-onscreen while visible, so their
 *   looping animations only run when someone can see them.
 *
 * Elements added after the page loads (e.g. switching year on /team swaps in a
 * new set of cards) are picked up by a MutationObserver; otherwise they'd stay
 * hidden forever.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const supported = "IntersectionObserver" in window;

    const revealIO = supported
      ? new IntersectionObserver(
          (entries) => {
            for (const e of entries) {
              if (!e.isIntersecting) continue;
              e.target.setAttribute("data-visible", "");
              revealIO!.unobserve(e.target);
            }
          },
          { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
        )
      : null;

    const motionIO = supported
      ? new IntersectionObserver((entries) => {
          for (const e of entries) e.target.toggleAttribute("data-onscreen", e.isIntersecting);
        })
      : null;

    const watch = (el: Element) => {
      if (el.matches("[data-reveal]:not([data-visible])")) {
        if (revealIO) revealIO.observe(el);
        else el.setAttribute("data-visible", "");
      }
      if (el.matches("[data-motion]")) {
        if (motionIO) motionIO.observe(el);
        else el.setAttribute("data-onscreen", "");
      }
    };

    // An added subtree's root isn't included in its own querySelectorAll, so check it separately.
    const watchTree = (root: Element | Document) => {
      if (root instanceof Element) watch(root);
      root.querySelectorAll(SELECTOR).forEach(watch);
    };

    watchTree(document);

    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (node instanceof Element) watchTree(node);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      revealIO?.disconnect();
      motionIO?.disconnect();
    };
  }, [pathname]);

  return null;
}
