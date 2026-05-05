import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 20px 60px -24px rgb(15 23 42 / 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
