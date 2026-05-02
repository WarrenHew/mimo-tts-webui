import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        studio: {
          bg: 'var(--theme-bg)',
          surface: 'rgb(var(--theme-surface-rgb) / <alpha-value>)',
          elevated: 'var(--theme-elevated)',
          border: 'var(--theme-border)',
          text: 'var(--theme-text)',
          muted: 'rgb(var(--theme-muted-rgb) / <alpha-value>)',
          amber: 'rgb(var(--theme-amber-rgb) / <alpha-value>)',
          'amber-glow': 'rgb(var(--theme-amber-glow-rgb) / <alpha-value>)',
          rose: 'rgb(var(--theme-rose-rgb) / <alpha-value>)',
          green: 'rgb(var(--theme-green-rgb) / <alpha-value>)',
          blue: 'rgb(var(--theme-blue-rgb) / <alpha-value>)',
        },
      },
      fontFamily: {
        mono: ['DM Mono', 'monospace'],
        serif: ['Noto Serif SC', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
