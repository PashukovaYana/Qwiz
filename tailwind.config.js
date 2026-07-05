/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Основной шрифт (текст) и «дисплейный» для крупных заголовков
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      colors: {
        // Синяя айдентика — основной цвет платформы
        brand: {
          DEFAULT: "#2563eb", // синий
          dark: "#1d4ed8",
          light: "#3b82f6",
        },
        // Циановый акцент — для градиентов и «технологичных» подсветок
        accent: {
          DEFAULT: "#22d3ee",
          dark: "#06b6d4",
        },
        // Тёмная база интерфейса
        surface: {
          DEFAULT: "#0b1220", // фон панелей
          deep: "#060a15",    // фон страницы
        },
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(37, 99, 235, 0.45)",
      },
      keyframes: {
        "pulse-ring": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 2s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
