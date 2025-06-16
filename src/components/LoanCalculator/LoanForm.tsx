import React, { useState, useEffect } from 'react';
import { LoanFormData, FormErrors } from '../../types';
import { validateForm, formatCurrency } from '../../utils/calculations';
import { useCurrency } from '../../context/CurrencyContext';
import { Calculator, Plus, DollarSign, Percent, Calendar, Clock, Lock, CheckCircle } from 'lucide-react';

interface LoanFormProps {
  onCalculate: (data: LoanFormData) => void;
}

/**
 * Enhanced space-efficient loan form component with progressive simulation validation
 * Features logical field grouping, responsive design, and comprehensive validation
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
   * Check if simulation 1 has valid input
   */
  const isSimulation1Valid = () => {
    return formData.extraPayment1 > 0 && !errors.extraPayment1;
  };

  /**
   * Check if all base loan fields are valid
   */
  const areBaseLoanFieldsValid = () => {
    const baseErrors = validateForm({
      loanAmount: formData.loanAmount,
      interestRate: formData.interestRate,
      loanTerm: formData.loanTerm,
      termUnit: formData.termUnit
    });
    
    return Object.keys(baseErrors).length === 0 && 
           formData.loanAmount > 0 && 
           formData.interestRate >= 0 && 
           formData.loanTerm > 0;
  };

  /**
   * Reset simulation 2 when simulation 1 becomes invalid
   */
  useEffect(() => {
    if (!isSimulation1Valid() && formData.extraPayment2 > 0) {
      setFormData(prev => ({
        ...prev,
        extraPayment2: 0
      }));
      
      // Clear simulation 2 from touched state
      setTouched(prev => {
        const newTouched = { ...prev };
        delete newTouched.extraPayment2;
        return newTouched;
      });
      
      // Clear simulation 2 errors
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.extraPayment2;
        return newErrors;
      });
    }
  }, [formData.extraPayment1, errors.extraPayment1, formData.extraPayment2]);

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
  const inputClasses = (fieldName: string, disabled: boolean = false) => `
    block w-full rounded-lg py-3 px-4 
    text-gray-900 bg-white dark:bg-gray-800 dark:text-white 
    border ${touched[fieldName] && errors[fieldName] 
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
      : disabled
      ? 'border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700'
      : 'border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-primary'
    } 
    focus:outline-none focus:ring-2 
    transition duration-200
    ${disabled ? 'cursor-not-allowed opacity-60' : ''}
  `;

  /**
   * Render form field with icon and label
   */
  const renderField = (
    name: string,
    label: string,
    icon: React.ReactNode,
    type: string = 'text',
    placeholder?: string,
    min?: string,
    max?: string,
    step?: string,
    disabled: boolean = false
  ) => (
    <div className="space-y-2">
      <label htmlFor={name} className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        {icon}
        {label}
        {disabled && <Lock className="h-3 w-3 text-gray-400" />}
      </label>
      <div className="relative">
        <input
          type={type}
          name={name}
          id={name}
          disabled={disabled}
          value={
            name === 'loanAmount' || name === 'extraPayment1' || name === 'extraPayment2'
              ? formatCurrency(formData[name as keyof LoanFormData] as number, currency.code, false)
              : name === 'startDate'
              ? (formData[name] as Date).toISOString().split('T')[0]
              : formData[name as keyof LoanFormData] || ''
          }
          onChange={handleInputChange}
          onBlur={type !== 'date' ? handleBlur : undefined}
          onPaste={name.includes('Amount') || name.includes('Payment') ? handlePaste : undefined}
          min={min}
          max={max}
          step={step}
          className={inputClasses(name, disabled)}
          placeholder={disabled ? 'Complete Simulation 1 first' : placeholder}
          aria-describedby={errors[name as keyof FormErrors] ? `${name}-error` : undefined}
          data-testid={`${name.replace(/([A-Z])/g, '-$1').toLowerCase()}-input`}
        />
      </div>
      {touched[name] && errors[name as keyof FormErrors] && (
        <p id={`${name}-error`} className="text-sm text-red-500" role="alert">
          {errors[name as keyof FormErrors]}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full" data-testid="loan-form">
      {/* Primary Loan Details Section */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-6">
          <DollarSign className="h-5 w-5 text-primary" />
          Loan Details
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {renderField(
              'loanAmount',
              'Loan Amount',
              <DollarSign className="h-4 w-4 text-gray-500" />,
              'text',
              'Enter loan amount'
            )}
            
            {renderField(
              'interestRate',
              'Annual Interest Rate (%)',
              <Percent className="h-4 w-4 text-gray-500" />,
              'number',
              'Enter interest rate',
              '0.1',
              '100',
              '0.1'
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Loan Term - Split into two columns */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Clock className="h-4 w-4 text-gray-500" />
                Loan Term
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
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
                <div>
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
                <p id="loanTerm-error" className="text-sm text-red-500" role="alert">
                  {errors.loanTerm}
                </p>
              )}
            </div>

            {renderField(
              'startDate',
              'Start Date',
              <Calendar className="h-4 w-4 text-gray-500" />,
              'date'
            )}
          </div>
        </div>
      </div>

      {/* Extra Payment Simulations Section */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-lg p-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-6">
          <Plus className="h-5 w-5 text-primary" />
          Extra Payment Simulations
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Simulation 1 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-green-500">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <h4 className="font-medium text-gray-900 dark:text-white">Simulation 1</h4>
              {isSimulation1Valid() && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
            {renderField(
              'extraPayment1',
              'Extra Monthly Payment',
              <Plus className="h-4 w-4 text-gray-500" />,
              'text',
              'Enter extra payment amount',
              undefined,
              undefined,
              undefined,
              !areBaseLoanFieldsValid()
            )}
            
            {!areBaseLoanFieldsValid() && (
              <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Complete all loan details above to enable simulations
                </p>
              </div>
            )}
          </div>

          {/* Simulation 2 */}
          <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-orange-500 transition-all duration-300 ${
            !isSimulation1Valid() ? 'opacity-60' : ''
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <h4 className="font-medium text-gray-900 dark:text-white">Simulation 2</h4>
              {!isSimulation1Valid() && (
                <Lock className="h-4 w-4 text-gray-400" />
              )}
            </div>
            
            {isSimulation1Valid() ? (
              renderField(
                'extraPayment2',
                'Extra Monthly Payment',
                <Plus className="h-4 w-4 text-gray-500" />,
                'text',
                'Enter extra payment amount'
              )
            ) : (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Plus className="h-4 w-4 text-gray-500" />
                  Extra Monthly Payment
                  <Lock className="h-3 w-3 text-gray-400" />
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    className={inputClasses('extraPayment2', true)}
                    placeholder="Complete Simulation 1 first"
                    data-testid="extra-payment-2-input"
                  />
                </div>
              </div>
            )}
            
            {!isSimulation1Valid() && (
              <div className="mt-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <p className="text-sm text-orange-700 dark:text-orange-300 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Enter a valid amount in Simulation 1 to unlock Simulation 2
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Progressive Disclosure Info */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>How it works:</strong> Complete your loan details first, then add an extra payment amount in Simulation 1. 
            Once Simulation 1 has a valid amount, Simulation 2 will become available for comparison. 
            This helps you explore different payment strategies step by step.
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          type="button"
          onClick={handleClear}
          className="flex-1 py-3 px-6 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium"
          data-testid="clear-form-button"
        >
          Clear Form
        </button>
        <button
          type="submit"
          className="flex-1 py-3 px-6 bg-primary hover:bg-primary-dark text-white rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-center gap-2 font-medium shadow-lg"
          data-testid="calculate-button"
        >
          <Calculator className="h-5 w-5" />
          Calculate
        </button>
      </div>

      {/* Form Summary */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Summary</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Loan Amount:</span>
            <div className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(formData.loanAmount, currency.code)}
            </div>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Interest Rate:</span>
            <div className="font-medium text-gray-900 dark:text-white">
              {formData.interestRate}%
            </div>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Term:</span>
            <div className="font-medium text-gray-900 dark:text-white">
              {formData.loanTerm} {formData.termUnit}
            </div>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Simulations:</span>
            <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
              {formData.extraPayment1 > 0 && <CheckCircle className="h-3 w-3 text-green-500" />}
              {formData.extraPayment2 > 0 && <CheckCircle className="h-3 w-3 text-orange-500" />}
              {formData.extraPayment1 > 0 || formData.extraPayment2 > 0 ? 'Active' : 'None'}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default LoanForm;