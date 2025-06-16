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

  // Comprehensive color mapping with all Tailwind classes explicitly defined
  const getAccountStyles = (type: DebtAccount['type']) => {
    const styleMap = {
      mortgage: {
        borderColor: 'border-blue-500',
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        iconColor: 'text-blue-600 dark:text-blue-400',
        progressBar: 'bg-blue-500',
        buttonBg: 'bg-blue-500 hover:bg-blue-600',
        buttonRing: 'focus:ring-blue-500'
      },
      auto: {
        borderColor: 'border-green-500',
        iconBg: 'bg-green-100 dark:bg-green-900/30',
        iconColor: 'text-green-600 dark:text-green-400',
        progressBar: 'bg-green-500',
        buttonBg: 'bg-green-500 hover:bg-green-600',
        buttonRing: 'focus:ring-green-500'
      },
      credit_card: {
        borderColor: 'border-orange-500',
        iconBg: 'bg-orange-100 dark:bg-orange-900/30',
        iconColor: 'text-orange-600 dark:text-orange-400',
        progressBar: 'bg-orange-500',
        buttonBg: 'bg-orange-500 hover:bg-orange-600',
        buttonRing: 'focus:ring-orange-500'
      },
      personal: {
        borderColor: 'border-purple-500',
        iconBg: 'bg-purple-100 dark:bg-purple-900/30',
        iconColor: 'text-purple-600 dark:text-purple-400',
        progressBar: 'bg-purple-500',
        buttonBg: 'bg-purple-500 hover:bg-purple-600',
        buttonRing: 'focus:ring-purple-500'
      },
      student: {
        borderColor: 'border-teal-500',
        iconBg: 'bg-teal-100 dark:bg-teal-900/30',
        iconColor: 'text-teal-600 dark:text-teal-400',
        progressBar: 'bg-teal-500',
        buttonBg: 'bg-teal-500 hover:bg-teal-600',
        buttonRing: 'focus:ring-teal-500'
      },
      business: {
        borderColor: 'border-red-500',
        iconBg: 'bg-red-100 dark:bg-red-900/30',
        iconColor: 'text-red-600 dark:text-red-400',
        progressBar: 'bg-red-500',
        buttonBg: 'bg-red-500 hover:bg-red-600',
        buttonRing: 'focus:ring-red-500'
      }
    };
    
    return styleMap[type] || styleMap.credit_card;
  };

  const Icon = getAccountIcon(account.type);
  const typeLabel = getTypeLabel(account.type);
  const styles = getAccountStyles(account.type);
  
  // Calculate progress percentage
  const progressPercentage = ((account.originalAmount - account.currentBalance) / account.originalAmount) * 100;
  
  // Calculate time remaining
  const monthsRemaining = Math.ceil(
    (account.payoffDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)
  );
  const yearsRemaining = (monthsRemaining / 12).toFixed(1);

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border-l-4 ${styles.borderColor} p-6 transition-all duration-300 hover:shadow-xl`}
      data-testid={`account-card-${account.id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 ${styles.iconBg} rounded-lg`}>
            <Icon className={`h-5 w-5 ${styles.iconColor}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {account.name}
            </h3>
            <p className={`text-sm ${styles.iconColor} font-medium`}>
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
            className={`${styles.progressBar} h-2 rounded-full transition-all duration-500`}
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
          className={`flex-1 py-2 px-4 ${styles.buttonBg} text-white rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 ${styles.buttonRing}`}
          data-testid={`edit-account-button-${account.id}`}
        >
          Edit Account
        </button>
      </div>
    </div>
  );
};

export default AccountCard;