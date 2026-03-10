/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#CE1126',   // PNG Red
          600: '#b91c1c',
          700: '#991b1b',
          800: '#7f1d1d',
          900: '#450a0a',
        },
        secondary: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#FCD116',   // PNG Gold/Yellow
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#422006',
        },
        accent: {
          500: '#000000',   // PNG Black
        },
      },
    },
  },
  plugins: [],
};
