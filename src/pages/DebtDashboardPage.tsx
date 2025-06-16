import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TrendingDown, Shield } from 'lucide-react';
import DashboardOverview from '../components/DebtDashboard/DashboardOverview';
import AccountsList from '../components/DebtDashboard/AccountsList';
import { mockDebtAccounts, mockDebtSummary } from '../data/mockDebtData';

/**
 * Debt Dashboard page component with authentication protection
 * Displays comprehensive debt overview and account management
 */
const DebtDashboardPage: React.FC = () => {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-state">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect non-authenticated users to home page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen py-8" data-testid="debt-dashboard-page">
      <div className="max-w-7xl mx-auto px-4">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <TrendingDown className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Debt Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Track and manage your debt accounts with interactive visualizations
              </p>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                  Welcome back, {user.email}!
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  Your debt dashboard is protected and only visible to you.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="space-y-12">
          {/* Overview Section */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Overview & Analytics
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Key metrics and interactive visualizations of your debt portfolio
              </p>
            </div>
            <DashboardOverview summary={mockDebtSummary} accounts={mockDebtAccounts} />
          </section>

          {/* Accounts Section */}
          <section>
            <AccountsList accounts={mockDebtAccounts} />
          </section>
        </div>

        {/* Development Notice */}
        <div className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 bg-yellow-400 rounded-full flex-shrink-0 mt-0.5"></div>
            <div>
              <p className="text-yellow-800 dark:text-yellow-200 font-medium text-sm">
                Development Mode
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                This dashboard currently displays mock data for demonstration purposes. 
                The interactive charts show debt distribution, reduction timelines, and interest rate comparisons.
                In production, this would connect to your actual financial accounts and data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebtDashboardPage;