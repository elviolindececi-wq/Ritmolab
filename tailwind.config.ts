import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f1ffe7",
          100: "#ddf8c6",
          200: "#baf08e",
          300: "#8ee854",
          400: "#6ed812",
          500: "#58cc02",
          600: "#46a302",
          700: "#347b01",
          800: "#245501",
          900: "#143000",
          950: "#0a1800",
        },
        // Semantic aliases used across the app
        sky:    "#1cb0f6",
        skybeat:"#1cb0f6",
        banana: "#ffd43b",
        coral:  "#ff4b4b",
        grape:  "#ce82ff",
      },
      boxShadow: {
        soft:   "0 18px 50px rgba(70, 163, 2, 0.14)",
        button: "0 6px 0 rgba(52,123,1,.9)",
        duo:    "0 4px 0 rgba(52,123,1,.7)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
