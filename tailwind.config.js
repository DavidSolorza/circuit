/** @type {import('tailwindcss').Config}
 * LabCircuitos — tema claro fijo (ver docs/TEMA_UI.md).
 */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1A1A18',
          muted: '#5C5A54',
          faint: '#8A877E',
        },
        surface: {
          DEFAULT: '#FFFCF7',
          950: '#F8F5EF',
          900: '#FFFCF7',
          800: '#F5F0E6',
          700: '#E8E0D0',
          600: '#D0C8B5',
          500: '#6B7280',
          400: '#4B5563',
          300: '#374151',
          200: '#1F2937',
          100: '#111827',
          50: '#030712',
        },
        primary: {
          DEFAULT: '#1F4D3A',
          50: '#E8F0EC',
          100: '#C5D9CF',
          200: '#9EBFB0',
          300: '#74A58F',
          400: '#4D8B6E',
          500: '#1F4D3A',
          600: '#1A4030',
          700: '#143326',
          800: '#0E261C',
          900: '#081912',
        },
        gold: {
          DEFAULT: '#C9A86A',
          50: '#FAF5EB',
          100: '#F0E6CC',
          200: '#E4D4A8',
          300: '#D8C285',
          400: '#D0B475',
          500: '#C9A86A',
          600: '#B8975A',
          700: '#A3844A',
          800: '#8E703A',
          900: '#6A542A',
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
          stopped: '#6B7280',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 3px rgba(26, 26, 24, 0.06), 0 4px 12px rgba(26, 26, 24, 0.04)',
        card: '0 2px 8px rgba(26, 26, 24, 0.08)',
        float: '0 8px 24px rgba(26, 26, 24, 0.12)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(31, 77, 58, 0.3)' },
          '100%': { boxShadow: '0 0 15px rgba(31, 77, 58, 0.6)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
