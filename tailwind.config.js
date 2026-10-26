/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#030712",
        cosmic: {
          900: "#050814",
          800: "#0a1128",
          700: "#131b3e",
          cyan: "#00f0ff",
          amber: "#ff9d00",
          violet: "#9d4edd"
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [],
}
