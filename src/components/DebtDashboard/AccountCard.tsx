import React from 'react';
import { 
  Home, 
  Car, 
  CreditCard, 
  User, 
  GraduationCap, 
  Briefcase, 
  Eye, 
  Edit,
  Calendar,
  Percent,
  DollarSign
} from 'lucide-react';
import { DebtAccount } from '../../types/debt';
import { formatCurrency, formatPercentage, formatDate } from '../../utils/calculations';
import { useCurrency } from '../../context/CurrencyContext';

interface AccountCardProps {
  account: DebtAccount;
}

/**
 * Individual debt account card component
 * Displays account details, progress, and action buttons
 */
const AccountCard: React.FC<AccountCardProps> = ({ account }) => {
  const { currency } = useCurrency();

  // Icon mapping for account types
  const getAccountIcon = (type: DebtAccount['type']) => {
    const iconMap = {
      mortgage: Home,
      auto: Car,
      credit_card: CreditCard,
      personal: User,
      student: GraduationCap,
      business: Briefcase
    };
    return iconMap[type] || CreditCard;
  };

  // Color mapping for account types with improved contrast
  const getAccountColor = (type: DebtAccount['type']) => {
    const colorMap = {
      mortgage: 'blue',
      auto: 'green',
      credit_card: 'orange',
      personal: 'indigo',
      student: 'teal',
      business: 'red'
    };
    return colorMap[type] || 'gray';
  };

  // Type label mapping
  const getTypeLabel = (type: DebtAccount['type']) => {
    const labelMap = {
      mortgage: 'Mortgage',
      auto: 'Auto Loan',
      credit_card: 'Credit Card',
      personal: 'Personal Loan',
      student: 'Student Loan',
      business: 'Business Loan'
    };
    return labelMap[type] || 'Loan';
  };

  const Icon = getAccountIcon(account.type);
  const color = getAccountColor(account.type);
  const typeLabel = getTypeLabel(account.type);
  
  // Calculate progress percentage
  const progressPercentage = ((account.originalAmount - account.currentBalance) / account.originalAmount) * 100;
  
  // Calculate time remaining
  const monthsRemaining = Math.ceil(
    (account.payoffDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)
  );
  const yearsRemaining = (monthsRemaining / 12).toFixed(1);

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border-l-4 border-${color}-500 p-6 transition-all duration-300 hover:shadow-xl`}
      data-testid={`account-card-${account.id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 bg-${color}-100 dark:bg-${color}-900/30 rounded-lg`}>
            <Icon className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {account.name}
            </h3>
            <p className={`text-sm text-${color}-600 dark:text-${color}-400 font-medium`}>
              {typeLabel}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="View account details"
            data-testid={`view-account-${account.id}`}
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Edit account"
            data-testid={`edit-account-${account.id}`}
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Current Balance */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Current Balance</span>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(account.currentBalance, currency.code)}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
          <div
            className={`bg-${color}-500 h-2 rounded-full transition-all duration-500`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{progressPercentage.toFixed(1)}% paid off</span>
          <span>{formatCurrency(account.originalAmount, currency.code, false)} original</span>
        </div>
      </div>

      {/* Account Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <DollarSign className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Monthly Payment</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {formatCurrency(account.monthlyPayment, currency.code)}
          </p>
          {account.extraPayment && (
            <p className="text-xs text-green-600 dark:text-green-400">
              +{formatCurrency(account.extraPayment, currency.code, false)} extra
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center gap-1 mb-1">
            <Percent className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Interest Rate</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {formatPercentage(account.interestRate)} APR
          </p>
        </div>

        <div>
          <div className="flex items-center gap-1 mb-1">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Payoff Date</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {formatDate(account.payoffDate)}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-1 mb-1">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Time Remaining</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {yearsRemaining} years
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          data-testid={`view-details-${account.id}`}
        >
          View Details
        </button>
        <button
          className={`flex-1 py-2 px-4 bg-${color}-500 hover:bg-${color}-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-${color}-500`}
          data-testid={`edit-account-button-${account.id}`}
        >
          Edit Account
        </button>
      </div>
    </div>
  );
};

export default AccountCard;