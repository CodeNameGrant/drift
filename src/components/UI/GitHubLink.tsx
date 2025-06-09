import React, { memo } from 'react';
import { Github } from 'lucide-react';

/**
 * GitHub repository link component
 * Displays a GitHub icon that links to the project repository
 */
const GitHubLink: React.FC = memo(() => {
  return (
    <a
      href="https://github.com/CodeNameGrant/drift/"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed top-4 right-16 p-2 rounded-full bg-gray-200 dark:bg-gray-800 transition-colors duration-300 hover:bg-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
      aria-label="View source code on GitHub"
      title="View source code on GitHub"
    >
      <Github className="h-5 w-5 text-gray-800 dark:text-gray-200" />
    </a>
  );
});

GitHubLink.displayName = 'GitHubLink';

export default GitHubLink;