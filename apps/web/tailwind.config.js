/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        oja: {
          DEFAULT: '#ff6a00',
          deep: '#e25700',
          ink: '#1a1a1a',
          muted: '#667085',
          page: '#f4f5f7',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
