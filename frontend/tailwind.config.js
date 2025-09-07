/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gray': {
          900: '#111827',
          800: '#1F2937',
          700: '#374151',
          600: '#4B5563',
          300: '#D1D5DB',
          200: '#E5E7EB',
        },
      }
    },
  },
  plugins: [],
}