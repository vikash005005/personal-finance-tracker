/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Human-crafted product palette: calm slate & zinc foundation,
        // restrained fintech green, crimson expense red, and warm amber caution
        slate: {
          850: '#151f32',
          900: '#0f172a',
          950: '#090d16',
        },
        primary: {
          DEFAULT: '#0f172a',
          foreground: '#f8fafc',
          dark: '#f8fafc',
          darkForeground: '#0f172a',
        },
        fintech: {
          income: '#16a34a', // Emerald 600
          incomeBg: '#f0fdf4',
          incomeBgDark: '#052e16',
          expense: '#dc2626', // Red 600
          expenseBg: '#fef2f2',
          expenseBgDark: '#450a0a',
          warning: '#d97706', // Amber 600
          warningBg: '#fffbeb',
          warningBgDark: '#451a03',
          border: '#e2e8f0',
          borderDark: '#1e293b',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'card': '12px',
      }
    },
  },
  plugins: [],
}
