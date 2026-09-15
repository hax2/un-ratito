/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#F7F4EC',
          200: '#EFEAE0',
          300: '#E3DCce',
        },
        ink: {
          900: '#1C1917',
          800: '#292524',
          700: '#44403C',
          500: '#78716C',
          400: '#A8A29E',
        },
        terracotta: {
          50: '#FDF4F0',
          100: '#FCE7DF',
          500: '#D95D39',
          600: '#C8522E',
          700: '#A83E20',
        },
        teal: {
          50: '#F0F7F8',
          100: '#DCEDF0',
          500: '#2A7B88',
          600: '#226570',
          700: '#1A5059',
        },
        mustard: {
          100: '#FEF3D6',
          400: '#F3BE58',
          500: '#E5A93C',
          600: '#C88E28',
        },
        olive: {
          100: '#EFF2E8',
          500: '#6B7A45',
          600: '#586438',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      minHeight: {
        'touch': '48px',
      },
      minWidth: {
        'touch': '48px',
      }
    },
  },
  plugins: [],
}
