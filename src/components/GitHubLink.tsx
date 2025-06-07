import React from 'react';
import { Github } from 'lucide-react';

const GitHubLink: React.FC = () => {
  return (
    <a
      href="https://github.com/CodeNameGrant/drift/"
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 transition-colors duration-300 hover:bg-gray-300 dark:hover:bg-gray-700"
      aria-label="View source code on GitHub"
      title="View source code on GitHub"
    >Test1
      <Github className="h-5 w-5 text-gray-800 dark:text-gray-200" />
    </a>
  );
};

export default GitHubLink;