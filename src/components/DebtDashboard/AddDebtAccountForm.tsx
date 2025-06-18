import React, { useState, useEffect } from 'react';
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
  Calculator,
  Clock
} from 'lucide-react';
import { CreateDebtAccountData, DebtAccountFormErrors } from '../../types/debt';
import { DebtService } from '../../services/debtService';
import { formatCurrency } from '../../utils/calculations';
import { calculateCurrentBalance, calculatePayoffDate, validatePaymentCoverage, calculateMonthlyPayment } from '../../utils/loanCalculations';
import { useCurrency } from '../../context/CurrencyContext';

interface AddDebtAccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountAdded: () => void;
}

interface LoanTermData {
  term: number;
  termUnit: 'years' | 'months';
}

/**
 * Dynamic form component for adding new debt accounts
 * Adapts fields and validation based on account type selection
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

  // Additional state for loan term (used for non-credit card accounts)
  const [loanTerm, setLoanTerm] = useState<LoanTermData>({
    term: 0,
    termUnit: 'years'
  });

  // Account type options with icons and descriptions
  const accountTypes = [
    { 
      value: 'credit_card', 
      label: 'Credit Card', 
      icon: CreditCard, 
      color: 'text-orange-600',
      description: 'Revolving credit with minimum payments'
    },
    { 
      value: 'mortgage', 
      label: 'Mortgage', 
      icon: Home, 
      color: 'text-blue-600',
      description: 'Home loan with fixed term and payments'
    },
    { 
      value: 'auto', 
      label: 'Auto Loan', 
      icon: Car, 
      color: 'text-green-600',
      description: 'Vehicle loan with fixed term and payments'
    },
    { 
      value: 'personal', 
      label: 'Personal Loan', 
      icon: User, 
      color: 'text-purple-600',
      description: 'Personal loan with fixed term and payments'
    },
    { 
      value: 'student', 
      label: 'Student Loan', 
      icon: GraduationCap, 
      color: 'text-teal-600',
      description: 'Education loan with fixed term and payments'
    },
    { 
      value: 'business', 
      label: 'Business Loan', 
      icon: Briefcase, 
      color: 'text-red-600',
      description: 'Business loan with fixed term and payments'
    }
  ];

  // Determine if current account type is credit card
  const isCreditCard = formData.type === 'credit_card';

  // Calculate monthly payment for non-credit card accounts
  const calculatedMonthlyPayment = !isCreditCard && formData.loan_amount > 0 && formData.interest_rate >= 0 && loanTerm.term > 0
    ? calculateMonthlyPayment(
        formData.loan_amount,
        formData.interest_rate,
        loanTerm.termUnit === 'years' ? loanTerm.term * 12 : loanTerm.term
      )
    : 0;

  // Update monthly payment when loan parameters change for non-credit cards
  useEffect(() => {
    if (!isCreditCard && calculatedMonthlyPayment > 0) {
      setFormData(prev => ({
        ...prev,
        monthly_payment: calculatedMonthlyPayment,
        minimum_payment: calculatedMonthlyPayment // For fixed loans, minimum = monthly payment
      }));
    }
  }, [isCreditCard, calculatedMonthlyPayment]);

  // Reset form when account type changes
  useEffect(() => {
    if (isCreditCard) {
      // Reset loan term for credit cards
      setLoanTerm({ term: 0, termUnit: 'years' });
      // Reset monthly payment to allow manual entry
      setFormData(prev => ({
        ...prev,
        monthly_payment: 0,
        minimum_payment: 0
      }));
    } else {
      // For loans, set reasonable defaults
      setLoanTerm({ term: 5, termUnit: 'years' });
    }
  }, [formData.type, isCreditCard]);

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

  /**
   * Validate form data based on account type
   */
  const validateForm = (): boolean => {
    const newErrors: DebtAccountFormErrors = {};

    // Common validations
    if (!formData.name.trim()) {
      newErrors.name = 'Account name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Account name must be at least 2 characters';
    }

    if (formData.loan_amount <= 0) {
      newErrors.loan_amount = isCreditCard ? 'Credit limit must be greater than 0' : 'Loan amount must be greater than 0';
    }

    if (formData.interest_rate < 0 || formData.interest_rate > 100) {
      newErrors.interest_rate = 'Interest rate must be between 0% and 100%';
    }

    // Date validation
    const today = new Date();
    const maxPastDate = new Date();
    maxPastDate.setFullYear(maxPastDate.getFullYear() - 30);

    if (formData.start_date > today) {
      newErrors.start_date = 'Start date cannot be in the future';
    } else if (formData.start_date < maxPastDate) {
      newErrors.start_date = 'Start date cannot be more than 30 years ago';
    }

    // Type-specific validations
    if (isCreditCard) {
      // Credit Card validations
      if (formData.monthly_payment <= 0) {
        newErrors.monthly_payment = 'Monthly payment must be greater than 0';
      }

      if (formData.minimum_payment <= 0) {
        newErrors.minimum_payment = 'Minimum payment must be greater than 0';
      } else if (formData.minimum_payment > formData.monthly_payment) {
        newErrors.minimum_payment = 'Minimum payment cannot exceed monthly payment';
      }

      // Validate that payment can cover interest for credit cards
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
    } else {
      // Fixed Loan validations
      if (loanTerm.term <= 0) {
        newErrors.loan_term = loanTerm.termUnit === 'years' 
          ? 'Loan term must be between 1-30 years' 
          : 'Loan term must be between 1-360 months';
      } else if (loanTerm.termUnit === 'years' && loanTerm.term > 30) {
        newErrors.loan_term = 'Loan term cannot exceed 30 years';
      } else if (loanTerm.termUnit === 'months' && loanTerm.term > 360) {
        newErrors.loan_term = 'Loan term cannot exceed 360 months';
      }

      // For fixed loans, monthly payment is calculated, so we validate the calculation is reasonable
      if (calculatedMonthlyPayment <= 0 && formData.loan_amount > 0 && loanTerm.term > 0) {
        newErrors.monthly_payment = 'Unable to calculate monthly payment with current parameters';
      }
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
    } else if (name === 'term') {
      setLoanTerm(prev => ({
        ...prev,
        term: parseInt(value) || 0
      }));
    } else if (name === 'termUnit') {
      setLoanTerm(prev => ({
        ...prev,
        termUnit: value as 'years' | 'months'
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
    
    // Mark all fields as touched for validation display
    const touchedFields: Record<string, boolean> = {
      name: true,
      type: true,
      loan_amount: true,
      interest_rate: true,
      start_date: true
    };

    if (isCreditCard) {
      touchedFields.monthly_payment = true;
      touchedFields.minimum_payment = true;
    } else {
      touchedFields.loan_term = true;
    }

    setTouched(touchedFields);
    
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
      setLoanTerm({ term: 0, termUnit: 'years' });
      setErrors({});
      setTouched({});
      
      // Notify parent components
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
    setLoanTerm({ term: 0, termUnit: 'years' });
    setErrors({});
    setTouched({});
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    handleReset();
    onClose();
  };

  /**
   * Generate input CSS classes
   */
  const inputClasses = (fieldName: string, disabled: boolean = false) => `
    block w-full rounded-lg py-3 px-4 
    text-gray-900 bg-white dark:bg-gray-800 dark:text-white 
    border ${touched[fieldName] && errors[fieldName as keyof DebtAccountFormErrors]
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
      : disabled
      ? 'border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700'
      : 'border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-primary'
    } 
    focus:outline-none focus:ring-2 
    transition duration-200
    ${disabled ? 'cursor-not-allowed opacity-60' : ''}
  `;

  if (!isOpen) return null;

  const selectedAccountType = accountTypes.find(type => type.value === formData.type);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 9999 
      }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      data-testid="add-debt-account-modal"
    >
      <div className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Add New Debt Account
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isCreditCard 
                  ? 'Enter your credit card details and payment information'
                  : 'Enter your loan details and we\'ll calculate monthly payments'
                }
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
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
              {selectedAccountType && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedAccountType.description}
                </p>
              )}
            </div>
          </div>

          {/* Account Type Info Banner */}
          {selectedAccountType && (
            <div className={`bg-gray-50 dark:bg-gray-700/50 border-l-4 border-${selectedAccountType.color.split('-')[1]}-500 rounded-lg p-4`}>
              <div className="flex items-center gap-3">
                <selectedAccountType.icon className={`h-6 w-6 ${selectedAccountType.color}`} />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {selectedAccountType.label} Account
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isCreditCard 
                      ? 'Enter your credit limit, current payment amount, and minimum payment requirement.'
                      : 'Enter your original loan amount, interest rate, and loan term. Monthly payments will be calculated automatically.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loan/Credit Details */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              {isCreditCard ? 'Credit Card Details' : 'Loan Details'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="loan_amount" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  {isCreditCard ? 'Credit Limit' : 'Original Loan Amount'}
                </label>
                <input
                  type="text"
                  name="loan_amount"
                  id="loan_amount"
                  value={formData.loan_amount > 0 ? formatCurrency(formData.loan_amount, currency.code, false) : ''}
                  onChange={handleInputChange}
                  className={inputClasses('loan_amount')}
                  placeholder={isCreditCard ? 'Enter credit limit' : 'Enter original loan amount'}
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
                  {isCreditCard ? 'Account Opened' : 'Loan Start Date'}
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

              {/* Loan Term - Only for non-credit card accounts */}
              {!isCreditCard && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Clock className="h-4 w-4 text-gray-500" />
                    Loan Term
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      name="term"
                      value={loanTerm.term || ''}
                      onChange={handleInputChange}
                      min="1"
                      max={loanTerm.termUnit === 'years' ? 30 : 360}
                      className={inputClasses('loan_term')}
                      placeholder={loanTerm.termUnit === 'years' ? "1-30" : "1-360"}
                      data-testid="loan-term-input"
                    />
                    <select
                      name="termUnit"
                      value={loanTerm.termUnit}
                      onChange={handleInputChange}
                      className={inputClasses('termUnit')}
                      data-testid="term-unit-select"
                    >
                      <option value="years">Years</option>
                      <option value="months">Months</option>
                    </select>
                  </div>
                  {touched.loan_term && errors.loan_term && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.loan_term}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Payment Information
            </h3>
            
            {isCreditCard ? (
              /* Credit Card Payment Fields */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="monthly_payment" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    Current Monthly Payment
                  </label>
                  <input
                    type="text"
                    name="monthly_payment"
                    id="monthly_payment"
                    value={formData.monthly_payment > 0 ? formatCurrency(formData.monthly_payment, currency.code, false) : ''}
                    onChange={handleInputChange}
                    className={inputClasses('monthly_payment')}
                    placeholder="Enter your current payment"
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
                    Minimum Payment Required
                  </label>
                  <input
                    type="text"
                    name="minimum_payment"
                    id="minimum_payment"
                    value={formData.minimum_payment > 0 ? formatCurrency(formData.minimum_payment, currency.code, false) : ''}
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
              </div>
            ) : (
              /* Fixed Loan Payment Display */
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Calculated Monthly Payment
                  </h4>
                </div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                  {calculatedMonthlyPayment > 0 
                    ? formatCurrency(calculatedMonthlyPayment, currency.code)
                    : 'Enter loan details to calculate'
                  }
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  This payment is calculated based on your loan amount, interest rate, and term.
                  {calculatedMonthlyPayment > 0 && (
                    <span className="block mt-1">
                      Total of {loanTerm.termUnit === 'years' ? loanTerm.term * 12 : loanTerm.term} payments
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Calculated Values Preview */}
          {formData.loan_amount > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Account Summary
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
                {!isCreditCard && calculatedMonthlyPayment > 0 && (
                  <>
                    <div>
                      <span className="text-blue-700 dark:text-blue-300">Monthly Payment:</span>
                      <div className="font-semibold text-blue-900 dark:text-blue-100">
                        {formatCurrency(calculatedMonthlyPayment, currency.code)}
                      </div>
                    </div>
                    <div>
                      <span className="text-blue-700 dark:text-blue-300">Total Interest:</span>
                      <div className="font-semibold text-blue-900 dark:text-blue-100">
                        {formatCurrency(
                          (calculatedMonthlyPayment * (loanTerm.termUnit === 'years' ? loanTerm.term * 12 : loanTerm.term)) - formData.loan_amount,
                          currency.code
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                {isCreditCard 
                  ? 'Current balance is calculated based on your payment history since account opening.'
                  : 'Values are calculated based on your loan parameters and payment schedule.'
                }
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium disabled:opacity-50"
              data-testid="reset-form-button"
            >
              Reset Form
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium disabled:opacity-50"
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
  );
};

export default AddDebtAccountForm;