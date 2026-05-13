/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9fa',
          100: '#d9f0f2',
          200: '#b8e2e6',
          300: '#8cced4',
          400: '#59b0ba',
          500: '#3e94a0',
          600: '#357a87',
          700: '#306470',
          800: '#2d535d',
          900: '#294750',
          950: '#172e35',
        },
      },
    },
  },
  plugins: [],
}
