import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { User, LogOut, X } from 'lucide-react';

// Components
import ThemeToggle from './components/ThemeToggle';
import GitHubLink from './components/GitHubLink';
import CurrencySelector from './components/CurrencySelector';
import AuthUI from './components/AuthUI';
import Navigation from './components/Navigation';
import BoltLogo from './components/BoltLogo';

// Pages
import HomePage from './pages/HomePage';
import LoanCalculatorPage from './pages/LoanCalculatorPage';
import DebtDashboardPage from './pages/DebtDashboardPage';
import NotFoundPage from './pages/NotFoundPage';

// Contexts and Hooks
import { useTheme } from './hooks/useTheme';
import { CurrencyProvider } from './context/CurrencyContext';
import { AuthProvider, useAuth } from './context/AuthContext';

/**
 * Authentication status component with login/logout functionality
 * Displays user info when logged in, login button when not
 */
const AuthStatus: React.FC<{ onShowAuth: () => void }> = ({ onShowAuth }) => {
  const { user, signOut, loading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /**
   * Handle user logout with loading state
   */
  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        <span className="text-sm text-gray-600 dark:text-gray-400">Loading...</span>
      </div>
    );
  }

  return (
    <>
      {user ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <User className="h-4 w-4" />
            <span className="hidden sm:block max-w-32 truncate">
              {user.email || user.user_metadata?.full_name || 'User'}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="flex items-center gap-1 py-2 px-3 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white rounded-lg text-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:cursor-not-allowed"
            aria-label="Sign out"
            data-testid="logout-button"
          >
            {isLoggingOut ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            ) : (
              <LogOut className="h-3 w-3" />
            )}
            <span className="hidden sm:block">
              {isLoggingOut ? 'Signing out...' : 'Logout'}
            </span>
          </button>
        </div>
      ) : (
        <button
          onClick={onShowAuth}
          className="flex items-center gap-2 py-2 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800 font-medium shadow-lg"
          data-testid="login-button"
        >
          <User className="h-4 w-4" />
          <span>Login</span>
        </button>
      )}
    </>
  );
};

/**
 * Authentication Modal Component
 * Renders as a portal-like overlay covering the entire viewport
 */
const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  // Don't render if not open or user is already authenticated
  if (!isOpen || user) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      data-testid="auth-modal-overlay"
    >
      <div className="relative max-w-md w-full">
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 p-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full shadow-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Close authentication modal"
          data-testid="close-auth-modal"
        >
          <X className="h-5 w-5" />
        </button>
        <AuthUI onAuthSuccess={onClose} />
      </div>
    </div>
  );
};

/**
 * Main application component with React Router setup
 * Features routing, authentication, and global layout
 */
function App() {
  const { theme, toggleTheme } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);

  /**
   * Show authentication modal
   */
  const handleShowAuth = () => {
    setShowAuthModal(true);
  };

  /**
   * Close authentication modal
   */
  const handleCloseAuth = () => {
    setShowAuthModal(false);
  };

  return (
    <CurrencyProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-appBackground-light dark:bg-appBackground-dark text-gray-900 dark:text-white transition-colors duration-300">
            {/* Header with left-aligned app name and right-aligned tools */}
            <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-40">
              <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
                {/* Left side - App Name */}
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-primary dark:text-primary-light tracking-tight">
                    Drift
                  </h1>
                </div>

                {/* Right side - Tools */}
                <div className="flex items-center gap-3">
                  <BoltLogo />
                  <CurrencySelector />
                  <AuthStatus onShowAuth={handleShowAuth} />
                  <GitHubLink />
                  <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                </div>
              </div>
            </header>

            {/* Navigation */}
            <Navigation />

            {/* Main content with routing */}
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/loan-calculator" element={<LoanCalculatorPage />} />
                <Route path="/debt-dashboard" element={<DebtDashboardPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 mt-16">
              <div className="max-w-7xl mx-auto py-8 px-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Drift Loan Calculator - Advanced loan simulation and payment analysis
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Free to use for all users. Sign up to save your calculations and preferences.
                </p>
              </div>
            </footer>

            {/* Authentication Modal - Rendered at root level */}
            <AuthModal isOpen={showAuthModal} onClose={handleCloseAuth} />
          </div>
        </Router>
      </AuthProvider>
    </CurrencyProvider>
  );
}

export default App;