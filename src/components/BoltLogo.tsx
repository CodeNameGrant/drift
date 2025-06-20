import React from 'react';
import { useTheme } from '../hooks/useTheme';

/**
 * Bolt logo component that adapts to theme and links to bolt.new
 * Features theme-aware logo switching and proper accessibility
 */
const BoltLogo: React.FC = () => {
  const { theme } = useTheme();

  /**
   * Handle logo click - opens bolt.new in new tab
   */
  const handleLogoClick = () => {
    window.open('https://bolt.new', '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleLogoClick}
      className="flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800 group"
      aria-label="Visit Bolt.new - Powered by Bolt"
      title="Visit Bolt.new"
      data-testid="bolt-logo-link"
    >
      <div className="relative w-8 h-8 transition-transform duration-200 group-hover:scale-105">
        <img
          src={theme === 'dark' ? '/white_circle_360x360.png' : '/black_circle_360x360.png'}
          alt="Bolt Logo"
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
      
      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        Powered by Bolt.new
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
      </div>
    </button>
  );
};

export default BoltLogo;