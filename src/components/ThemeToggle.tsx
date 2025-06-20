import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/**
 * Theme toggle component that switches between light and dark modes
 * Now uses the ThemeContext for synchronized theme state
 */
const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      data-testid="theme-toggle-button"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 text-gray-800 transition-transform duration-300" />
      ) : (
        <Sun className="h-5 w-5 text-yellow-300 transition-transform duration-300" />
      )}
    </button>
  );
};

export default ThemeToggle;