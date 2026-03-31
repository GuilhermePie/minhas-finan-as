/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        app: {
          bg: 'var(--color-app-bg)',
          surface: 'var(--color-app-surface)',
          'surface-hover': 'var(--color-app-surface-hover)',
          border: 'var(--color-app-border)',
          'border-hover': 'var(--color-app-border-hover)',
        },
        content: {
          main: 'var(--color-content-main)',
          muted: 'var(--color-content-muted)',
          faint: 'var(--color-content-faint)',
        },
        primary: {
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
        },
        highlight: 'var(--color-highlight)',
        success: '#10b981',
        danger: '#ef4444',
      }
    },
  },
  plugins: [],
}
