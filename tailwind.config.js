/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f2f7f5',
          100: '#e1ebe7',
          200: '#c5dcd4',
          300: '#9ec4b8',
          400: '#76a695',
          500: '#548c7e',
          600: '#417064',
          700: '#355b51',
          800: '#2d4942',
          900: '#263d38',
        }
      }
    }
  },
  plugins: [],
}
