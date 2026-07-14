/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#faf8f5',
          100: '#f2eae1',
          200: '#e5d5c5',
          300: '#d5bba3',
          400: '#c29d7d',
          500: '#b28660',
          600: '#a3714f',
          700: '#875a40',
          800: '#6f4a36',
          900: '#5a3d2e',
        },
        sage: {
          50: '#f4f7f4',
          100: '#e5eee6',
          200: '#cdddd1',
          300: '#a8c5b1',
          400: '#7fa88d',
          500: '#5f8d70',
          600: '#487157',
          700: '#3a5a46',
          800: '#30493a',
          900: '#283c31',
        },
        primary: '#487157',   // sage-600 (natureza/tech)
        secondary: '#a3714f', // warm-600 (acolhimento terracota suave)
        background: '#faf8f5', // crem bege bem suave
        card: '#ffffff',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'subtle-float': 'subtleFloat 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        subtleFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
