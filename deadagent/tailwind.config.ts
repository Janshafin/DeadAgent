import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        obsidian: "var(--obsidian)",
        gold: {
          DEFAULT: "var(--gold)",
          light: "var(--gold-light)",
        },
        ivory: "var(--ivory)",
      },
      fontFamily: {
        sans: ['"Josefin Sans"', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
