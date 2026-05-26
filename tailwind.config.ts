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
        app: "#f7fff0",
        brand: {
          50:  "#eefbe5",
          100: "#d9f7c7",
          200: "#b8ee91",
          300: "#8ee15a",
          400: "#6fd12f",
          500: "#58cc02",
          600: "#46a302",
          700: "#3a8505",
          800: "#31690a",
          900: "#2b570d",
          950: "#173706",
        },
        sky: {
          50: "#eef8ff",
          100: "#d9efff",
          200: "#bce4ff",
          300: "#8fd2ff",
          400: "#5bb7f2",
          500: "#1cb0f6",
          600: "#0b8ed0",
          700: "#0872a8",
          800: "#075f8a",
          900: "#0d4b70",
        },
        skyAction: {
          50: "#eef8ff",
          100: "#d9efff",
          200: "#bce4ff",
          300: "#8fd2ff",
          400: "#5bb7f2",
          500: "#1cb0f6",
          600: "#0b8ed0",
          700: "#0872a8",
        },
        reward: {
          50: "#fff8df",
          100: "#ffefaf",
          200: "#ffe071",
          300: "#ffcf32",
          400: "#ffc800",
          500: "#f6b800",
          600: "#c99000",
        },
        danger: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#ff4b4b",
          600: "#dc2626",
        },
        skybeat: "#1cb0f6",
        banana: "#ffc800",
        coral:  "#ff4b4b",
        grape:  "#ce82ff",
      },
      boxShadow: {
        soft: "0 16px 42px rgba(88, 204, 2, 0.12)",
        duo: "0 5px 0 rgba(0,0,0,0.12)",
        "duo-green": "0 5px 0 #46a302",
        "duo-blue": "0 5px 0 #0b8ed0",
        "duo-yellow": "0 5px 0 #c99000",
        button: "0 5px 0 #46a302",
      },
      borderRadius: {
        duo: "1.35rem",
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      fontFamily: {
        sans: ["Nunito", "Nunito Sans", "Avenir Next", "Arial Rounded MT Bold", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
