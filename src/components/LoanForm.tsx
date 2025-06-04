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
    loanAmount: 0,
    interestRate: 0,
    loanTerm: 0,
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
    
    // Mark field as touched
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
    
    // Validate on blur
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    
    // Mark all fields as touched
    setTouched({
      loanAmount: true,
      interestRate: true,
      loanTerm: true
    });
    
    // If no errors, submit form
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <div className="space-y-4">
        <div>
          <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Loan Amount
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <input
              type="number"
              name="loanAmount"
              id="loanAmount"
              value={formData.loanAmount || ''}
              onChange={handleInputChange}
              onBlur={handleBlur}
              min="1"
              step="any"
              className={`block w-full rounded-md py-3 px-4 text-gray-900 bg-white dark:bg-gray-800 dark:text-white border ${
                touched.loanAmount && errors.loanAmount 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500'
              } focus:outline-none focus:ring-2 transition duration-200`}
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
              className={`block w-full rounded-md py-3 px-4 text-gray-900 bg-white dark:bg-gray-800 dark:text-white border ${
                touched.interestRate && errors.interestRate 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500'
              } focus:outline-none focus:ring-2 transition duration-200`}
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
                className={`block w-full rounded-md py-3 px-4 text-gray-900 bg-white dark:bg-gray-800 dark:text-white border ${
                  touched.loanTerm && errors.loanTerm 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500'
                } focus:outline-none focus:ring-2 transition duration-200`}
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
              className="block w-full rounded-md py-3 px-4 text-gray-900 bg-white dark:bg-gray-800 dark:text-white border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2 transition duration-200"
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
              className="block w-full rounded-md py-3 px-4 text-gray-900 bg-white dark:bg-gray-800 dark:text-white border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2 transition duration-200"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-2">
        <button
          type="button"
          onClick={handleClear}
          className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md transition duration-200"
        >
          Clear Form
        </button>
        <button
          type="submit"
          className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200"
        >
          Calculate
        </button>
      </div>
    </form>
  );
};

export default LoanForm;