import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "wri-dark": "#1C1917",
        "wri-cream": "#FAFAF9",
        "wri-amber": "#D97706",
        "wri-border": "#E5E0D8",
      },
      fontFamily: {
        playfair: ['var(--font-playfair)', 'serif'],
        dmsans: ['var(--font-dmsans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
