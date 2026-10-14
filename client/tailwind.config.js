/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-bg, #F7F5F0)',
        'background-secondary': 'var(--color-bg-secondary, #EFEEE8)',
        'card-bg': 'var(--color-card-bg, #FFFFFF)',
        'text-primary': 'var(--color-text-primary, #20251F)',
        'text-muted': 'var(--color-text-muted, #74786F)',
        'brand-green': 'var(--color-brand-green, #356B50)',
        'brand-green-hover': 'var(--color-brand-green-hover, #28523D)',
        'brand-green-soft': 'var(--color-brand-green-soft, #DCE9DD)',
        'terracotta': 'var(--color-terracotta, #D98169)',
        'terracotta-hover': 'var(--color-terracotta-hover, #C36F58)',
        'border-subtle': 'var(--color-border-subtle, #E2E0D8)',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        'clay-card': '0 4px 20px -2px rgba(32, 37, 31, 0.05), inset 1px 1px 2px rgba(255, 255, 255, 0.8), inset -1px -1px 2px rgba(0, 0, 0, 0.03)',
        'clay-button': '0 4px 12px rgba(53, 107, 80, 0.18), inset 0 1px 1px rgba(255, 255, 255, 0.35)',
        'clay-inset': 'inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -1px -1px 2px rgba(255, 255, 255, 0.8)',
        'clay-hover': '0 8px 25px -4px rgba(32, 37, 31, 0.09), inset 1px 1px 2px rgba(255, 255, 255, 0.9)',
      },
      borderRadius: {
        'clay': '1.25rem',
        'clay-lg': '1.75rem',
      }
    },
  },
  plugins: [],
}
