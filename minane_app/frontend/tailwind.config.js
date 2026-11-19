/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cma: {
          navy: '#042442',
          darkNavy: '#083863',
          red: '#E2001A',
          darkRed: '#B8001A',
          lightBlue: '#1A8BD6',
          gray: '#F4F6F9',
          border: '#E2E8F0',
          text: '#0B1F33',
          muted: '#475569',
        },
        minane: {
          navy: '#042442',
          deepNavy: '#042442',
          darkNavy: '#083863',
          cyan: '#1A8BD6',
          sky: '#0284C7',
          orange: '#E2001A',
          darkOrange: '#B8001A',
          lightOrange: '#FEF2F2',
          lightBlue: '#F0F7FF',
          gray: '#F4F6F9',
          border: '#E2E8F0',
          textMuted: '#475569'
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'Arial', 'Helvetica', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
