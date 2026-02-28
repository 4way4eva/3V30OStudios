/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bleu: {
          50:  '#eff6ff',
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
        praise: {
          DEFAULT: '#6366f1',
          dark:    '#4338ca',
          light:   '#a5b4fc',
        },
        vault: {
          DEFAULT: '#10b981',
          dark:    '#065f46',
          light:   '#6ee7b7',
        },
      },
      animation: {
        'pulse-slow':  'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow':        'glow 2s ease-in-out infinite alternate',
        'float':       'float 3s ease-in-out infinite',
        'spin-slow':   'spin 8s linear infinite',
      },
      keyframes: {
        glow: {
          '0%':   { boxShadow: '0 0 5px #6366f1' },
          '100%': { boxShadow: '0 0 20px #6366f1, 0 0 40px #a5b4fc' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
      backgroundImage: {
        'sovereign-gradient': 'linear-gradient(135deg, #1e1b4b 0%, #1e3a8a 50%, #4c1d95 100%)',
        'vault-gradient':     'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
        'praise-gradient':    'linear-gradient(135deg, #4338ca 0%, #7c3aed 100%)',
      },
    },
  },
  plugins: [],
};
