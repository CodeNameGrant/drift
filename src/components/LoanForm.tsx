import React, { useState } from 'react';
import { LoanFormData, FormErrors } from '../types';
import { validateForm } from '../utils/calculations';

interface LoanFormProps {
  onCalculate: (data: LoanFormData) => void;
}

const LoanForm: React.FC<LoanFormProps> = ({ onCalculate }) => {
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];

  const [formData, setFormData] = useState<LoanFormData>({
    loanAmount: 1_000_000,
    interestRate: 10,
    loanTerm: 10,
    termUnit: 'years',
    startDate: today
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (name === 'startDate') {
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

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    
    setTouched({
      loanAmount: true,
      interestRate: true,
      loanTerm: true
    });
    
    if (Object.keys(validationErrors).length === 0) {
      onCalculate(formData);
    }
  };

  const handleClear = () => {
    setFormData({
      loanAmount: 0,
      interestRate: 0,
      loanTerm: 0,
      termUnit: 'years',
      startDate: today
    });
    setErrors({});
    setTouched({});
  };

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
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <div className="space-y-4">
        <div>
          <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Loan Amount
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <input
  type="text"
  name="loanAmount"
  id="loanAmount"
  value={formatNumberWithCommas(formData.loanAmount)}
  onChange={handleFormattedInputChange}
  onPaste={handlePaste}
  onBlur={handleBlur}
  className={inputClasses('loanAmount')}
  placeholder="Enter loan amount"
/>
          </div>
          {touched.loanAmount && errors.loanAmount && (
            <p className="mt-1 text-sm text-red-500">{errors.loanAmount}</p>
          )}
        </div>

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
            />
          </div>
          {touched.interestRate && errors.interestRate && (
            <p className="mt-1 text-sm text-red-500">{errors.interestRate}</p>
          )}
        </div>

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
          <p className="mt-1 text-sm text-red-500">{errors.loanTerm}</p>
        )}

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

      <div className="flex gap-4 pt-2">
        <button
          type="button"
          onClick={handleClear}
          className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition duration-200"
        >
          Clear Form
        </button>
        <button
          type="submit"
          className="flex-1 py-3 px-4 bg-primary hover:bg-primary-darker text-white rounded-lg transition duration-200"
        >
          Calculate
        </button>
      </div>
    </form>
  );
};

export default LoanForm;