/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // "LaoKip Ledger" token system — inspired by Lao silk weaving + paper ledgers
        ink: "#16233D",       // primary text / dark surface
        indigo: {
          DEFAULT: "#2F4C7A", // brand / primary actions
          50: "#EEF2F8",
          100: "#D7E0EE",
          600: "#2F4C7A",
          700: "#233A5F",
        },
        gold: {
          DEFAULT: "#C9A227", // accent, positive highlight, CTA
          50: "#FBF6E7",
          600: "#C9A227",
          700: "#A6841D",
        },
        paper: "#F7F4EC",     // app background
        bamboo: {
          DEFAULT: "#4E7D5D", // income / positive
          50: "#EAF2ED",
        },
        lotus: {
          DEFAULT: "#B85C55", // expense / negative
          50: "#F8ECEB",
        },
      },
      fontFamily: {
        display: ["Sora", "Noto Sans Lao", "sans-serif"],
        body: ["Inter", "Noto Sans Lao", "sans-serif"],
      },
      backgroundImage: {
        "stitch-line":
          "repeating-linear-gradient(90deg, currentColor 0 8px, transparent 8px 16px)",
      },
    },
  },
  plugins: [],
};
