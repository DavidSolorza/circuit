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
        surface: {
          DEFAULT: '#1a1b2e',
          50: '#f0f0f5',
          100: '#e0e0eb',
          200: '#c1c1d6',
          300: '#a2a2c2',
          400: '#8383ad',
          500: '#646499',
          600: '#50507a',
          700: '#3c3c5c',
          800: '#28283d',
          900: '#1a1b2e',
          950: '#0f1019',
        },
        primary: {
          DEFAULT: '#3b82f6',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        terminal: {
          blue: '#3b82f6',
          green: '#22c55e',
          red: '#ef4444',
          yellow: '#eab308',
        },
        sim: {
          running: '#22c55e',
          error: '#ef4444',
          processing: '#eab308',
          stopped: '#64748b',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.3)' },
          '100%': { boxShadow: '0 0 15px rgba(59, 130, 246, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
