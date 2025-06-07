import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { 
  CreditCard, 
  Home, 
  Car, 
  GraduationCap, 
  DollarSign, 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar,
  TrendingDown,
  Target,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { DebtAccount, DebtAccountFormData } from '../types';
import { formatCurrency, formatDate, formatPercentage } from '../utils/calculations';
import { useCurrency } from '../context/CurrencyContext';

const DebtDashboard: React.FC = () => {
  const { currency } = useCurrency();
  
  const [debtAccounts, setDebtAccounts] = useState<DebtAccount[]>([
    {
      id: '1',
      name: 'Chase Freedom Credit Card',
      currentBalance: 8500,
      monthlyPayment: 300,
      interestRate: 22.99,
      color: '#EF4444',
      accountType: 'credit_card',
      startDate: new Date('2023-01-15'),
      isRevolvingCredit: true,
      loanTerm: 24,
      termUnit: 'months',
      interestPaidToDate: 1250,
      paymentDueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 15)
    },
    {
      id: '2',
      name: 'Federal Student Loan',
      currentBalance: 28000,
      monthlyPayment: 320,
      interestRate: 5.8,
      color: '#3B82F6',
      accountType: 'student_loan',
      startDate: new Date('2020-09-01'),
      isRevolvingCredit: false,
      loanTerm: 10,
      termUnit: 'years',
      originalBalance: 35000,
      interestPaidToDate: 4200,
      paymentDueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      remainingTerm: 96,
      payoffDate: new Date('2030-09-01')
    },
    {
      id: '3',
      name: 'Honda Civic Auto Loan',
      currentBalance: 18500,
      monthlyPayment: 425,
      interestRate: 3.9,
      color: '#10B981',
      accountType: 'auto_loan',
      startDate: new Date('2022-06-01'),
      isRevolvingCredit: false,
      loanTerm: 5,
      termUnit: 'years',
      originalBalance: 25000,
      interestPaidToDate: 980,
      paymentDueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      remainingTerm: 36,
      payoffDate: new Date('2027-06-01')
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [formData, setFormData] = useState<DebtAccountFormData>({
    name: '',
    currentBalance: 0,
    interestRate: 0,
    accountType: 'credit_card',
    startDate: new Date(),
    isRevolvingCredit: true,
    loanTerm: 24,
    termUnit: 'months'
  });

  const accountTypeIcons = {
    credit_card: CreditCard,
    personal_loan: DollarSign,
    mortgage: Home,
    auto_loan: Car,
    student_loan: GraduationCap,
    other: AlertCircle
  };

  const accountTypeLabels = {
    credit_card: 'Credit Card',
    personal_loan: 'Personal Loan',
    mortgage: 'Mortgage',
    auto_loan: 'Auto Loan',
    student_loan: 'Student Loan',
    other: 'Other'
  };

  const availableColors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  // Calculate monthly payment based on loan terms
  const calculateMonthlyPayment = (balance: number, rate: number, term: number, termUnit: 'months' | 'years') => {
    const monthlyRate = rate / 100 / 12;
    const numberOfPayments = termUnit === 'years' ? term * 12 : term;
    
    if (monthlyRate === 0) {
      return balance / numberOfPayments;
    }
    
    return balance * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
           (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  };

  // Calculate dashboard metrics
  const dashboardMetrics = useMemo(() => {
    const totalDebt = debtAccounts.reduce((sum, account) => sum + account.currentBalance, 0);
    const totalMonthlyPayments = debtAccounts.reduce((sum, account) => sum + account.monthlyPayment, 0);
    const totalInterestPaid = debtAccounts.reduce((sum, account) => sum + account.interestPaidToDate, 0);
    const activeAccounts = debtAccounts.length;
    
    // Calculate weighted average interest rate
    const weightedInterestRate = debtAccounts.reduce((sum, account) => {
      return sum + (account.interestRate * account.currentBalance);
    }, 0) / totalDebt;

    // Find earliest payoff date for revolving credit accounts
    const revolvingAccounts = debtAccounts.filter(acc => acc.isRevolvingCredit);
    const termAccounts = debtAccounts.filter(acc => !acc.isRevolvingCredit && acc.payoffDate);
    
    let earliestPayoffDate: Date | null = null;
    if (termAccounts.length > 0) {
      earliestPayoffDate = new Date(Math.max(...termAccounts.map(acc => acc.payoffDate!.getTime())));
    }

    return {
      totalDebt,
      totalMonthlyPayments,
      totalInterestPaid,
      activeAccounts,
      weightedInterestRate: isNaN(weightedInterestRate) ? 0 : weightedInterestRate,
      earliestPayoffDate
    };
  }, [debtAccounts]);

  // Prepare data for charts
  const pieChartData = debtAccounts.map(account => ({
    name: account.name,
    value: account.currentBalance,
    color: account.color
  }));

  const barChartData = debtAccounts.map(account => ({
    name: account.name.length > 15 ? account.name.substring(0, 15) + '...' : account.name,
    balance: account.currentBalance,
    payment: account.monthlyPayment,
    rate: account.interestRate
  }));

  const calculatePayoffProjection = (account: DebtAccount) => {
    let balance = account.currentBalance;
    let months = 0;
    const monthlyRate = account.interestRate / 100 / 12;
    
    while (balance > 0 && months < 600) { // Max 50 years
      const interestCharge = balance * monthlyRate;
      const principalPayment = account.monthlyPayment - interestCharge;
      
      if (principalPayment <= 0) return null; // Payment too low
      
      balance -= principalPayment;
      months++;
    }
    
    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + months);
    return payoffDate;
  };

  const getProgressPercentage = (account: DebtAccount) => {
    if (account.isRevolvingCredit) {
      // For credit cards, show utilization (lower is better)
      const creditLimit = account.currentBalance * 2; // Assume current balance is 50% utilization
      return ((creditLimit - account.currentBalance) / creditLimit) * 100;
    } else {
      // For loans, show how much has been paid off
      const originalBalance = account.originalBalance || account.currentBalance;
      return ((originalBalance - account.currentBalance) / originalBalance) * 100;
    }
  };

  const handleAddAccount = () => {
    if (!formData.name || !formData.currentBalance || !formData.loanTerm) return;

    // Calculate monthly payment based on loan terms
    const calculatedPayment = calculateMonthlyPayment(
      formData.currentBalance,
      formData.interestRate,
      formData.loanTerm,
      formData.termUnit
    );

    const newAccount: DebtAccount = {
      id: Date.now().toString(),
      name: formData.name,
      currentBalance: formData.currentBalance,
      monthlyPayment: formData.monthlyPayment || calculatedPayment,
      interestRate: formData.interestRate,
      color: availableColors[debtAccounts.length % availableColors.length],
      accountType: formData.accountType,
      startDate: formData.startDate,
      isRevolvingCredit: formData.isRevolvingCredit,
      loanTerm: formData.loanTerm,
      termUnit: formData.termUnit,
      originalBalance: formData.currentBalance,
      interestPaidToDate: 0,
      paymentDueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
    };

    // Calculate payoff date based on loan term
    const payoffDate = new Date(newAccount.startDate);
    if (newAccount.termUnit === 'years') {
      payoffDate.setFullYear(payoffDate.getFullYear() + newAccount.loanTerm);
    } else {
      payoffDate.setMonth(payoffDate.getMonth() + newAccount.loanTerm);
    }
    newAccount.payoffDate = payoffDate;
    newAccount.remainingTerm = newAccount.loanTerm * (newAccount.termUnit === 'years' ? 12 : 1);

    setDebtAccounts([...debtAccounts, newAccount]);
    setFormData({
      name: '',
      currentBalance: 0,
      interestRate: 0,
      accountType: 'credit_card',
      startDate: new Date(),
      isRevolvingCredit: true,
      loanTerm: 24,
      termUnit: 'months'
    });
    setShowAddForm(false);
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
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey === 'balance' && `Balance: ${formatCurrency(entry.value, currency.code)}`}
              {entry.dataKey === 'payment' && `Payment: ${formatCurrency(entry.value, currency.code)}`}
              {entry.dataKey === 'rate' && `Rate: ${entry.value}%`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
          <Target className="h-8 w-8 text-primary" />
          Debt Management Dashboard
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive overview of your debt accounts and repayment progress
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Debt</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(dashboardMetrics.totalDebt, currency.code)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Payments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(dashboardMetrics.totalMonthlyPayments, currency.code)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Accounts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardMetrics.activeAccounts}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <TrendingDown className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Interest Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPercentage(dashboardMetrics.weightedInterestRate)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Debt Distribution Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Debt Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value), currency.code)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Account Comparison Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Account Comparison
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="balance" fill="#6B4DE6" name="Balance" />
                <Bar dataKey="payment" fill="#10B981" name="Monthly Payment" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Add Account Section */}
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
          <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Debt Account</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="e.g., Chase Freedom Credit Card"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Type
                </label>
                <select
                  value={formData.accountType}
                  onChange={(e) => setFormData({ ...formData, accountType: e.target.value as DebtAccount['accountType'] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {Object.entries(accountTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Balance
                </label>
                <input
                  type="number"
                  value={formData.currentBalance || ''}
                  onChange={(e) => setFormData({ ...formData, currentBalance: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Interest Rate (APR %)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.interestRate || ''}
                  onChange={(e) => setFormData({ ...formData, interestRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate.toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isRevolvingCredit"
                  checked={formData.isRevolvingCredit}
                  onChange={(e) => setFormData({ ...formData, isRevolvingCredit: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isRevolvingCredit" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Revolving Credit (Credit Card)
                </label>
              </div>
            </div>

            {/* Loan Term Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Loan Term
                </label>
                <input
                  type="number"
                  value={formData.loanTerm || ''}
                  onChange={(e) => setFormData({ ...formData, loanTerm: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="24"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Term Unit
                </label>
                <select
                  value={formData.termUnit || 'months'}
                  onChange={(e) => setFormData({ ...formData, termUnit: e.target.value as 'months' | 'years' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Monthly Payment (Optional)
                </label>
                <input
                  type="number"
                  value={formData.monthlyPayment || ''}
                  onChange={(e) => setFormData({ ...formData, monthlyPayment: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Auto-calculated"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Leave blank to auto-calculate based on loan term
                </p>
              </div>
            </div>

            <div className="flex gap-2">
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
          {debtAccounts.map(account => {
            const IconComponent = accountTypeIcons[account.accountType];
            const progressPercentage = getProgressPercentage(account);
            const projectedPayoff = calculatePayoffProjection(account);
            
            return (
              <div key={account.id} className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: account.color }}
                    />
                    <IconComponent className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {account.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {accountTypeLabels[account.accountType]} • {account.loanTerm} {account.termUnit}
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">Payment Due</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatDate(account.paymentDueDate)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Interest Paid to Date</p>
                    <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                      {formatCurrency(account.interestPaidToDate, currency.code)}
                    </p>
                  </div>
                  {account.remainingTerm && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Remaining Term</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {account.remainingTerm} months
                      </p>
                    </div>
                  )}
                  {projectedPayoff && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {account.isRevolvingCredit ? 'Projected Payoff' : 'Payoff Date'}
                      </p>
                      <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {formatDate(projectedPayoff)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {account.isRevolvingCredit ? 'Available Credit' : 'Payoff Progress'}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {progressPercentage.toFixed(1)}%
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(progressPercentage, 100)}%`,
                        backgroundColor: account.isRevolvingCredit 
                          ? (progressPercentage > 70 ? '#10B981' : progressPercentage > 30 ? '#F59E0B' : '#EF4444')
                          : '#10B981'
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {debtAccounts.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Debt Accounts
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You're debt-free! Add an account to start tracking your debt repayment journey.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
            >
              Add Your First Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebtDashboard;