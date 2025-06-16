import React from 'react';
import { Plus, CreditCard } from 'lucide-react';
import { DebtAccount } from '../../types/debt';
import AccountCard from './AccountCard';

interface AccountsListProps {
  accounts: DebtAccount[];
}

/**
 * Accounts list component displaying debt account cards in a responsive grid
 * Features prominent "Add New Account" button and empty state handling
 */
const AccountsList: React.FC<AccountsListProps> = ({ accounts }) => {
  const activeAccounts = []; //accounts.filter(account => account.isActive);

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
            <AccountCard key={account.id} account={account} />
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
                {activeAccounts.filter(account => account.extraPayment && account.extraPayment > 0).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                With Extra Payments
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsList;