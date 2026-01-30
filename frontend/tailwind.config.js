/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        scaleQuote1: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.25)" },
        },
        scaleQuote2: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.15)" },
        },
      },
      animation: {
        scaleQuote1: "scaleQuote1 1.5s ease-in-out infinite",
        scaleQuote2: "scaleQuote2 1.5s ease-in-out infinite",
      },
    },
  },

  plugins: [],
};
