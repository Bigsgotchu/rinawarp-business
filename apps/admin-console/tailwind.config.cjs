/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        terminal: {
          hotPink: '#FF3FAE',
          teal: '#1CC7B1',
          surface: '#060811',
        },
        aimvc: {
          electricPink: '#FF2BD6',
          neonBlue: '#2BEAFF',
          surface: '#09001F',
        },
        admin: {
          bg: '#02020A',
          sidebar: '#050618',
          border: '#181827',
          text: '#E5E7EB',
          muted: '#6B7280',
        },
        neutral: {
          950: '#0a0a0a',
        },
      },
    },
  },
  plugins: [],
};
