/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#070b14',
          card: '#0d1527',
          border: '#1e293b',
          accent: '#06b6d4',
          danger: '#f43f5e',
          safe: '#10b981',
          warning: '#f59e0b'
        }
      }
    },
  },
  plugins: [],
}
