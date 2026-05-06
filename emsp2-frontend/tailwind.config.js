export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FACC15",
        secondary: "#22C55E",
        dark: "#1E293B",
        maxton: {
          navy: "#0f1535",
          navy2: "#181f4a",
          ink: "#070c29",
          surface: "#f4f7fb",
        },
      },
      boxShadow: {
        maxton: "0 8px 26px -12px rgba(15, 23, 42, 0.2)",
        "maxton-card": "0 12px 40px -18px rgba(15, 21, 53, 0.18)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        30: "7.5rem",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 400ms ease-out",
        slideUp: "slideUp 500ms ease-out",
      },
    },
  },
  plugins: [],
};
