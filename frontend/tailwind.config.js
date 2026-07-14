/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nature: {
          50: '#f0f9f8',
          100: '#d7f0ed',
          200: '#b1dfdb',
          300: '#7ec6c0',
          400: '#54a6a1',
          500: '#388b87',
          600: '#2b6f6d',
          700: '#265958',
          800: '#224a49',
          900: '#1f3e3d',
        },
        serene: {
          50: '#f2f8fc',
          100: '#e1f0f7',
          200: '#cae2f0',
          300: '#a3cfe3',
          400: '#75b3d3',
          500: '#5296c0',
          600: '#3e7ba4',
          700: '#336386',
          800: '#2d5470',
          900: '#28465e',
        },
        primary: '#388b87',
        secondary: '#5296c0',
        background: '#f8fafc',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
