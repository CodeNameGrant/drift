import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calculator } from 'lucide-react';

/**
 * Navigation component for site-wide navigation
 * Features active route highlighting and responsive design
 */
const Navigation: React.FC = () => {
  const navItems = [
    {
      to: '/',
      label: 'Home',
      icon: Home,
      exact: true
    },
    {
      to: '/loan-calculator',
      label: 'Calculator',
      icon: Calculator,
      exact: false
    }
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700" data-testid="main-navigation">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center py-4">
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      isActive
                        ? 'bg-primary text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`
                  }
                  data-testid={`nav-link-${item.label.toLowerCase()}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;