import React from 'react';
import { useTheme } from '../hooks/useTheme';

/**
 * Fixed Bolt logo component positioned at top-right corner
 * Features theme-aware logo switching, fixed positioning, and proper accessibility
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
      className="fixed top-20 right-4 z-40 flex items-center justify-center p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800 group hover:scale-105"
      aria-label="Visit Bolt.new - Powered by Bolt"
      title="Visit Bolt.new"
      data-testid="bolt-logo-link"
      style={{ 
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      <div className="relative w-8 h-8 transition-transform duration-200">
        <img
          src={theme === 'dark' ? '/white_circle_360x360.png' : '/black_circle_360x360.png'}
          alt="Bolt Logo"
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
      
      {/* Tooltip on hover */}
      <div className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
        Powered by Bolt.new
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
      </div>
      
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
    </button>
  );
};

export default BoltLogo;