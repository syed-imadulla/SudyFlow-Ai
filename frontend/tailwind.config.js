module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{html,js}',
    './public/**/*.html',
    './components/**/*.html',
    './pages/**/*.html',
    './*.html',
    './router.js',
  ],
  theme: {
    extend: {
      colors: {
        background: '#050505',
        surface: '#0A0A0A',
        card: '#0E0E0E',
        'card-hover': '#151515',
        border: {
          DEFAULT: '#202020',
          elevated: '#2A2A2A',
        },
        divider: '#171717',
        navbar: '#080808',
        modal: '#0D0D0D',
        primary: {
          DEFAULT: '#A855F7',
          hover: '#9333EA',
          glow: 'rgba(168,85,247,0.25)',
        },
        secondary: '#FACC15',
        success: '#22C55E',
        danger: '#EF4444',
        text: {
          primary: '#FAFAFA',
          secondary: '#A1A1AA',
          muted: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        saas: '20px',
      },
      boxShadow: {
        saas: '0 4px 20px rgba(0,0,0,0.6)',
        glow: '0 0 20px rgba(168,85,247,0.25)',
        'yellow-glow': '0 0 18px rgba(250,204,21,0.25)',
      },
      transitionDuration: {
        200: '200ms',
        250: '250ms',
        300: '300ms',
      },
    },
  },
  plugins: [],
};
