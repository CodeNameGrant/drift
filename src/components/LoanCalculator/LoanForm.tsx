import React, { useState, useCallback, useMemo } from 'react';
import type { LoanFormData, FormErrors } from '../../types';
import { validateLoanForm, formatCurrency, formatNumberWithCommas } from '../../utils';
import { useCurrency } from '../../context/CurrencyContext';
import { useDebounce } from '../../hooks';
import { DEFAULT_VALUES, DEBOUNCE_DELAYS } from '../../utils/constants';

interface LoanFormProps {
  /** Callback function called when form is submitted with valid data */
  onCalculate: (data: LoanFormData) => void;
}

/**
 * Loan calculation form component
 * Handles user input for loan parameters and validates data before submission
 */
const LoanForm: React.FC<LoanFormProps> = ({ onCalculate }) => {
  const today = new Date();
  const { currency } = useCurrency();

  // Form state
  const [formData, setFormData] = useState<LoanFormData>({
    loanAmount: DEFAULT_VALUES.LOAN_AMOUNT,
    interestRate: DEFAULT_VALUES.INTEREST_RATE,
    loanTerm: DEFAULT_VALUES.LOAN_TERM,
    termUnit: 'years',
    startDate: today
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Debounce form data for validation to avoid excessive validation calls
  const debouncedFormData = useDebounce(formData, DEBOUNCE_DELAYS.FORM_VALIDATION);

  // Validate form data when debounced data changes
  useMemo(() => {
    const validationErrors = validateLoanForm(debouncedFormData);
    setErrors(validationErrors);
  }, [debouncedFormData]);

  /**
   * Handle input field changes with proper type conversion
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => {
      if (name === 'loanAmount') {
        return { ...prev, [name]: parseFloat(value.replace(/\D/g, '') || '0') };
      } else if (name === 'startDate') {
        return { ...prev, [name]: new Date(value) };
      } else if (name === 'termUnit') {
        return { ...prev, [name]: value as 'years' | 'months' };
      } else {
        const numValue = type === 'number' ? parseFloat(value) || 0 : value;
        return { ...prev, [name]: numValue };
      }
    });
    
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  /**
   * Handle field blur events for validation
   */
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateLoanForm(formData);
    setErrors(validationErrors);
    
    // Mark all fields as touched to show validation errors
    setTouched({
      loanAmount: true,
      interestRate: true,
      loanTerm: true
    });
    
    // Submit if no validation errors
    if (Object.keys(validationErrors).length === 0) {
      onCalculate(formData);
    }
  }, [formData, onCalculate]);

  /**
   * Clear form to default values
   */
  const handleClear = useCallback(() => {
    setFormData({
      loanAmount: 0,
      interestRate: 0,
      loanTerm: 0,
      termUnit: 'years',
      startDate: today
    });
    setErrors({});
    setTouched({});
  }, [today]);

  /**
   * Prevent non-numeric paste for loan amount field
   */
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('Text');
    if (!/^\d+$/.test(pasted)) {
      e.preventDefault();
    }
  }, []);

  /**
   * Generate CSS classes for input fields based on validation state
   */
  const getInputClasses = useCallback((fieldName: string) => {
    const baseClasses = 'block w-full rounded-lg py-3 px-4 text-gray-900 bg-white dark:bg-gray-800 dark:text-white border focus:outline-none focus:ring-2 transition duration-200';
    const errorClasses = 'border-red-500 focus:border-red-500 focus:ring-red-500';
    const normalClasses = 'border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-primary';
    
    return `${baseClasses} ${touched[fieldName] && errors[fieldName] ? errorClasses : normalClasses}`;
  }, [touched, errors]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <div className="space-y-4">
        {/* Loan Amount Field */}
        <div>
          <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Loan Amount
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <input
              type="text"
              name="loanAmount"
              id="loanAmount"
              value={formatCurrency(formData.loanAmount, currency.code, false)}
              onChange={handleInputChange}
              onPaste={handlePaste}
              onBlur={handleBlur}
              className={getInputClasses('loanAmount')}
              placeholder="Enter loan amount"
              aria-describedby={touched.loanAmount && errors.loanAmount ? 'loanAmount-error' : undefined}
            />
          </div>
          {touched.loanAmount && errors.loanAmount && (
            <p id="loanAmount-error" className="mt-1 text-sm text-red-500" role="alert">
              {errors.loanAmount}
            </p>
          )}
        </div>

        {/* Interest Rate Field */}
        <div>
          <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Annual Interest Rate (%)
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <input
              type="number"
              name="interestRate"
              id="interestRate"
              value={formData.interestRate || ''}
              onChange={handleInputChange}
              onBlur={handleBlur}
              min="0.1"
              max="100"
              step="0.1"
              className={getInputClasses('interestRate')}
              placeholder="Enter interest rate"
              aria-describedby={touched.interestRate && errors.interestRate ? 'interestRate-error' : undefined}
            />
          </div>
          {touched.interestRate && errors.interestRate && (
            <p id="interestRate-error" className="mt-1 text-sm text-red-500" role="alert">
              {errors.interestRate}
            </p>
          )}
        </div>

        {/* Loan Term Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="loanTerm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Loan Term
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="number"
                name="loanTerm"
                id="loanTerm"
                value={formData.loanTerm || ''}
                onChange={handleInputChange}
                onBlur={handleBlur}
                min="1"
                max={formData.termUnit === 'years' ? 30 : 360}
                className={getInputClasses('loanTerm')}
                placeholder={formData.termUnit === 'years' ? "1-30" : "1-360"}
                aria-describedby={touched.loanTerm && errors.loanTerm ? 'loanTerm-error' : undefined}
              />
            </div>
          </div>
          <div>
            <label htmlFor="termUnit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Term Unit
            </label>
            <select
              name="termUnit"
              id="termUnit"
              value={formData.termUnit}
              onChange={handleInputChange}
              className="block w-full rounded-lg py-3 px-4 text-gray-900 bg-white dark:bg-gray-800 dark:text-white border border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-primary focus:outline-none focus:ring-2 transition duration-200"
            >
              <option value="years">Years</option>
              <option value="months">Months</option>
            </select>
          </div>
        </div>
        {touched.loanTerm && errors.loanTerm && (
          <p id="loanTerm-error" className="mt-1 text-sm text-red-500" role="alert">
            {errors.loanTerm}
          </p>
        )}

        {/* Start Date Field */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Date
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <input
              type="date"
              name="startDate"
              id="startDate"
              value={formData.startDate.toISOString().split('T')[0]}
              onChange={handleInputChange}
              className="block w-full rounded-lg py-3 px-4 text-gray-900 bg-white dark:bg-gray-800 dark:text-white border border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-primary focus:outline-none focus:ring-2 transition duration-200"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 pt-2">
        <button
          type="button"
          onClick={handleClear}
          className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Clear Form
        </button>
        <button
          type="submit"
          className="flex-1 py-3 px-4 bg-primary hover:bg-primary-darker text-white rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Calculate
        </button>
      </div>
    </form>
  );
};

export default LoanForm;