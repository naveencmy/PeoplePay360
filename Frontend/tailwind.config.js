/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark theme palette
        bg: {
          primary: '#0B0D10',
          secondary: '#111418',
          card: '#161B22',
          elevated: '#1C2128',
          border: 'rgba(255,255,255,0.08)',
        },
        accent: {
          blue: '#4F7CFF',
          'blue-hover': '#3D6AEE',
          green: '#22C55E',
          amber: '#F59E0B',
          red: '#EF4444',
        },
        text: {
          primary: '#E6EDF3',
          secondary: '#8B949E',
          muted: '#6E7681',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        input: '8px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)',
        dropdown: '0 8px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)',
      },
    },
  },
  plugins: [],
};
