/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Warm off-white base — looks more premium than pure white
        bg: {
          DEFAULT: '#F5F3EE',
          secondary: '#E8E4DC',
          tertiary: '#DDD7CB',
        },
        ink: {
          DEFAULT: '#0A0A0A',
          soft: '#2A2A2A',
          muted: '#6B6B6B',
          faint: '#A8A49B',
        },
        accent: {
          DEFAULT: '#FF5B4A', // vivid coral
          soft: '#FFE4DF',
          dark: '#D94432',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter Tight"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'mega': ['clamp(4rem, 14vw, 16rem)', { lineHeight: '0.85', letterSpacing: '-0.04em' }],
        'hero': ['clamp(2.5rem, 8vw, 7rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'display': ['clamp(2rem, 5vw, 4rem)', { lineHeight: '1.0', letterSpacing: '-0.02em' }],
      },
      animation: {
        'marquee': 'marquee 40s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
