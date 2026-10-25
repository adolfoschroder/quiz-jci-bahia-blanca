/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfaff', 100: '#d1f4ff', 200: '#a8e8fb', 300: '#7dd9f4', 400: '#35b6e6', 500: '#0097D7', 600: '#007daf', 700: '#00668f', 800: '#1F4789', 900: '#130F2D',
        },
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,151,215,0.5)' },
          '50%': { boxShadow: '0 0 60px rgba(0,151,215,1), 0 0 100px rgba(0,151,215,0.5)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
