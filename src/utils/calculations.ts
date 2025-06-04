import { LoanFormData, LoanResult } from '../types';

export const calculateLoan = (formData: LoanFormData): LoanResult => {
  const { loanAmount, interestRate, loanTerm, termUnit, startDate } = formData;
  
  // Convert interest rate from percentage to decimal
  const monthlyInterestRate = interestRate / 100 / 12;
  
  // Calculate number of monthly payments
  const numberOfPayments = termUnit === 'years' ? loanTerm * 12 : loanTerm;
  
  // Calculate monthly payment using the loan formula
  const monthlyPayment = loanAmount * 
    (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
  
  // Calculate total interest paid over the life of the loan
  const totalInterest = (monthlyPayment * numberOfPayments) - loanAmount;
  
  // Calculate payoff date
  const payoffDate = new Date(startDate);
  payoffDate.setMonth(payoffDate.getMonth() + numberOfPayments);
  
  return {
    monthlyPayment: monthlyInterestRate === 0 ? loanAmount / numberOfPayments : monthlyPayment,
    totalInterest: monthlyInterestRate === 0 ? 0 : totalInterest,
    payoffDate
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  }).format(date);
};

export const validateForm = (data: Partial<LoanFormData>) => {
  const errors: Record<string, string> = {};
  
  if (!data.loanAmount || data.loanAmount < 1) {
    errors.loanAmount = 'Loan amount must be at least 1';
  }
  
  if (!data.interestRate && data.interestRate !== 0) {
    errors.interestRate = 'Interest rate is required';
  } else if (data.interestRate < 0.1 || data.interestRate > 100) {
    errors.interestRate = 'Interest rate must be between 0.1% and 100%';
  }
  
  if (!data.loanTerm || data.loanTerm < 1) {
    errors.loanTerm = data.termUnit === 'years' 
      ? 'Term must be between 1-30 years' 
      : 'Term must be between 1-360 months';
  } else if (data.termUnit === 'years' && data.loanTerm > 30) {
    errors.loanTerm = 'Term must be between 1-30 years';
  } else if (data.termUnit === 'months' && data.loanTerm > 360) {
    errors.loanTerm = 'Term must be between 1-360 months';
  }
  
  return errors;
};