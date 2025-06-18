import React, { useState } from 'react';
import { 
  Plus, 
  X, 
  DollarSign, 
  Percent, 
  Calendar, 
  Type,
  Home,
  Car,
  CreditCard,
  User,
  GraduationCap,
  Briefcase,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { CreateDebtAccountData, DebtAccountFormErrors } from '../../types/debt';
import { DebtService } from '../../services/debtService';
import { formatCurrency } from '../../utils/calculations';
import { useCurrency } from '../../context/CurrencyContext';

interface AddDebtAccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountAdded: () => void;
}

/**
 * Form component for adding new debt accounts
 * Features comprehensive validation, type selection, and responsive design
 */
const AddDebtAccountForm: React.FC<AddDebtAccountFormProps> = ({ 
  isOpen, 
  onClose, 
  onAccountAdded 
}) => {
  const { currency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<DebtAccountFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState<CreateDebtAccountData>({
    name: '',
    type: 'credit_card',
    current_balance: 0,
    original_amount: 0,
    monthly_payment: 0,
    interest_rate: 0,
    payoff_date: new Date(),
    minimum_payment: 0,
    extra_payment: 0
  });

  // Account type options with icons
  const accountTypes = [
    { value: 'mortgage', label: 'Mortgage', icon: Home, color: 'text-blue-600' },
    { value: 'auto', label: 'Auto Loan', icon: Car, color: 'text-green-600' },
    { value: 'credit_card', label: 'Credit Card', icon: CreditCard, color: 'text-orange-600' },
    { value: 'personal', label: 'Personal Loan', icon: User, color: 'text-purple-600' },
    { value: 'student', label: 'Student Loan', icon: GraduationCap, color: 'text-teal-600' },
    { value: 'business', label: 'Business Loan', icon: Briefcase, color: 'text-red-600' }
  ];

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: DebtAccountFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Account name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Account name must be at least 2 characters';
    }

    if (formData.current_balance <= 0) {
      newErrors.current_balance = 'Current balance must be greater than 0';
    }

    if (formData.original_amount <= 0) {
      newErrors.original_amount = 'Original amount must be greater than 0';
    } else if (formData.current_balance > formData.original_amount) {
      newErrors.current_balance = 'Current balance cannot exceed original amount';
    }

    if (formData.monthly_payment <= 0) {
      newErrors.monthly_payment = 'Monthly payment must be greater than 0';
    }

    if (formData.minimum_payment <= 0) {
      newErrors.minimum_payment = 'Minimum payment must be greater than 0';
    } else if (formData.minimum_payment > formData.monthly_payment) {
      newErrors.minimum_payment = 'Minimum payment cannot exceed monthly payment';
    }

    if (formData.interest_rate < 0 || formData.interest_rate > 100) {
      newErrors.interest_rate = 'Interest rate must be between 0% and 100%';
    }

    if (formData.extra_payment && formData.extra_payment < 0) {
      newErrors.extra_payment = 'Extra payment cannot be negative';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (formData.payoff_date <= today) {
      newErrors.payoff_date = 'Payoff date must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle input changes
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setTouched(prev => ({ ...prev, [name]: true }));

    if (name === 'current_balance' || name === 'original_amount' || 
        name === 'monthly_payment' || name === 'minimum_payment' || 
        name === 'extra_payment') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value.replace(/\D/g, '') || '0')
      }));
    } else if (name === 'interest_rate') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else if (name === 'payoff_date') {
      setFormData(prev => ({
        ...prev,
        [name]: new Date(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name as keyof DebtAccountFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await DebtService.createDebtAccount(formData);
      
      // Reset form
      setFormData({
        name: '',
        type: 'credit_card',
        current_balance: 0,
        original_amount: 0,
        monthly_payment: 0,
        interest_rate: 0,
        payoff_date: new Date(),
        minimum_payment: 0,
        extra_payment: 0
      });
      setErrors({});
      setTouched({});
      
      onAccountAdded();
      onClose();
    } catch (error) {
      console.error('Error creating debt account:', error);
      setErrors({
        name: error instanceof Error ? error.message : 'Failed to create account'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle form reset
   */
  const handleReset = () => {
    setFormData({
      name: '',
      type: 'credit_card',
      current_balance: 0,
      original_amount: 0,
      monthly_payment: 0,
      interest_rate: 0,
      payoff_date: new Date(),
      minimum_payment: 0,
      extra_payment: 0
    });
    setErrors({});
    setTouched({});
  };

  /**
   * Generate input CSS classes
   */
  const inputClasses = (fieldName: string) => `
    block w-full rounded-lg py-3 px-4 
    text-gray-900 bg-white dark:bg-gray-800 dark:text-white 
    border ${touched[fieldName] && errors[fieldName as keyof DebtAccountFormErrors]
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
      : 'border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-primary'
    } 
    focus:outline-none focus:ring-2 
    transition duration-200
  `;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      data-testid="add-debt-account-modal"
    >
      <div className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Add New Debt Account
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track a new debt account and monitor your progress
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close form"
              data-testid="close-form-button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Account Name and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Type className="h-4 w-4 text-gray-500" />
                  Account Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={inputClasses('name')}
                  placeholder="e.g., Chase Sapphire Reserve"
                  data-testid="account-name-input"
                />
                {touched.name && errors.name && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="type" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  Account Type
                </label>
                <select
                  name="type"
                  id="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className={inputClasses('type')}
                  data-testid="account-type-select"
                >
                  {accountTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Balance Information */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Balance Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="original_amount" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    Original Amount
                  </label>
                  <input
                    type="text"
                    name="original_amount"
                    id="original_amount"
                    value={formatCurrency(formData.original_amount, currency.code, false)}
                    onChange={handleInputChange}
                    className={inputClasses('original_amount')}
                    placeholder="Enter original loan amount"
                    data-testid="original-amount-input"
                  />
                  {touched.original_amount && errors.original_amount && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.original_amount}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="current_balance" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    Current Balance
                  </label>
                  <input
                    type="text"
                    name="current_balance"
                    id="current_balance"
                    value={formatCurrency(formData.current_balance, currency.code, false)}
                    onChange={handleInputChange}
                    className={inputClasses('current_balance')}
                    placeholder="Enter current balance"
                    data-testid="current-balance-input"
                  />
                  {touched.current_balance && errors.current_balance && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.current_balance}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Payment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="monthly_payment" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    Monthly Payment
                  </label>
                  <input
                    type="text"
                    name="monthly_payment"
                    id="monthly_payment"
                    value={formatCurrency(formData.monthly_payment, currency.code, false)}
                    onChange={handleInputChange}
                    className={inputClasses('monthly_payment')}
                    placeholder="Enter monthly payment"
                    data-testid="monthly-payment-input"
                  />
                  {touched.monthly_payment && errors.monthly_payment && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.monthly_payment}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="minimum_payment" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    Minimum Payment
                  </label>
                  <input
                    type="text"
                    name="minimum_payment"
                    id="minimum_payment"
                    value={formatCurrency(formData.minimum_payment, currency.code, false)}
                    onChange={handleInputChange}
                    className={inputClasses('minimum_payment')}
                    placeholder="Enter minimum payment"
                    data-testid="minimum-payment-input"
                  />
                  {touched.minimum_payment && errors.minimum_payment && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.minimum_payment}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="extra_payment" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Plus className="h-4 w-4 text-gray-500" />
                    Extra Payment
                  </label>
                  <input
                    type="text"
                    name="extra_payment"
                    id="extra_payment"
                    value={formatCurrency(formData.extra_payment || 0, currency.code, false)}
                    onChange={handleInputChange}
                    className={inputClasses('extra_payment')}
                    placeholder="Optional extra payment"
                    data-testid="extra-payment-input"
                  />
                  {touched.extra_payment && errors.extra_payment && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.extra_payment}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Interest Rate and Payoff Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="interest_rate" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Percent className="h-4 w-4 text-gray-500" />
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  name="interest_rate"
                  id="interest_rate"
                  value={formData.interest_rate || ''}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className={inputClasses('interest_rate')}
                  placeholder="e.g., 18.99"
                  data-testid="interest-rate-input"
                />
                {touched.interest_rate && errors.interest_rate && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.interest_rate}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="payoff_date" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  Expected Payoff Date
                </label>
                <input
                  type="date"
                  name="payoff_date"
                  id="payoff_date"
                  value={formData.payoff_date.toISOString().split('T')[0]}
                  onChange={handleInputChange}
                  className={inputClasses('payoff_date')}
                  data-testid="payoff-date-input"
                />
                {touched.payoff_date && errors.payoff_date && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.payoff_date}
                  </p>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium"
                data-testid="reset-form-button"
              >
                Reset Form
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium"
                data-testid="cancel-button"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-center gap-2 font-medium shadow-lg disabled:cursor-not-allowed"
                data-testid="submit-button"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Add Account
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDebtAccountForm;