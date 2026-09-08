/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          50: "#f4f5fa",
          100: "#e7e9f3",
          200: "#c7cce4",
          300: "#9ba3cb",
          400: "#6b76ab",
          500: "#4a548b",
          600: "#373f70",
          700: "#2a3158",
          800: "#1e2447",
          900: "#161b39",
          950: "#0d1029",
        },
        amber: {
          50: "#fef8ec",
          100: "#fdedc8",
          200: "#fad88c",
          300: "#f7c14f",
          400: "#f0a93a",
          500: "#e0922a",
          600: "#bd7320",
          700: "#94581c",
          800: "#79481e",
          900: "#673d1d",
        },
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(13, 16, 41, 0.04), 0 1px 6px -1px rgba(13, 16, 41, 0.06)",
        panel: "0 2px 8px -2px rgba(13, 16, 41, 0.08), 0 8px 24px -4px rgba(13, 16, 41, 0.06)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
