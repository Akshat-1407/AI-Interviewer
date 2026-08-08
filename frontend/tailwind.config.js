/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#172033',
        },
        indigo: {
          550: '#5f63f2',
          650: '#4f46e5',
        },
      },
      spacing: {
        4.5: '1.125rem',
      },
    },
  },
  plugins: [],
};
