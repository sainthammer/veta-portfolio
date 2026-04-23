/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#FFFFFF',
          secondary: '#F5F5F5',
          tertiary: '#EBEBEB',
        },
        ink: {
          DEFAULT: '#0A0A0A',
          soft: '#1A1A1A',
          muted: '#707070',
          faint: '#B0B0B0',
        },
        accent: {
          DEFAULT: '#0A0A0A',
          soft: '#F0F0F0',
          dark: '#000000',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter Tight"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        // Oversized section titles — fills full width
        'mega':    ['clamp(5rem, 18vw, 22rem)',  { lineHeight: '0.82', letterSpacing: '-0.04em' }],
        'hero':    ['clamp(3rem, 10vw, 10rem)',  { lineHeight: '0.88', letterSpacing: '-0.03em' }],
        'display': ['clamp(2.5rem, 7vw, 7rem)',  { lineHeight: '0.90', letterSpacing: '-0.02em' }],
        // Section heading — big, fills container
        'section': ['clamp(3rem, 9vw, 9rem)',    { lineHeight: '0.88', letterSpacing: '-0.03em' }],
      },
      animation: {
        'marquee':      'marquee 25s linear infinite',
        'marquee-slow': 'marquee 25s linear infinite',
        'float':      'float 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'fade-in':    'fadeIn 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        marquee:      { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        float:        { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-12px)' } },
        'pulse-soft': { '0%, 100%': { opacity: '0.4' }, '50%': { opacity: '0.8' } },
        fadeIn:       { '0%': { opacity: '0', transform: 'scale(0.98)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
};
