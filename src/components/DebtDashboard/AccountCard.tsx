import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, 
  Car, 
  CreditCard, 
  User, 
  GraduationCap, 
  Briefcase, 
  Eye, 
  Calendar,
  Percent,
  DollarSign,
  Trash2,
  AlertTriangle,
  Plus,
  MoreVertical,
  Pause,
  Minus,
  TrendingUp
} from 'lucide-react';
import { DebtAccount, LoanEventType } from '../../types/debt';
import { formatCurrency, formatPercentage, formatDate } from '../../utils/calculations';
import { useCurrency } from '../../context/CurrencyContext';
import { DebtService } from '../../services/debtService';
import {LoanEventModal} from './LoanEventModal';

interface AccountCardProps {
  account: DebtAccount;
  onAccountUpdated: () => void;
}

/**
 * Individual debt account card component
 * Displays account details, progress, and loan event action buttons
 */
const AccountCard: React.FC<AccountCardProps> = ({ account, onAccountUpdated }) => {
  const { currency } = useCurrency();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<LoanEventType>('extra_payment');
  const [showKebabMenu, setShowKebabMenu] = useState(false);
  const kebabMenuRef = useRef<HTMLDivElement>(null);

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

  /**
   * Handle account deletion
   */
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await DebtService.deleteDebtAccount(account.id);
      onAccountUpdated();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting account:', error);
      // You might want to show an error toast here
    } finally {
      setDeleting(false);
    }
  };

  /**
   * Handle extra payment button click
   */
  const handleExtraPayment = () => {
    setSelectedEventType('extra_payment');
    setShowEventModal(true);
  };

  /**
   * Handle kebab menu option selection
   */
  const handleKebabMenuOption = (eventType: LoanEventType) => {
    setSelectedEventType(eventType);
    setShowEventModal(true);
    setShowKebabMenu(false);
  };

  /**
   * Handle event creation success
   */
  const handleEventCreated = () => {
    onAccountUpdated(); // Refresh account data
  };

  /**
   * Close kebab menu when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (kebabMenuRef.current && !kebabMenuRef.current.contains(event.target as Node)) {
        setShowKebabMenu(false);
      }
    };

    if (showKebabMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showKebabMenu]);

  const Icon = getAccountIcon(account.type);
  const typeLabel = getTypeLabel(account.type);
  const styles = getAccountStyles(account.type);
  
  // Calculate progress percentage
  const progressPercentage = ((account.loan_amount - account.current_balance) / account.loan_amount) * 100;
  
  // Calculate time remaining
  const totalMonthsRemaining = Math.ceil(
    (account.payoff_date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  const years = Math.floor(totalMonthsRemaining / 12);
  const months = totalMonthsRemaining % 12;
  const timeRemainingParts = [];
  if (years) timeRemainingParts.push(`${years} year${years === 1 ? '' : 's'}`);
  if (months) timeRemainingParts.push(`${months} month${months === 1 ? '' : 's'}`);

  const timeRemainingStr = timeRemainingParts.join(' / ') || '0 months';
  
  return (
    <>
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border-l-4 ${styles.borderColor} p-6 transition-all duration-300 hover:shadow-xl relative`}
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
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 transition-colors duration-200 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              aria-label="Delete account"
              data-testid={`delete-account-${account.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Current Balance */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Current Balance</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(account.current_balance, currency.code)}
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
            <span>{formatCurrency(account.loan_amount, currency.code, false)} original</span>
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
              {formatCurrency(account.monthly_payment, currency.code)}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1 mb-1">
              <Percent className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Interest Rate</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatPercentage(account.interest_rate)} APR
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1 mb-1">
              <Calendar className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Payoff Date</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatDate(account.payoff_date)}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1 mb-1">
              <Calendar className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Time Remaining</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {timeRemainingStr}
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
          
          {/* Extra Payment Button */}
          <button
            onClick={handleExtraPayment}
            className="flex items-center gap-1 py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            data-testid={`extra-payment-${account.id}`}
          >
            <Plus className="h-3 w-3" />
            Extra Payment
          </button>

          {/* Kebab Menu */}
          <div className="relative" ref={kebabMenuRef}>
            <button
              onClick={() => setShowKebabMenu(!showKebabMenu)}
              className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label="More options"
              data-testid={`kebab-menu-${account.id}`}
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {/* Kebab Menu Dropdown */}
            {showKebabMenu && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 animate-in slide-in-from-top-2 duration-200">
                <div className="py-1">
                  <button
                    onClick={() => handleKebabMenuOption('payment_skip')}
                    className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                    data-testid="payment-skip-option"
                  >
                    <Pause className="h-4 w-4 text-orange-500" />
                    Payment Skip
                  </button>
                  <button
                    onClick={() => handleKebabMenuOption('loan_withdrawal')}
                    className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                    data-testid="loan-withdrawal-option"
                  >
                    <Minus className="h-4 w-4 text-red-500" />
                    Loan Withdrawal
                  </button>
                  <button
                    onClick={() => handleKebabMenuOption('interest_rate_change')}
                    className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                    data-testid="interest-rate-change-option"
                  >
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    Interest Rate Change
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Delete Account
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Are you sure you want to delete "{account.name}"? This will remove the account 
                from your dashboard and cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loan Event Modal */}
      <LoanEventModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        debtAccountId={account.id}
        eventType={selectedEventType}
        accountName={account.name}
        currentBalance={account.current_balance}
        currentInterestRate={account.interest_rate}
        monthlyPayment={account.monthly_payment}
        onEventCreated={handleEventCreated}
      />
    </>
  );
};

export default AccountCard;