import React from 'react';
import { Github } from 'lucide-react';

/**
 * GitHub repository link component
 * Provides a styled button that opens the project's GitHub repository in a new tab
 */
const GitHubLink: React.FC = () => {
  const handleClick = () => {
    window.open('https://github.com/CodeNameGrant/drift', '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      aria-label="View source code on GitHub"
      title="View source code on GitHub"
      data-testid="github-link-button"
    >
      <Github className="h-5 w-5 text-gray-800 dark:text-gray-200" />
    </button>
  );
};

export default GitHubLink;