/** @type {import('tailwindcss').Config} */
export default {
  // "class" → el modo oscuro se activa añadiendo la clase "dark" al <html>
  darkMode: "class",

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      fontFamily: {
        // Tipografía principal: Sora (display) + DM Sans (body)
        display: ["Sora", "sans-serif"],
        sans: ["DM Sans", "sans-serif"],
      },
      colors: {
        // Paleta corporativa ValCare
        marca: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          400: "#60a5fa",
          600: "#1d4ed8",
          700: "#1e40af",
          800: "#1e3a8a",
          900: "#1e3a8a",
          950: "#0f1f5c",
        },
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease forwards",
        "modal-in": "modalIn 0.3s cubic-bezier(.34,1.56,.64,1) forwards",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        modalIn: {
          "0%":   { opacity: 0, transform: "scale(0.9)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
