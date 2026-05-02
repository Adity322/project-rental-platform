/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      colors: {
        brand: {
          teal: '#5DCAA5',
          'teal-dark': '#04342C',
          'teal-mid': '#1D9E75',
          bg: '#0f0f0f',
          surface: '#141414',
          card: '#1a1a1a',
          border: '#2a2a2a',
          'border-light': '#1e1e1e',
          muted: '#888888',
          dim: '#555555',
          faint: '#333333',
        }
      }
    },
  },
  plugins: [],
}