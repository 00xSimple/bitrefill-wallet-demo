import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Noto Sans SC", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        chinese: ["Noto Sans SC", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "10": "10px",
        "18": "18px",
        "20": "20px",
        "28": "28px",
        "34": "34px",
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1.33" }],
        "xs-plus": ["0.8125rem", { lineHeight: "1.538" }],
        "sm-plus": ["0.9375rem", { lineHeight: "1.5" }],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "122": "30.5rem",
      },
      keyframes: {
        "slide-in-from-right": {
          from: { transform: "translateX(100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "slide-in-from-right": "slide-in-from-right var(--duration-soft) var(--ease-emphasis)",
        "fade-in": "fade-in var(--duration-normal) var(--ease-emphasis)",
        "scale-in": "scale-in var(--duration-soft) var(--ease-emphasis)",
      },
    },
  },
  plugins: [],
};

export default config;
