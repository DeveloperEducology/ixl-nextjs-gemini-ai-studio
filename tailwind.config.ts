import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",        // Covers all routes in your 'app' folder
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // Covers your root 'components' folder
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",        // Covers 'lib' (useful if you have utility styles there)
    "./utils/**/*.{js,ts,jsx,tsx,mdx}",      // Covers 'utils'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        ixl: {
          green: '#56a700',
          blue: '#0074e8',
          orange: '#f5a623',
          bg: '#f3f9f9'
        }
      }
    },
  },
  plugins: [],
};
export default config;