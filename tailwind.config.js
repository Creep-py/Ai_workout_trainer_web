/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6d28d9',
          dark: '#5b21b6',
          light: '#8b5cf6'
        },
        background: '#0f0f13',
        'card-bg': '#1a1a24',
        'card-dark': '#13131a',
        border: '#2e2e3a',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      boxShadow: {
        'glow': '0 0 15px rgba(109, 40, 217, 0.5)',
      },
    },
  },
  plugins: [],
};