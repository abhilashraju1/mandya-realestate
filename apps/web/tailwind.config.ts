import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E', // Primary Teal
          800: '#115E59',
          900: '#134E4A',
        },
        navy: {
          800: '#1E3A52',
          900: '#142B3B', // Deep Navy
          950: '#0D1E2B',
        },
        gold: {
          400: '#F59E0B',
          500: '#E7A33E', // Warm Gold
          600: '#D97706',
        },
        sand: {
          50: '#FAFAFA',
          100: '#F5F7F6', // Off-White background
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        kannada: ['Noto Sans Kannada', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
