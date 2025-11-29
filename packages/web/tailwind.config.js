/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#E07A5F', // Terracotta
        secondary: '#3D405B', // Deep Navy/Slate
        accent: '#81B29A', // Sage Green
        sand: '#F4F1DE', // Background White
        dark: '#1F2937',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
