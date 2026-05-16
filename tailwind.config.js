/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bbva-navy': '#072146', 
        'bbva-blue': '#1973B8', 
        'bbva-light': '#F4F4F4', 
      }
    },
  },
  plugins: [],
}