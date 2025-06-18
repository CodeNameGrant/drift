import React, { useState } from 'react';
import { Plus, CreditCard, AlertCircle, Loader2 } from 'lucide-react';
import { DebtAccount } from '../../types/debt';
import AccountCard from './AccountCard';
import AddDebtAccountForm from './AddDebtAccountForm';

interface AccountsListProps {
  accounts: DebtAccount[];
  loading: boolean;
  error: string | null;
  onAccountAdded: () => void;
}

/**
 * Accounts list component displaying debt account cards in a responsive grid
 * Features prominent "Add New Account" button, loading states, and error handling
 */
const AccountsList: React.FC<AccountsListProps> = ({ 
  accounts, 
  loading, 
  error, 
  onAccountAdded 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const activeAccounts = accounts.filter(account => account.is_active);

  /**
   * Handle opening the add account form
   */
  const handleAddAccount = () => {
    setShowAddForm(true);
  };

  /**
   * Handle closing the add account form
   */
  const handleCloseForm = () => {
    setShowAddForm(false);
  };

  /**
   * Handle successful account addition
   */
  const handleAccountAdded = () => {
    onAccountAdded();
    setShowAddForm(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6" data-testid="accounts-list-loading">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mt-2 animate-pulse"></div>
          </div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6" data-testid="accounts-list-error">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Your Debt Accounts
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and track your debt accounts
            </p>
          </div>
          
          <button
            onClick={handleAddAccount}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            data-testid="add-new-account-button"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Add New Account</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                Error Loading Accounts
              </h3>
              <p className="text-red-700 dark:text-red-300 mt-1">
                {error}
              </p>
              <button
                onClick={onAccountAdded}
                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>

        {/* Add Account Form */}
        <AddDebtAccountForm
          isOpen={showAddForm}
          onClose={handleCloseForm}
          onAccountAdded={handleAccountAdded}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="accounts-list">
      {/* Section Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Your Debt Accounts
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and track your debt accounts
          </p>
        </div>
        
        <button
          onClick={handleAddAccount}
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          data-testid="add-new-account-button"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Add New Account</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Accounts Grid */}
      {activeAccounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeAccounts.map((account) => (
            <AccountCard 
              key={account.id} 
              account={account}
              onAccountUpdated={onAccountAdded}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <CreditCard className="h-12 w-12 text-gray-400 dark:text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Debt Accounts Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Start tracking your debt by adding your first account. 
            Monitor progress and optimize your payment strategy.
          </p>
          <button
            onClick={handleAddAccount}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            data-testid="empty-state-add-button"
          >
            <Plus className="h-5 w-5" />
            Add Your First Account
          </button>
        </div>
      )}

      {/* Account Summary */}
      {activeAccounts.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeAccounts.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Active Accounts
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Set(activeAccounts.map(account => account.type)).size}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Account Types
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeAccounts.filter(account => account.extra_payment && account.extra_payment > 0).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                With Extra Payments
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Account Form */}
      <AddDebtAccountForm
        isOpen={showAddForm}
        onClose={handleCloseForm}
        onAccountAdded={handleAccountAdded}
      />
    </div>
  );
};

export default AccountsList;