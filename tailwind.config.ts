import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f7fb',
          100: '#e8eef7',
          600: '#1d4ed8',
          700: '#1e40af',
          900: '#0f1f3d',
        },
      },
    },
  },
  plugins: [],
};
export default config;
