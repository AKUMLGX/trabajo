/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily:{
        'montserrat': ['Montserrat'],
        'outfit': ['Outfit', 'sans-serif']
      },
      colors: {
        // Paleta institucional Tlálcalli
        'purple': {
          'base': '#34005b',
          'secondary': '#3e0065',
          'light': '#5c1a7a',
          'dark': '#20003a',
        },
        'gold': {
          'base': '#d6ae67',
          'secondary': '#dbb872',
          'light': '#e8c88f',
          'dark': '#c9a050',
        },
        // Mantener compatibilidad
        wine: '#34005b',
        'rojo-Akamba': '#34005b',
        'verde-Akamba': '#235B4E',
        'ambar-Akamba': '#d6ae67',
        'verde-logo-Akamba': '#34005b',
        // Alias convenientes
        'sat-purple': '#34005b',
        'sat-gold': '#d6ae67',
      },
      boxShadow: {
        'purple-sm': '0 2px 8px rgba(52, 0, 91, 0.15)',
        'purple': '0 4px 20px rgba(52, 0, 91, 0.2)',
        'purple-lg': '0 8px 40px rgba(52, 0, 91, 0.25)',
        'gold-sm': '0 2px 8px rgba(214, 174, 103, 0.2)',
        'gold': '0 4px 20px rgba(214, 174, 103, 0.3)',
        'gold-lg': '0 8px 40px rgba(214, 174, 103, 0.4)',
      },
      backgroundImage: {
        'gradient-purple': 'linear-gradient(135deg, #34005b 0%, #3e0065 100%)',
        'gradient-gold': 'linear-gradient(135deg, #d6ae67 0%, #dbb872 100%)',
        'gradient-header': 'linear-gradient(135deg, #34005b 0%, #3e0065 50%, #5c1a7a 100%)',
      },
    },
  },
  plugins: [],
}
