import React, { useState } from 'react';
import { LoanFormData, FormErrors } from '../types';
import { validateForm, formatCurrency } from '../utils/calculations';
import { useCurrency } from '../context/CurrencyContext';
import { Calculator, Plus } from 'lucide-react';

interface LoanFormProps {
  onCalculate: (data: LoanFormData) => void;
}

/**
 * Enhanced loan form component with extra payment simulation inputs
 * Includes comprehensive validation and accessibility features
 */
const LoanForm: React.FC<LoanFormProps> = ({ onCalculate }) => {
  const today = new Date();
  const { currency } = useCurrency();

  const [formData, setFormData] = useState<LoanFormData>({
    loanAmount: 1_000_000,
    interestRate: 10,
    loanTerm: 10,
    termUnit: 'years',
    startDate: today,
    extraPayment1: 0,
    extraPayment2: 0
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  /**
   * Handle input changes with proper type conversion and validation
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (name === 'loanAmount' || name === 'extraPayment1' || name === 'extraPayment2') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value.replace(/\D/g, '') || '0')
      }));
    } else if (name === 'startDate') {
      setFormData(prev => ({
        ...prev,
        [name]: new Date(value)
      }));
    } else if (name === 'termUnit') {
      setFormData(prev => ({
        ...prev,
        [name]: value as 'years' | 'months'
      }));
    } else {
      const numValue = type === 'number' ? parseFloat(value) || 0 : value;
      
      setFormData(prev => ({
        ...prev,
        [name]: numValue
      }));
    }
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  /**
   * Handle field blur events for validation
   */
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
  };

  /**
   * Handle form submission with comprehensive validation
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    
    setTouched({
      loanAmount: true,
      interestRate: true,
      loanTerm: true,
      extraPayment1: true,
      extraPayment2: true
    });
    
    if (Object.keys(validationErrors).length === 0) {
      onCalculate(formData);
    }
  };

  /**
   * Clear form and reset to default values
   */
  const handleClear = () => {
    setFormData({
      loanAmount: 0,
      interestRate: 0,
      loanTerm: 0,
      termUnit: 'years',
      startDate: today,
      extraPayment1: 0,
      extraPayment2: 0
    });
    setErrors({});
    setTouched({});
  };

  /**
   * Prevent non-numeric paste for currency fields
   */
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('Text');
    if (!/^\d+$/.test(pasted)) {
      e.preventDefault();
    }
  };

  /**
   * Generate input CSS classes with error state handling
   */
  const inputClasses = (fieldName: string) => `
    block w-full rounded-lg py-3 px-4 
    text-gray-900 bg-white dark:bg-gray-800 dark:text-white 
    border ${touched[fieldName] && errors[fieldName] 
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
      : 'border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-primary'
    } 
    focus:outline-none focus:ring-2 
    transition duration-200
  `;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md" data-testid="loan-form">
      <div className="space-y-4">
        {/* Loan Amount */}
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
              className={inputClasses('loanAmount')}
              placeholder="Enter loan amount"
              aria-describedby={errors.loanAmount ? 'loanAmount-error' : undefined}
              data-testid="loan-amount-input"
            />
          </div>
          {touched.loanAmount && errors.loanAmount && (
            <p id="loanAmount-error" className="mt-1 text-sm text-red-500" role="alert">
              {errors.loanAmount}
            </p>
          )}
        </div>

        {/* Interest Rate */}
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
              className={inputClasses('interestRate')}
              placeholder="Enter interest rate"
              aria-describedby={errors.interestRate ? 'interestRate-error' : undefined}
              data-testid="interest-rate-input"
            />
          </div>
          {touched.interestRate && errors.interestRate && (
            <p id="interestRate-error" className="mt-1 text-sm text-red-500" role="alert">
              {errors.interestRate}
            </p>
          )}
        </div>

        {/* Loan Term */}
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
                className={inputClasses('loanTerm')}
                placeholder={formData.termUnit === 'years' ? "1-30" : "1-360"}
                aria-describedby={errors.loanTerm ? 'loanTerm-error' : undefined}
                data-testid="loan-term-input"
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
              data-testid="term-unit-select"
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

        {/* Start Date */}
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
              data-testid="start-date-input"
            />
          </div>
        </div>

        {/* Extra Payment Simulations */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Extra Payment Simulations
            </h3>
          </div>
          
          <div className="space-y-4">
            {/* Extra Payment 1 */}
            <div>
              <label htmlFor="extraPayment1" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Simulation 1: Extra Monthly Payment
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <input
                  type="text"
                  name="extraPayment1"
                  id="extraPayment1"
                  value={formatCurrency(formData.extraPayment1, currency.code, false)}
                  onChange={handleInputChange}
                  onPaste={handlePaste}
                  onBlur={handleBlur}
                  className={inputClasses('extraPayment1')}
                  placeholder="Enter extra payment amount"
                  aria-describedby={errors.extraPayment1 ? 'extraPayment1-error' : undefined}
                  data-testid="extra-payment-1-input"
                />
              </div>
              {touched.extraPayment1 && errors.extraPayment1 && (
                <p id="extraPayment1-error" className="mt-1 text-sm text-red-500" role="alert">
                  {errors.extraPayment1}
                </p>
              )}
            </div>

            {/* Extra Payment 2 */}
            <div>
              <label htmlFor="extraPayment2" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Simulation 2: Extra Monthly Payment
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <input
                  type="text"
                  name="extraPayment2"
                  id="extraPayment2"
                  value={formatCurrency(formData.extraPayment2, currency.code, false)}
                  onChange={handleInputChange}
                  onPaste={handlePaste}
                  onBlur={handleBlur}
                  className={inputClasses('extraPayment2')}
                  placeholder="Enter extra payment amount"
                  aria-describedby={errors.extraPayment2 ? 'extraPayment2-error' : undefined}
                  data-testid="extra-payment-2-input"
                />
              </div>
              {touched.extraPayment2 && errors.extraPayment2 && (
                <p id="extraPayment2-error" className="mt-1 text-sm text-red-500" role="alert">
                  {errors.extraPayment2}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 pt-2">
        <button
          type="button"
          onClick={handleClear}
          className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          data-testid="clear-form-button"
        >
          Clear Form
        </button>
        <button
          type="submit"
          className="flex-1 py-3 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-center gap-2"
          data-testid="calculate-button"
        >
          <Calculator className="h-4 w-4" />
          Calculate
        </button>
      </div>
    </form>
  );
};

export default LoanForm;