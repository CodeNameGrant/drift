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
  Loader2,
  Calculator
} from 'lucide-react';
import { CreateDebtAccountData, DebtAccountFormErrors } from '../../types/debt';
import { DebtService } from '../../services/debtService';
import { formatCurrency } from '../../utils/calculations';
import { calculateCurrentBalance, calculatePayoffDate, validatePaymentCoverage } from '../../utils/loanCalculations';
import { useCurrency } from '../../context/CurrencyContext';

interface AddDebtAccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountAdded: () => void;
}

/**
 * Form component for adding new debt accounts
 * Features loan amount input, start date, and automatic current balance calculation
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
    loan_amount: 0,
    monthly_payment: 0,
    interest_rate: 0,
    start_date: new Date(),
    minimum_payment: 0
  });

  // Calculate derived values for preview
  const currentBalance = formData.loan_amount > 0 && formData.monthly_payment > 0 && formData.interest_rate >= 0
    ? calculateCurrentBalance(
        formData.loan_amount,
        formData.monthly_payment,
        formData.interest_rate,
        formData.start_date
      )
    : formData.loan_amount;

  const projectedPayoffDate = currentBalance > 0 && formData.monthly_payment > 0
    ? calculatePayoffDate(currentBalance, formData.monthly_payment, formData.interest_rate)
    : new Date();

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

    if (formData.loan_amount <= 0) {
      newErrors.loan_amount = 'Loan amount must be greater than 0';
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

    // Validate that payment can cover interest
    if (formData.loan_amount > 0 && formData.monthly_payment > 0 && formData.interest_rate > 0) {
      const paymentValidation = validatePaymentCoverage(
        currentBalance,
        formData.monthly_payment,
        formData.interest_rate
      );
      
      if (!paymentValidation.isValid) {
        newErrors.monthly_payment = `Payment must be at least ${formatCurrency(paymentValidation.minimumRequired, currency.code)} to cover interest`;
      }
    }

    const today = new Date();
    const maxPastDate = new Date();
    maxPastDate.setFullYear(maxPastDate.getFullYear() - 30); // 30 years ago max

    if (formData.start_date > today) {
      newErrors.start_date = 'Start date cannot be in the future';
    } else if (formData.start_date < maxPastDate) {
      newErrors.start_date = 'Start date cannot be more than 30 years ago';
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

    if (name === 'loan_amount' || name === 'monthly_payment' || name === 'minimum_payment') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value.replace(/\D/g, '') || '0')
      }));
    } else if (name === 'interest_rate') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else if (name === 'start_date') {
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
        loan_amount: 0,
        monthly_payment: 0,
        interest_rate: 0,
        start_date: new Date(),
        minimum_payment: 0
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
      loan_amount: 0,
      monthly_payment: 0,
      interest_rate: 0,
      start_date: new Date(),
      minimum_payment: 0
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
                  Enter your loan details and we'll calculate the current balance
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
                  {accountTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Loan Details */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Loan Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="loan_amount" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    Original Loan Amount
                  </label>
                  <input
                    type="text"
                    name="loan_amount"
                    id="loan_amount"
                    value={formatCurrency(formData.loan_amount, currency.code, false)}
                    onChange={handleInputChange}
                    className={inputClasses('loan_amount')}
                    placeholder="Enter original loan amount"
                    data-testid="loan-amount-input"
                  />
                  {touched.loan_amount && errors.loan_amount && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.loan_amount}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="start_date" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    Loan Start Date
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    id="start_date"
                    value={formData.start_date.toISOString().split('T')[0]}
                    onChange={handleInputChange}
                    className={inputClasses('start_date')}
                    data-testid="start-date-input"
                  />
                  {touched.start_date && errors.start_date && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.start_date}
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
              </div>
            </div>

            {/* Calculated Values Preview */}
            {formData.loan_amount > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calculator className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Calculated Values
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Current Balance:</span>
                    <div className="font-semibold text-blue-900 dark:text-blue-100">
                      {formatCurrency(currentBalance, currency.code)}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Projected Payoff:</span>
                    <div className="font-semibold text-blue-900 dark:text-blue-100">
                      {projectedPayoffDate.toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  These values are calculated based on your loan details and payment history.
                </p>
              </div>
            )}

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