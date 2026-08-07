/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAFAFA",
        card: "#FFFFFF",
        border: "#111111",
        text: "#111111",
      },
      fontFamily: {
        pixel: ['"Space Mono"', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        pixel: '4px 4px 0px 0px #111111',
        'pixel-hover': '6px 6px 0px 0px #111111',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
