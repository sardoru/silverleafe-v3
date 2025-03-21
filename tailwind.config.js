/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        'xs': '375px',
      },
      spacing: {
        '18': '4.5rem',
        '68': '17rem',
        '84': '21rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
};