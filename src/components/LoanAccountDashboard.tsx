import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  DollarSign, 
  Percent, 
  Calendar,
  TrendingUp,
  TrendingDown,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Link,
  Unlink
} from 'lucide-react';
import { loanAccountManager, LoanAccount, PaymentRecord } from '../services/LoanAccountManager';
import { formatCurrency, formatDate, formatPercentage } from '../utils/calculations';
import { useCurrency } from '../context/CurrencyContext';

const LoanAccountDashboard: React.FC = () => {
  const { currency } = useCurrency();
  const [accounts, setAccounts] = useState<LoanAccount[]>([]);
  const [primeRate, setPrimeRate] = useState<number>(loanAccountManager.getPrimeRate());
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPrimeRateForm, setShowPrimeRateForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const [newAccount, setNewAccount] = useState({
    name: '',
    loanAmount: 0,
    interestType: 'fixed' as 'fixed' | 'linked',
    interestRate: 0,
    loanTermMonths: 360,
    startDate: new Date()
  });

  const [newPrimeRate, setNewPrimeRate] = useState(primeRate);
  const [paymentAmount, setPaymentAmount] = useState(0);

  useEffect(() => {
    refreshAccounts();
  }, []);

  const refreshAccounts = () => {
    setAccounts(loanAccountManager.getAllAccounts());
    setPrimeRate(loanAccountManager.getPrimeRate());
  };

  const handleCreateAccount = () => {
    try {
      if (!newAccount.name.trim()) {
        alert('Please enter an account name');
        return;
      }

      loanAccountManager.createAccount({
        name: newAccount.name,
        loanAmount: newAccount.loanAmount,
        interestType: newAccount.interestType,
        interestRate: newAccount.interestRate,
        loanTermMonths: newAccount.loanTermMonths,
        startDate: newAccount.startDate
      });

      setNewAccount({
        name: '',
        loanAmount: 0,
        interestType: 'fixed',
        interestRate: 0,
        loanTermMonths: 360,
        startDate: new Date()
      });
      setShowAddForm(false);
      refreshAccounts();
    } catch (error) {
      alert(`Error creating account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpdatePrimeRate = () => {
    try {
      loanAccountManager.updatePrimeRate(newPrimeRate);
      setShowPrimeRateForm(false);
      refreshAccounts();
    } catch (error) {
      alert(`Error updating prime rate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSwitchInterestType = (accountId: string, newType: 'fixed' | 'linked') => {
    try {
      loanAccountManager.switchInterestType(accountId, newType);
      refreshAccounts();
    } catch (error) {
      alert(`Error switching interest type: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleRecordPayment = (accountId: string) => {
    try {
      if (paymentAmount <= 0) {
        alert('Please enter a valid payment amount');
        return;
      }

      loanAccountManager.recordPayment(accountId, paymentAmount);
      setPaymentAmount(0);
      setSelectedAccount(null);
      refreshAccounts();
    } catch (error) {
      alert(`Error recording payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getAccountStatusIcon = (account: LoanAccount) => {
    if (!account.isActive) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    if (account.interestType === 'linked') {
      return <Link className="h-5 w-5 text-blue-500" />;
    }
    return <Unlink className="h-5 w-5 text-gray-500" />;
  };

  const getInterestTypeColor = (type: 'fixed' | 'linked') => {
    return type === 'linked' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400';
  };

  const totalActiveBalance = accounts
    .filter(acc => acc.isActive)
    .reduce((sum, acc) => sum + acc.currentBalance, 0);

  const totalMonthlyPayments = accounts
    .filter(acc => acc.isActive)
    .reduce((sum, acc) => sum + acc.monthlyPayment, 0);

  const linkedAccountsCount = accounts.filter(acc => acc.interestType === 'linked' && acc.isActive).length;

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
          <CreditCard className="h-8 w-8 text-primary" />
          Loan Account Management
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage fixed and linked interest rate loan accounts with prime rate tracking
        </p>
      </div>

      {/* Prime Rate Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Current Prime Rate
              </h3>
              <p className="text-3xl font-bold text-primary">
                {formatPercentage(primeRate)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Affects {linkedAccountsCount} linked account{linkedAccountsCount !== 1 ? 's' : ''}
            </p>
            <button
              onClick={() => setShowPrimeRateForm(!showPrimeRateForm)}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
            >
              Update Prime Rate
            </button>
          </div>
        </div>

        {showPrimeRateForm && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Prime Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newPrimeRate}
                  onChange={(e) => setNewPrimeRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="5.00"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleUpdatePrimeRate}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Update
                </button>
                <button
                  onClick={() => setShowPrimeRateForm(false)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Active Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalActiveBalance, currency.code)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Payments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalMonthlyPayments, currency.code)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Accounts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {accounts.filter(acc => acc.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Accounts Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Loan Accounts
          </h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Account
          </button>
        </div>

        {/* Add Account Form */}
        {showAddForm && (
          <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Loan Account</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="e.g., Home Mortgage"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Loan Amount
                </label>
                <input
                  type="number"
                  value={newAccount.loanAmount || ''}
                  onChange={(e) => setNewAccount({ ...newAccount, loanAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="500000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Interest Type
                </label>
                <select
                  value={newAccount.interestType}
                  onChange={(e) => setNewAccount({ ...newAccount, interestType: e.target.value as 'fixed' | 'linked' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="fixed">Fixed Rate</option>
                  <option value="linked">Linked to Prime</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Interest Rate (%)
                  {newAccount.interestType === 'linked' && (
                    <span className="text-xs text-blue-600 dark:text-blue-400 ml-1">
                      (Prime + {((newAccount.interestRate || 0) - primeRate).toFixed(2)}%)
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newAccount.interestRate || ''}
                  onChange={(e) => setNewAccount({ ...newAccount, interestRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="6.50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Loan Term (Months)
                </label>
                <input
                  type="number"
                  value={newAccount.loanTermMonths || ''}
                  onChange={(e) => setNewAccount({ ...newAccount, loanTermMonths: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="360"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={newAccount.startDate.toISOString().split('T')[0]}
                  onChange={(e) => setNewAccount({ ...newAccount, startDate: new Date(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCreateAccount}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Create Account
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Accounts List */}
        <div className="space-y-4">
          {accounts.map(account => {
            const payoffDate = loanAccountManager.calculatePayoffDate(account.id);
            const isSelected = selectedAccount === account.id;
            
            return (
              <div key={account.id} className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getAccountStatusIcon(account)}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {account.name}
                      </h4>
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`font-medium ${getInterestTypeColor(account.interestType)}`}>
                          {account.interestType === 'linked' ? 'Linked Rate' : 'Fixed Rate'}
                        </span>
                        {account.interestType === 'linked' && account.margin !== undefined && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Prime + {account.margin.toFixed(2)}%
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          account.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {account.isActive ? 'Active' : 'Paid Off'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {account.isActive && (
                      <>
                        <button
                          onClick={() => handleSwitchInterestType(
                            account.id, 
                            account.interestType === 'fixed' ? 'linked' : 'fixed'
                          )}
                          className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                          title={`Switch to ${account.interestType === 'fixed' ? 'linked' : 'fixed'} rate`}
                        >
                          {account.interestType === 'fixed' ? <Link className="h-4 w-4" /> : <Unlink className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => setSelectedAccount(isSelected ? null : account.id)}
                          className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors"
                          title="Record payment"
                        >
                          <DollarSign className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Current Balance</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(account.currentBalance, currency.code)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Payment</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(account.monthlyPayment, currency.code)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Interest Rate</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatPercentage(account.interestRate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatDate(account.startDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {account.isActive ? 'Projected Payoff' : 'Paid Off'}
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {payoffDate ? formatDate(payoffDate) : 'Complete'}
                    </p>
                  </div>
                </div>

                {/* Payment Form */}
                {isSelected && account.isActive && (
                  <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-primary">
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Record Payment</h5>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Payment Amount
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={paymentAmount || ''}
                          onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          placeholder={`Suggested: ${formatCurrency(account.monthlyPayment, currency.code)}`}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRecordPayment(account.id)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                          Record
                        </button>
                        <button
                          onClick={() => setSelectedAccount(null)}
                          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment History Preview */}
                {account.paymentHistory.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Recent Payments ({account.paymentHistory.length} total)
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                      {account.paymentHistory.slice(-3).map((payment, index) => (
                        <div key={payment.id} className="bg-white dark:bg-gray-800 p-2 rounded">
                          <p className="font-medium">{formatDate(payment.date)}</p>
                          <p>{formatCurrency(payment.amount, currency.code)} @ {formatPercentage(payment.interestRate)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {accounts.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Loan Accounts
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first loan account to start tracking payments and interest rates.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
            >
              Create Your First Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanAccountDashboard;