/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        champagne: {
          50: "#fdf8f3",
          100: "#f9ede3",
          200: "#f0dcc8",
          300: "#e4c4a4",
          400: "#d5a578",
          500: "#c88956",
          600: "#b86f47",
          700: "#99593c",
          800: "#7d4a36",
          900: "#673f31",
        },
        blush: {
          50: "#fdf2f4",
          100: "#fce7eb",
          200: "#f9d0d9",
          300: "#f4aab9",
          400: "#ec7d95",
          500: "#df5075",
          600: "#cb3460",
          700: "#ab2750",
          800: "#8f2348",
          900: "#7a2143",
        },
        velvet: {
          950: "#1e0b14",
          900: "#2d1220",
        },
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        invite: ["Cormorant Garamond", "Georgia", "serif"],
        script: ["Great Vibes", "cursive"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 8s ease-in-out infinite",
        drift: "drift 12s ease-in-out infinite",
        stepIn: "stepIn 0.4s ease-out forwards",
        pageNext: "pageNext 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        pagePrev: "pagePrev 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        glow: "glow 10s ease-in-out infinite",
        twinkle: "twinkle 4s ease-in-out infinite",
      },
      keyframes: {
        stepIn: {
          "0%": { opacity: "0", transform: "translateX(14px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pageNext: {
          "0%": { opacity: "0", transform: "translateX(1.75rem)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pagePrev: {
          "0%": { opacity: "0", transform: "translateX(-1.75rem)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.95" },
        },
        drift: {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "50%": { transform: "translate(8px, -6px) rotate(3deg)" },
        },
        glow: {
          "0%, 100%": {
            boxShadow:
              "0 0 40px -8px rgba(236, 125, 149, 0.35), 0 0 80px -20px rgba(251, 191, 36, 0.2)",
          },
          "50%": {
            boxShadow:
              "0 0 56px -6px rgba(192, 132, 252, 0.45), 0 0 100px -16px rgba(236, 125, 149, 0.35)",
          },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.25", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.15)" },
        },
      },
    },
  },
  plugins: [],
};
