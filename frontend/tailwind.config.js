/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Colores de diseñoELAI (landing)
        "primary": "#ec5b13",
        "background-light": "#f8f6f6",
        "background-dark": "#221610",
        "content-light": "#1b120d",
        "content-dark": "#f3ebe7",
        "card-light": "#fcf9f8",
        "card-dark": "#2a1b13",
        "border-light": "#e7d7cf",
        "border-dark": "#4a3529",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Manrope', 'system-ui', 'sans-serif']
      },
      animation: {
        'gradient-bg': 'gradient-bg 15s ease infinite',
      },
      keyframes: {
        'gradient-bg': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        }
      }
    },
  },
  plugins: [],
}
