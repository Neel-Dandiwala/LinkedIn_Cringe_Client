/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'bounce-slow': 'bounce-slow 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}