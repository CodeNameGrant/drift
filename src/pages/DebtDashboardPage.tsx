import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TrendingDown, Shield, AlertCircle, Loader2 } from 'lucide-react';
import DashboardOverview from '../components/DebtDashboard/DashboardOverview';
import AccountsList from '../components/DebtDashboard/AccountsList';
import { useDebtAccounts } from '../hooks/useDebtAccounts';
import { calculateDebtSummary } from '../utils/debtCalculations';

/**
 * Debt Dashboard page component with authentication protection
 * Displays comprehensive debt overview and account management with real Supabase data
 */
const DebtDashboardPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { accounts, loading: accountsLoading, error, refreshAccounts } = useDebtAccounts();

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="auth-loading-state">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect non-authenticated users to home page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Calculate debt summary from real data
  const debtSummary = calculateDebtSummary(accounts);

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
          {!accountsLoading && !error && accounts.length > 0 && (
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Overview & Analytics
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Key metrics and interactive visualizations of your debt portfolio
                </p>
              </div>
              <DashboardOverview summary={debtSummary} accounts={accounts} />
            </section>
          )}

          {/* Accounts Section */}
          <section>
            <AccountsList 
              accounts={accounts}
              loading={accountsLoading}
              error={error}
              onAccountAdded={refreshAccounts}
            />
          </section>
        </div>

        {/* Getting Started Guide for New Users */}
        {!accountsLoading && !error && accounts.length === 0 && (
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-8">
            <div className="text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingDown className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to Your Debt Dashboard
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start by adding your first debt account to begin tracking your progress. 
                The dashboard will show interactive charts, payment strategies, and help you 
                optimize your debt payoff plan.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">Add Accounts</p>
                  <p className="text-gray-600 dark:text-gray-400">Enter your debt account details</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-green-600 dark:text-green-400 font-bold">2</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">Track Progress</p>
                  <p className="text-gray-600 dark:text-gray-400">Monitor balances and payments</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-orange-600 dark:text-orange-400 font-bold">3</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">Optimize Strategy</p>
                  <p className="text-gray-600 dark:text-gray-400">Use insights to pay off faster</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Security Notice */}
        <div className="mt-12 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Shield className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-800 dark:text-green-200 font-medium text-sm">
                Your Data is Secure
              </p>
              <p className="text-green-700 dark:text-green-300 text-sm">
                All debt account information is encrypted and stored securely. Only you can access your data, 
                and it's protected by Supabase's enterprise-grade security with row-level security policies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebtDashboardPage;