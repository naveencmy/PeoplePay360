/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Deep Enterprise Palette
        surface: {
          0: 'var(--surface-0)',
          1: 'var(--surface-1)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
        },
        border: {
          subtle: 'var(--border-subtle)',
          medium: 'var(--border-medium)',
          highlight: 'var(--border-highlight)',
        },
        text: {
          main: 'var(--text-main)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          inverse: 'var(--text-inverse)',
        },
        accent: {
          blue: '#4F7CFF',
          'blue-hover': '#3D6AEE',
          'blue-subtle': 'rgba(79, 124, 255, 0.12)',
          cyan: '#38BDF8',
          'cyan-subtle': 'rgba(56, 189, 248, 0.12)',
          purple: '#8B5CF6',
          'purple-subtle': 'rgba(139, 92, 246, 0.12)',
          emerald: '#10B981',
          'emerald-subtle': 'rgba(16, 185, 129, 0.12)',
          amber: '#F59E0B',
          'amber-subtle': 'rgba(245, 158, 11, 0.12)',
          rose: '#F43F5E',
          'rose-subtle': 'rgba(244, 63, 94, 0.12)',
          // Backward compatibility mappings
          green: '#10B981',
          red: '#F43F5E',
        },
        bg: {
          primary: 'var(--surface-0)',
          secondary: 'var(--surface-1)',
          card: 'var(--surface-2)',
          elevated: 'var(--surface-3)',
          border: 'var(--border-subtle)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        card: '14px',
        input: '9px',
        badge: '6px',
        modal: '18px',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        dropdown: 'var(--shadow-dropdown)',
        drawer: 'var(--shadow-drawer)',
        glow: '0 0 20px -3px rgba(79, 124, 255, 0.25)',
        'glow-purple': '0 0 20px -3px rgba(139, 92, 246, 0.25)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.18s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scale-in 0.15s ease-out forwards',
      },
    },
  },
  plugins: [],
};
