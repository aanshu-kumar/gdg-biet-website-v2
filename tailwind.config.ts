import type { Config } from "tailwindcss";

const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" },
      screens: { "2xl": "1200px" },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-body)", "system-ui", "sans-serif"],
      },
      colors: {
        bg: token("bg"),
        surface: token("surface"),
        "surface-2": token("surface-2"),
        fg: token("fg"),
        muted: token("muted"),
        line: token("line"),
        primary: { DEFAULT: token("primary"), fg: token("primary-fg") },
        // Google brand colours, plus soft tints for chips and tiles.
        g: {
          blue: token("g-blue"),
          red: token("g-red"),
          yellow: token("g-yellow"),
          green: token("g-green"),
          "blue-tint": token("g-blue-tint"),
          "red-tint": token("g-red-tint"),
          "yellow-tint": token("g-yellow-tint"),
          "green-tint": token("g-green-tint"),
        },
      },
      borderRadius: { "4xl": "2rem" },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(var(--r, 0deg))" },
          "50%": { transform: "translateY(-14px) rotate(calc(var(--r, 0deg) + 6deg))" },
        },
        marquee: { to: { transform: "translateX(-50%)" } },
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        "float-slow": "float 11s ease-in-out infinite",
        "spin-slow": "spin 24s linear infinite",
        "spin-slower": "spin 40s linear infinite reverse",
        marquee: "marquee 45s linear infinite",
      },
      boxShadow: {
        card: "0 1px 2px rgb(60 64 67 / 0.15), 0 1px 3px 1px rgb(60 64 67 / 0.08)",
        lift: "0 1px 3px rgb(60 64 67 / 0.15), 0 4px 8px 3px rgb(60 64 67 / 0.1)",
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
