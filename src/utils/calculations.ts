import { LoanFormData, LoanResult, AmortizationPayment } from '../types';

export const calculateLoan = (formData: LoanFormData): LoanResult => {
  const { loanAmount, interestRate, loanTerm, termUnit, startDate } = formData;
  
  const monthlyInterestRate = interestRate / 100 / 12;
  const numberOfPayments = termUnit === 'years' ? loanTerm * 12 : loanTerm;
  
  const monthlyPayment = monthlyInterestRate === 0 
    ? loanAmount / numberOfPayments
    : loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
  
  const totalInterest = (monthlyPayment * numberOfPayments) - loanAmount;
  const totalAmountRepaid = loanAmount + totalInterest;
  
  const payoffDate = new Date(startDate);
  payoffDate.setMonth(payoffDate.getMonth() + numberOfPayments);

  const effectiveAnnualRate = (Math.pow(1 + monthlyInterestRate, 12) - 1) * 100;
  const costPercentage = (totalInterest / loanAmount) * 100;

  const amortizationSchedule = generateAmortizationSchedule(
    loanAmount,
    monthlyInterestRate,
    monthlyPayment,
    numberOfPayments,
    startDate
  );
  
  return {
    monthlyPayment,
    totalInterest,
    payoffDate,
    principalAmount: loanAmount,
    totalAmountRepaid,
    effectiveAnnualRate,
    loanTermYears: termUnit === 'years' ? loanTerm : loanTerm / 12,
    loanTermMonths: termUnit === 'months' ? loanTerm : loanTerm * 12,
    costPercentage,
    amortizationSchedule
  };
};

const generateAmortizationSchedule = (
  principal: number,
  monthlyRate: number,
  monthlyPayment: number,
  totalPayments: number,
  startDate: Date
): AmortizationPayment[] => {
  const schedule: AmortizationPayment[] = [];
  let balance = principal;
  let paymentDate = new Date(startDate);

  for (let i = 1; i <= totalPayments; i++) {
    const interest = balance * monthlyRate;
    const principalPaid = monthlyPayment - interest;
    balance = Math.max(0, balance - principalPaid);

    if (i <= 3 || i > totalPayments - 3) {
      schedule.push({
        paymentNumber: i,
        date: new Date(paymentDate),
        principal: principalPaid,
        interest,
        balance
      });
    }

    paymentDate.setMonth(paymentDate.getMonth() + 1);
  }

  return schedule;
};

export const formatNumber = (amount: number): string => {
  return new Intl.NumberFormat(undefined, {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatCurrency = (amount: number, currencyCode: string = 'USD'): string => {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'narrowSymbol'
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat(undefined, {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
};

export const validateForm = (data: Partial<LoanFormData>) => {
  const errors: Record<string, string> = {};
  
  if (!data.loanAmount || data.loanAmount < 1) {
    errors.loanAmount = 'Loan amount must be at least 1';
  }
  
  if (!data.interestRate && data.interestRate !== 0) {
    errors.interestRate = 'Interest rate is required';
  } else if (data.interestRate < 0 || data.interestRate > 100) {
    errors.interestRate = 'Interest rate must be between 0% and 100%';
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