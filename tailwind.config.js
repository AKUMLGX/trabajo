/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily:{
        'montserrat':['Montserrat']
      },
      colors: {
        wine: '#691C32',
        'rojo-Akamba':'#691C32',
        'verde-Akamba':'#235B4E',
        'ambar-Akamba':'#BC955C',
        'verde-logo-Akamba':'#006666',
      }
    },
  },
  plugins: [],
}

