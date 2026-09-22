/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6fc',
          100: '#d6ebf8',
          200: '#b1d8f1',
          300: '#85c8f2',
          400: '#339ce4',
          500: '#00598e',
          600: '#004875',
          700: '#00395c',
          800: '#002942',
          900: '#001a2a',
          950: '#000d17',
        },
        accent: {
          50: '#fffbea',
          100: '#fff4c5',
          200: '#ffe885',
          300: '#f0e964',
          400: '#fcd54d',
          500: '#fbc939',
          600: '#d9a01b',
          700: '#ab7510',
          800: '#8a5a13',
          900: '#704715',
          950: '#402507',
        },
        surface: {
          light: '#ffffff',
          soft: '#f4f9fd',
          blue: '#e6f2fb',
          border: '#cce4f6',
          dark: '#00121d',
          darkSoft: '#001c2d',
          darkBorder: '#00304d',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'subtle': '0 4px 20px -2px rgba(0, 89, 142, 0.08)',
        'glow': '0 0 25px -5px rgba(0, 89, 142, 0.3)',
      }
    },
  },
  plugins: [],
};
