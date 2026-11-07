"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const toggle = () => {
    const dark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-fg"
    >
      <Sun className="hidden size-5 dark:block" />
      <Moon className="size-5 dark:hidden" />
    </button>
  );
}

/** Inline script for <head>: applies the saved/system theme before first paint. */
export const themeScript = `(function(){document.documentElement.classList.add("js");try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`;
