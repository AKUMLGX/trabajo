/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily:{
        sans: ['Noto Sans', 'sans-serif'],

        'montserrat': ['Montserrat'],
        'outfit': ['Outfit', 'sans-serif']
      },
      colors: {


        //Paleta de colores TLALCALLI Actualizado
        'tlalcalli-dark-900': '#241C39',
        'tlalcalli-dark-gold': '#A88445',
        'tlalcalli-dark-muted': '#715E80',

        /* Base */
        'tlalcalli-primary': '#3E0065',
        'tlalcalli-gold': '#D6AE67',
        'tlalcalli-lavender': '#977DAB',
        'tlalcalli-wine': '#861F38',
        'tlalcalli-deep': '#230142',
        'tlalcalli-gray': '#7F7D7B',

        /* Light */
        'tlalcalli-light-base': '#E6E3DC',
        'tlalcalli-light-cream': '#F5F0ED',
        'tlalcalli-light-lavender': '#F9F5FB',
        'tlalcalli-light-muted': '#C2BBB6',
        'tlalcalli-light-2': '#D9D9D9',

        /* Secondary */
        'tlalcalli-success': '#00B37A',
        'tlalcalli-warning': '#FFA400',
        'tlalcalli-error': '#F41B1D',
        'tlalcalli-dark': '#27262C',

        /* Muted secondary */
        'tlalcalli-success-muted': '#006847',
        'tlalcalli-warning-muted': '#8F5D02',
        'tlalcalli-error-muted': '#970304',
        'tlalcalli-purple-muted': '#5D337C',
        'tlalcalli-violet-muted': '#8540B9',
        'tlalcalli-orange-muted': '#B96E40',
        'tlalcalli-olive-muted': '#868644',
        'tlalcalli-teal-muted': '#4EB99C',



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
