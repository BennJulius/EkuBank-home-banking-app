/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ekubank-navy': '#072146', 
        'ekubank-blue': '#1973B8', 
        'ekubank-light': '#F4F4F4', 
      }
    },
  },
  plugins: [],
}