import React, { useState, useMemo } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  ScatterChart, 
  Scatter, 
  AreaChart, 
  Area,
  ReferenceLine
} from 'recharts';
import { 
  TrendingDown, 
  PieChart as PieChartIcon, 
  BarChart3, 
  Activity, 
  Scatter3D,
  Calendar,
  Filter,
  Eye,
  EyeOff,
  RefreshCw,
  Target,
  DollarSign,
  Percent,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { formatCurrency, formatDate, formatPercentage } from '../utils';
import { useCurrency } from '../context/CurrencyContext';
import { useDebtAccounts } from '../hooks';

// Sample data - in a real app, this would come from your data store
const sampleDebtAccounts = [
  {
    id: '1',
    name: 'Chase Freedom Credit Card',
    currentBalance: 8500,
    monthlyPayment: 300,
    interestRate: 22.99,
    color: '#EF4444',
    accountType: 'credit_card' as const,
    startDate: new Date('2023-01-15'),
    isRevolvingCredit: true,
    loanTerm: 24,
    termUnit: 'months' as const,
    interestPaidToDate: 1250,
    paymentDueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 15),
    originalBalance: 10000
  },
  {
    id: '2',
    name: 'Federal Student Loan',
    currentBalance: 28000,
    monthlyPayment: 320,
    interestRate: 5.8,
    color: '#3B82F6',
    accountType: 'student_loan' as const,
    startDate: new Date('2020-09-01'),
    isRevolvingCredit: false,
    loanTerm: 10,
    termUnit: 'years' as const,
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
    accountType: 'auto_loan' as const,
    startDate: new Date('2022-06-01'),
    isRevolvingCredit: false,
    loanTerm: 5,
    termUnit: 'years' as const,
    originalBalance: 25000,
    interestPaidToDate: 980,
    paymentDueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    remainingTerm: 36,
    payoffDate: new Date('2027-06-01')
  },
  {
    id: '4',
    name: 'Home Mortgage',
    currentBalance: 285000,
    monthlyPayment: 1850,
    interestRate: 4.25,
    color: '#8B5CF6',
    accountType: 'mortgage' as const,
    startDate: new Date('2021-03-01'),
    isRevolvingCredit: false,
    loanTerm: 30,
    termUnit: 'years' as const,
    originalBalance: 320000,
    interestPaidToDate: 18500,
    paymentDueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    remainingTerm: 312,
    payoffDate: new Date('2051-03-01')
  },
  {
    id: '5',
    name: 'Personal Loan',
    currentBalance: 12000,
    monthlyPayment: 450,
    interestRate: 8.5,
    color: '#F59E0B',
    accountType: 'personal_loan' as const,
    startDate: new Date('2023-06-01'),
    isRevolvingCredit: false,
    loanTerm: 3,
    termUnit: 'years' as const,
    originalBalance: 15000,
    interestPaidToDate: 650,
    paymentDueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 15),
    remainingTerm: 24,
    payoffDate: new Date('2026-06-01')
  }
];

type ChartType = 'pie' | 'line' | 'bar' | 'scatter' | 'area';
type FilterType = 'all' | 'credit_card' | 'student_loan' | 'auto_loan' | 'mortgage' | 'personal_loan';

const DebtOverviewDashboard: React.FC = () => {
  const { currency } = useCurrency();
  const { 
    accounts, 
    totalDebt, 
    totalMonthlyPayments, 
    activeAccounts 
  } = useDebtAccounts(sampleDebtAccounts);

  const [activeChart, setActiveChart] = useState<ChartType>('pie');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [accountFilter, setAccountFilter] = useState<FilterType>('all');
  const [hiddenAccounts, setHiddenAccounts] = useState<Set<string>>(new Set());
  const [showProjections, setShowProjections] = useState(true);

  // Filter accounts based on current filters
  const filteredAccounts = useMemo(() => {
    return accounts.filter(account => {
      if (accountFilter !== 'all' && account.accountType !== accountFilter) return false;
      if (hiddenAccounts.has(account.id)) return false;
      return true;
    });
  }, [accounts, accountFilter, hiddenAccounts]);

  // Calculate dashboard metrics
  const dashboardMetrics = useMemo(() => {
    const filtered = filteredAccounts;
    const totalBalance = filtered.reduce((sum, acc) => sum + acc.currentBalance, 0);
    const totalPayments = filtered.reduce((sum, acc) => sum + acc.monthlyPayment, 0);
    const totalInterestPaid = filtered.reduce((sum, acc) => sum + acc.interestPaidToDate, 0);
    const weightedInterestRate = filtered.reduce((sum, acc) => {
      return sum + (acc.interestRate * acc.currentBalance);
    }, 0) / totalBalance;

    // Calculate debt-to-income ratio (assuming monthly income of $8000 for demo)
    const assumedMonthlyIncome = 8000;
    const debtToIncomeRatio = (totalPayments / assumedMonthlyIncome) * 100;

    // Find highest interest rate account
    const highestRateAccount = filtered.reduce((highest, acc) => 
      acc.interestRate > highest.interestRate ? acc : highest, filtered[0]);

    // Calculate total original debt
    const totalOriginalDebt = filtered.reduce((sum, acc) => sum + (acc.originalBalance || acc.currentBalance), 0);
    const totalPaidOff = totalOriginalDebt - totalBalance;
    const payoffProgress = (totalPaidOff / totalOriginalDebt) * 100;

    return {
      totalBalance,
      totalPayments,
      totalInterestPaid,
      weightedInterestRate: isNaN(weightedInterestRate) ? 0 : weightedInterestRate,
      debtToIncomeRatio,
      highestRateAccount,
      payoffProgress,
      totalPaidOff,
      accountCount: filtered.length
    };
  }, [filteredAccounts]);

  // Generate debt payoff projection data
  const payoffProjectionData = useMemo(() => {
    const data = [];
    const maxMonths = 120; // 10 years projection
    const startDate = new Date();
    
    // Initialize account balances
    const accountBalances = filteredAccounts.reduce((acc, account) => {
      acc[account.id] = account.currentBalance;
      return acc;
    }, {} as { [key: string]: number });

    for (let month = 0; month <= maxMonths; month++) {
      const currentDate = new Date(startDate);
      currentDate.setMonth(currentDate.getMonth() + month);
      
      let totalDebt = 0;
      const monthlyAccountData: { [accountId: string]: number } = {};
      
      filteredAccounts.forEach(account => {
        if (accountBalances[account.id] > 0) {
          const monthlyInterest = (accountBalances[account.id] * (account.interestRate / 100)) / 12;
          const principalPayment = Math.max(0, account.monthlyPayment - monthlyInterest);
          accountBalances[account.id] = Math.max(0, accountBalances[account.id] - principalPayment);
        }
        
        monthlyAccountData[account.id] = accountBalances[account.id];
        totalDebt += accountBalances[account.id];
      });

      data.push({
        month,
        date: currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        totalDebt,
        ...monthlyAccountData
      });

      if (totalDebt === 0) break;
    }

    return data;
  }, [filteredAccounts]);

  // Prepare data for different chart types
  const pieChartData = filteredAccounts.map(account => ({
    name: account.name,
    value: account.currentBalance,
    color: account.color,
    percentage: (account.currentBalance / dashboardMetrics.totalBalance) * 100
  }));

  const barChartData = filteredAccounts.map(account => ({
    name: account.name.length > 15 ? account.name.substring(0, 15) + '...' : account.name,
    balance: account.currentBalance,
    payment: account.monthlyPayment,
    interestPaid: account.interestPaidToDate,
    color: account.color
  }));

  const scatterData = filteredAccounts.map(account => ({
    x: account.interestRate,
    y: account.currentBalance,
    z: account.monthlyPayment,
    name: account.name,
    color: account.color
  }));

  // Generate payment history data (simulated)
  const paymentHistoryData = useMemo(() => {
    const data = [];
    const months = 12;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    for (let i = 0; i < months; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);
      
      const monthData: any = {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        date: date.toISOString(),
        total: 0
      };

      filteredAccounts.forEach(account => {
        const payment = account.monthlyPayment * (0.9 + Math.random() * 0.2); // Add some variation
        monthData[account.id] = payment;
        monthData.total += payment;
      });

      data.push(monthData);
    }

    return data;
  }, [filteredAccounts]);

  const toggleAccountVisibility = (accountId: string) => {
    setHiddenAccounts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accountId)) {
        newSet.delete(accountId);
      } else {
        newSet.add(accountId);
      }
      return newSet;
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value, currency.code)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const chartHeight = 400;
    
    switch (activeChart) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                outerRadius={120}
                dataKey="value"
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value), currency.code)} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={payoffProjectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(value) => formatCurrency(value, currency.code, false)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalDebt"
                stroke="#6B4DE6"
                strokeWidth={3}
                name="Total Debt"
                dot={{ r: 4 }}
              />
              {showProjections && filteredAccounts.map(account => (
                <Line
                  key={account.id}
                  type="monotone"
                  dataKey={account.id}
                  stroke={account.color}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name={account.name}
                  dot={false}
                />
              ))}
              <ReferenceLine y={0} stroke="#10B981" strokeDasharray="2 2" />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(value) => formatCurrency(value, currency.code, false)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="balance" fill="#6B4DE6" name="Current Balance" />
              <Bar dataKey="payment" fill="#10B981" name="Monthly Payment" />
              <Bar dataKey="interestPaid" fill="#EF4444" name="Interest Paid" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="x" 
                stroke="#6B7280" 
                fontSize={12} 
                name="Interest Rate"
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis 
                dataKey="y" 
                stroke="#6B7280" 
                fontSize={12} 
                name="Balance"
                tickFormatter={(value) => formatCurrency(value, currency.code, false)}
              />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'Interest Rate' ? `${value}%` : formatCurrency(Number(value), currency.code),
                  name
                ]}
              />
              <Scatter data={scatterData} fill="#6B4DE6">
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart data={paymentHistoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(value) => formatCurrency(value, currency.code, false)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {filteredAccounts.map((account, index) => (
                <Area
                  key={account.id}
                  type="monotone"
                  dataKey={account.id}
                  stackId="1"
                  stroke={account.color}
                  fill={account.color}
                  fillOpacity={0.6}
                  name={account.name}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const chartTypes = [
    { type: 'pie' as const, icon: PieChartIcon, label: 'Debt Distribution', description: 'Breakdown by account' },
    { type: 'line' as const, icon: TrendingDown, label: 'Payoff Timeline', description: 'Projected debt reduction' },
    { type: 'bar' as const, icon: BarChart3, label: 'Payment Analysis', description: 'Payments vs balances' },
    { type: 'scatter' as const, icon: Scatter3D, label: 'Rate vs Balance', description: 'Interest rate analysis' },
    { type: 'area' as const, icon: Activity, label: 'Payment History', description: 'Monthly payment trends' }
  ];

  const accountTypes = [
    { value: 'all', label: 'All Accounts' },
    { value: 'credit_card', label: 'Credit Cards' },
    { value: 'student_loan', label: 'Student Loans' },
    { value: 'auto_loan', label: 'Auto Loans' },
    { value: 'mortgage', label: 'Mortgages' },
    { value: 'personal_loan', label: 'Personal Loans' }
  ];

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
          <Target className="h-8 w-8 text-primary" />
          Debt Overview Dashboard
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive analysis and visualization of your debt portfolio
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Debt</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(dashboardMetrics.totalBalance, currency.code)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {dashboardMetrics.accountCount} accounts
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Payments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(dashboardMetrics.totalPayments, currency.code)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {dashboardMetrics.debtToIncomeRatio.toFixed(1)}% of income
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Interest Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPercentage(dashboardMetrics.weightedInterestRate)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Weighted average
              </p>
            </div>
            <Percent className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Payoff Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardMetrics.payoffProgress.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formatCurrency(dashboardMetrics.totalPaidOff, currency.code)} paid off
              </p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Alerts and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-6 border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 mt-1" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">High Interest Alert</h3>
              <p className="text-red-800 dark:text-red-200 text-sm">
                Your <strong>{dashboardMetrics.highestRateAccount?.name}</strong> has the highest interest rate at{' '}
                <strong>{formatPercentage(dashboardMetrics.highestRateAccount?.interestRate || 0)}</strong>.
                Consider prioritizing this debt for faster payoff.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Target className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Debt-to-Income Ratio</h3>
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                Your debt payments represent <strong>{dashboardMetrics.debtToIncomeRatio.toFixed(1)}%</strong> of your income.
                {dashboardMetrics.debtToIncomeRatio > 36 ? ' Consider reducing expenses or increasing income.' : ' You\'re in a healthy range!'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Interactive Debt Analysis
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Explore your debt data through different visualization perspectives
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            {/* Chart Type Selector */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {chartTypes.map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => setActiveChart(type)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${
                    activeChart === type
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  title={chartTypes.find(c => c.type === type)?.description}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm">{label}</span>
                </button>
              ))}
            </div>

            {/* Account Filter */}
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value as FilterType)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              {accountTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

            {/* Projections Toggle */}
            {activeChart === 'line' && (
              <button
                onClick={() => setShowProjections(!showProjections)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  showProjections
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Eye className="h-4 w-4" />
                <span className="text-sm">Projections</span>
              </button>
            )}
          </div>
        </div>

        {/* Chart Display */}
        <div className="mb-6">
          {renderChart()}
        </div>

        {/* Chart Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Accounts Shown</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {filteredAccounts.length} of {accounts.length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Interest Paid</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(dashboardMetrics.totalInterestPaid, currency.code)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Highest Rate</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatPercentage(dashboardMetrics.highestRateAccount?.interestRate || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Account Visibility Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Account Visibility
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map(account => (
            <div key={account.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: account.color }}
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {account.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatCurrency(account.currentBalance, currency.code)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleAccountVisibility(account.id)}
                className={`p-2 rounded-lg transition-colors ${
                  hiddenAccounts.has(account.id)
                    ? 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    : 'text-primary hover:text-primary-dark'
                }`}
              >
                {hiddenAccounts.has(account.id) ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DebtOverviewDashboard;