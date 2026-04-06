/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#5C6CFA",
        secondary: "#FF7A6E",
        tertiary: "#BFD7FF",
      },
    },
  },
  plugins: [],
};
