import React from 'react';
import { Sun, Moon } from 'lucide-react';
import useThemeStore from '@/store/themeStore';

export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative p-2 rounded-lg text-text-secondary hover:text-text-main hover:bg-surface-3 transition-all duration-150 border border-transparent hover:border-border-subtle focus:outline-none focus:ring-2 focus:ring-accent-blue/30 ${className}`}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 animate-fade-in transition-transform hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-accent-blue animate-fade-in transition-transform hover:-rotate-12" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
