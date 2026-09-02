import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        parchment: "#F6F1E7",
        parchmentCard: "#FFFDF8",
        ink: "#1B2436",
        inkDeep: "#151D2C",
        gold: "#C9A227",
        goldDark: "#8A6D1A",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-franklin)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
