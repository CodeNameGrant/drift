import { LoanFormData, LoanResult, Currency } from '../types';

export const calculateLoan = (formData: LoanFormData): LoanResult => {
  const { loanAmount, interestRate, loanTerm, termUnit, startDate } = formData;
  
  const monthlyInterestRate = interestRate / 100 / 12;
  const numberOfPayments = termUnit === 'years' ? loanTerm * 12 : loanTerm;
  
  const monthlyPayment = loanAmount * 
    (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
  
  const totalInterest = (monthlyPayment * numberOfPayments) - loanAmount;
  
  const payoffDate = new Date(startDate);
  payoffDate.setMonth(payoffDate.getMonth() + numberOfPayments);
  
  return {
    monthlyPayment: monthlyInterestRate === 0 ? loanAmount / numberOfPayments : monthlyPayment,
    totalInterest: monthlyInterestRate === 0 ? 0 : totalInterest,
    payoffDate
  };
};

export const formatCurrency = (amount: number, currency?: Currency): string => {
  const formatter = new Intl.NumberFormat(navigator.language, {
    style: 'currency',
    currency: currency?.code || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return formatter.format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat(navigator.language, {
    day: '2-digit',
    month: 'long',
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