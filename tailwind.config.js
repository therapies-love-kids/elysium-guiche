/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        KampungOrange: ["KampungOrange", "sans-serif"], // Define the font family with a fallback
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      "pastel",
      "aqua",
      "bumblebee",
      "emerald",
      "forest",
      "lofi",
      "fantasy",
      "dracula",
      "night",
      "coffee",
      "winter",
      "sunset",
    ],
  },
};