import React, { memo } from 'react';
import { Moon, Sun } from 'lucide-react';
import type { Theme } from '../../types';

interface ThemeToggleProps {
  /** Current theme setting */
  theme: Theme;
  /** Function to toggle between light and dark themes */
  toggleTheme: () => void;
}

/**
 * Theme toggle button component for switching between light and dark modes
 * Positioned as a fixed element in the top-right corner
 */
const ThemeToggle: React.FC<ThemeToggleProps> = memo(({ theme, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-800 transition-colors duration-300 hover:bg-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 text-gray-800" />
      ) : (
        <Sun className="h-5 w-5 text-yellow-300" />
      )}
    </button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';

export default ThemeToggle;