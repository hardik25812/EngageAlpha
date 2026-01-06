import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0a0a0b',
          card: '#141416',
        },
        foreground: {
          DEFAULT: '#e5e5e6',
          muted: '#94969c',
        },
        accent: {
          DEFAULT: '#0ea5e9',
          hover: '#0284c7',
        },
        border: '#1f1f23',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
