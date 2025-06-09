import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Dot } from 'recharts';
import { TrendingDown, Calendar, Target, Plus, Trash2, Edit3 } from 'lucide-react';
import { DebtAccount, DebtVisualizationData, Milestone } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { useCurrency } from '../context/CurrencyContext';

const DebtVisualization: React.FC = () => {
  const { currency } = useCurrency();
  
  const [debtAccounts, setDebtAccounts] = useState<DebtAccount[]>([
    {
      id: '1',
      name: 'Credit Card',
      currentBalance: 15000,
      monthlyPayment: 500,
      interestRate: 18.5,
      color: '#EF4444'
    },
    {
      id: '2',
      name: 'Student Loan',
      currentBalance: 35000,
      monthlyPayment: 400,
      interestRate: 6.8,
      color: '#3B82F6'
    },
    {
      id: '3',
      name: 'Car Loan',
      currentBalance: 22000,
      monthlyPayment: 450,
      interestRate: 4.2,
      color: '#10B981'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [newAccount, setNewAccount] = useState<Partial<DebtAccount>>({
    name: '',
    currentBalance: 0,
    monthlyPayment: 0,
    interestRate: 0,
    color: '#8B5CF6'
  });

  const availableColors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  const visualizationData = useMemo(() => {
    const data: DebtVisualizationData[] = [];
    const maxMonths = 120; // 10 years max projection
    const startDate = new Date();
    
    // Initialize account balances
    const accountBalances = debtAccounts.reduce((acc, account) => {
      acc[account.id] = account.currentBalance;
      return acc;
    }, {} as { [key: string]: number });

    for (let month = 0; month <= maxMonths; month++) {
      const currentDate = new Date(startDate);
      currentDate.setMonth(currentDate.getMonth() + month);
      
      let totalDebt = 0;
      const monthlyAccountData: { [accountId: string]: number } = {};
      
      // Calculate balances for each account
      debtAccounts.forEach(account => {
        if (accountBalances[account.id] > 0) {
          // Calculate interest for the month
          const monthlyInterest = (accountBalances[account.id] * (account.interestRate / 100)) / 12;
          const principalPayment = Math.max(0, account.monthlyPayment - monthlyInterest);
          
          // Update balance
          accountBalances[account.id] = Math.max(0, accountBalances[account.id] - principalPayment);
        }
        
        monthlyAccountData[account.id] = accountBalances[account.id];
        totalDebt += accountBalances[account.id];
      });

      // Check for milestones
      let milestone: string | undefined;
      if (month > 0) {
        const previousTotal = data[data.length - 1]?.totalDebt || 0;
        const initialTotal = debtAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
        
        if (totalDebt === 0 && previousTotal > 0) {
          milestone = 'Debt Free! 🎉';
        } else if (totalDebt <= initialTotal * 0.5 && previousTotal > initialTotal * 0.5) {
          milestone = 'Halfway Point! 🎯';
        } else if (totalDebt <= initialTotal * 0.25 && previousTotal > initialTotal * 0.25) {
          milestone = 'Final Quarter! 💪';
        }
      }

      data.push({
        month,
        date: currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        totalDebt,
        accounts: monthlyAccountData,
        milestone
      });

      // Stop if all debts are paid off
      if (totalDebt === 0) break;
    }

    return data;
  }, [debtAccounts]);

  const payoffDate = useMemo(() => {
    const lastDataPoint = visualizationData[visualizationData.length - 1];
    if (lastDataPoint && lastDataPoint.totalDebt === 0) {
      const startDate = new Date();
      const payoffDate = new Date(startDate);
      payoffDate.setMonth(payoffDate.getMonth() + lastDataPoint.month);
      return payoffDate;
    }
    return null;
  }, [visualizationData]);

  const totalCurrentDebt = debtAccounts.reduce((sum, account) => sum + account.currentBalance, 0);
  const totalMonthlyPayment = debtAccounts.reduce((sum, account) => sum + account.monthlyPayment, 0);

  const handleAddAccount = () => {
    if (newAccount.name && newAccount.currentBalance && newAccount.monthlyPayment) {
      const account: DebtAccount = {
        id: Date.now().toString(),
        name: newAccount.name,
        currentBalance: newAccount.currentBalance,
        monthlyPayment: newAccount.monthlyPayment,
        interestRate: newAccount.interestRate || 0,
        color: newAccount.color || availableColors[debtAccounts.length % availableColors.length]
      };
      
      setDebtAccounts([...debtAccounts, account]);
      setNewAccount({ name: '', currentBalance: 0, monthlyPayment: 0, interestRate: 0, color: '#8B5CF6' });
      setShowAddForm(false);
    }
  };

  const handleDeleteAccount = (id: string) => {
    setDebtAccounts(debtAccounts.filter(account => account.id !== id));
  };

  const handleEditAccount = (account: DebtAccount) => {
    setDebtAccounts(debtAccounts.map(acc => acc.id === account.id ? account : acc));
    setEditingAccount(null);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
          <p className="text-primary font-bold">
            Total Debt: {formatCurrency(data.totalDebt, currency.code)}
          </p>
          {data.milestone && (
            <p className="text-green-600 dark:text-green-400 font-semibold mt-1">
              {data.milestone}
            </p>
          )}
          <div className="mt-2 space-y-1">
            {debtAccounts.map(account => (
              <p key={account.id} className="text-sm" style={{ color: account.color }}>
                {account.name}: {formatCurrency(data.accounts[account.id] || 0, currency.code)}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.milestone) {
      return <Dot cx={cx} cy={cy} r={6} fill="#10B981" stroke="#ffffff" strokeWidth={2} />;
    }
    return null;
  };

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
          <TrendingDown className="h-8 w-8 text-primary" />
          Debt Repayment Visualization
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Track your journey to financial freedom with detailed progress visualization
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Current Debt</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalCurrentDebt, currency.code)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <TrendingDown className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Payment</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalMonthlyPayment, currency.code)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Projected Payoff</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {payoffDate ? formatDate(payoffDate) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Debt Reduction Timeline
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Projected debt balances over time based on current payment plans
          </p>
        </div>

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={visualizationData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                fontSize={12}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(value) => formatCurrency(value, currency.code, false)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Total debt line */}
              <Line
                type="monotone"
                dataKey="totalDebt"
                stroke="#6B4DE6"
                strokeWidth={3}
                dot={<CustomDot />}
                name="Total Debt"
                connectNulls={false}
              />
              
              {/* Individual account lines */}
              {debtAccounts.map(account => (
                <Line
                  key={account.id}
                  type="monotone"
                  dataKey={`accounts.${account.id}`}
                  stroke={account.color}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name={account.name}
                  connectNulls={false}
                />
              ))}
              
              {/* Reference line at zero */}
              <ReferenceLine y={0} stroke="#10B981" strokeDasharray="2 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Debt Accounts Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Debt Accounts
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
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Account name"
                value={newAccount.name || ''}
                onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <input
                type="number"
                placeholder="Current balance"
                value={newAccount.currentBalance || ''}
                onChange={(e) => setNewAccount({ ...newAccount, currentBalance: parseFloat(e.target.value) || 0 })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <input
                type="number"
                placeholder="Monthly payment"
                value={newAccount.monthlyPayment || ''}
                onChange={(e) => setNewAccount({ ...newAccount, monthlyPayment: parseFloat(e.target.value) || 0 })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <input
                type="number"
                placeholder="Interest rate (%)"
                value={newAccount.interestRate || ''}
                onChange={(e) => setNewAccount({ ...newAccount, interestRate: parseFloat(e.target.value) || 0 })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleAddAccount}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Add Account
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
          {debtAccounts.map(account => (
            <div key={account.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-4">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: account.color }}
                />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{account.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Balance: {formatCurrency(account.currentBalance, currency.code)} | 
                    Payment: {formatCurrency(account.monthlyPayment, currency.code)} | 
                    Rate: {account.interestRate}%
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingAccount(account.id)}
                  className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteAccount(account.id)}
                  className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DebtVisualization;