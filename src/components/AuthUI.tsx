import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Github, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';

interface AuthUIProps {
  onAuthSuccess?: () => void;
}

/**
 * Authentication UI component providing email/password and GitHub OAuth login
 * Features responsive design, comprehensive validation, and accessibility
 */
const AuthUI: React.FC<AuthUIProps> = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const { signInWithEmail, signUpWithEmail, signInWithGitHub } = useAuth();

  /**
   * Handle email/password authentication
   */
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        setMessage('Check your email for the confirmation link!');
      } else {
        await signInWithEmail(email, password);
        setMessage('Signed in successfully!');
        onAuthSuccess?.();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle GitHub OAuth authentication
   */
  const handleGitHubSignIn = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await signInWithGitHub();
      // Supabase redirects for OAuth, so onAuthSuccess will be called after redirect
    } catch (err: any) {
      setError(err.message || 'An error occurred during GitHub authentication');
      setLoading(false);
    }
  };

  /**
   * Toggle between sign in and sign up modes
   */
  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setMessage('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md mx-auto border border-gray-200 dark:border-gray-700">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <User className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {isSignUp 
            ? 'Sign up to save your loan calculations and preferences' 
            : 'Sign in to access your saved calculations'
          }
        </p>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleEmailAuth} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="h-4 w-4" />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-lg py-3 px-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary focus:outline-none focus:ring-2 transition duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Enter your email"
              required
              data-testid="email-input"
            />
          </div>

          <div>
            <label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Lock className="h-4 w-4" />
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-lg py-3 px-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary focus:outline-none focus:ring-2 transition duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Enter your password"
              required
              minLength={6}
              data-testid="password-input"
            />
            {isSignUp && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Password must be at least 6 characters long
              </p>
            )}
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {message && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-700 dark:text-green-300">{message}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          disabled={loading}
          data-testid="auth-submit-button"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {isSignUp ? 'Creating Account...' : 'Signing In...'}
            </>
          ) : (
            <>
              <User className="h-4 w-4" />
              {isSignUp ? 'Create Account' : 'Sign In'}
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex py-6 items-center">
        <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
        <span className="flex-shrink mx-4 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2">
          OR
        </span>
        <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
      </div>

      {/* GitHub OAuth Button */}
      <button
        onClick={handleGitHubSignIn}
        className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-700 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center justify-center gap-2 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
        data-testid="github-auth-button"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Connecting...
          </>
        ) : (
          <>
            <Github className="h-5 w-5" />
            Continue with GitHub
          </>
        )}
      </button>

      {/* Toggle Sign In/Sign Up */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={toggleMode}
            className="text-primary hover:text-primary-dark font-medium transition duration-200 focus:outline-none focus:underline"
            data-testid="toggle-auth-mode"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>

      {/* Additional Info */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
          <strong>Note:</strong> The loan calculator is available to all users. 
          Creating an account allows you to save calculations and preferences for future use.
        </p>
      </div>
    </div>
  );
};

export default AuthUI;