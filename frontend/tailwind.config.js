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
        // Paleta Oficial e Humanizada de Cuidados Paliativos
        palia: {
          // Azul: Empatia, Compaixão, Serenidade (Borboleta Azul)
          blue: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9',
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
          },
          // Verde: Esperança, Renovação da Vida, Natureza, Bem-estar
          green: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
          },
          // Teal: União harmônica do azul e verde
          teal: {
            50: '#f0fdfa',
            100: '#ccfbf1',
            200: '#99f6e4',
            300: '#5eead4',
            400: '#2dd4bf',
            500: '#14b8a6',
            600: '#0d9488',
            700: '#0f766e',
            800: '#115e59',
            900: '#134e4a',
          }
        },
        primary: '#0284c7',   // Azul Sereno / Compaixão dos Cuidados Paliativos
        secondary: '#16a34a', // Verde Esperança / Natureza
        background: '#f4f9f7', // Fundo sálvia-celeste acolhedor
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
