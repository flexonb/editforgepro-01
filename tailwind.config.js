/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        'xs': '320px',
        'sm': '481px',
        'md': '769px',
        'lg': '1025px',
        'xl': '1280px',
        '2xl': '1536px',
        // Custom breakpoints for specific use cases
        'mobile': {'max': '480px'},
        'tablet': {'min': '481px', 'max': '768px'},
        'laptop': {'min': '769px', 'max': '1024px'},
        'desktop': {'min': '1025px'},
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        'safe': 'env(safe-area-inset-bottom)',
      },
      maxHeight: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        '128': '32rem',
        '144': '36rem',
      },
      minHeight: {
        '11': '2.75rem',
        '12': '3rem',
        '16': '4rem',
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      gridTemplateColumns: {
        'responsive': 'repeat(auto-fit, minmax(280px, 1fr))',
        'responsive-sm': 'repeat(auto-fit, minmax(200px, 1fr))',
        'responsive-lg': 'repeat(auto-fit, minmax(320px, 1fr))',
      },
    },
  },
  plugins: [],
};