/**
 * Loan calculation utilities for debt accounts
 * Handles current balance calculation and payoff date estimation
 */

/**
 * Calculate monthly payment for a fixed loan
 */
export const calculateMonthlyPayment = (
  loanAmount: number,
  annualInterestRate: number,
  numberOfMonths: number
): number => {
  if (loanAmount <= 0 || numberOfMonths <= 0) {
    return 0;
  }

  if (annualInterestRate === 0) {
    return loanAmount / numberOfMonths;
  }

  const monthlyInterestRate = annualInterestRate / 100 / 12;
  
  const monthlyPayment = loanAmount * 
    (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfMonths)) / 
    (Math.pow(1 + monthlyInterestRate, numberOfMonths) - 1);

  return monthlyPayment;
};

/**
 * Calculate current balance based on loan amount, payments, and time elapsed
 */
export const calculateCurrentBalance = (
  loanAmount: number,
  monthlyPayment: number,
  interestRate: number,
  startDate: Date
): number => {
  const monthlyInterestRate = interestRate / 100 / 12;
  const monthsElapsed = getMonthsElapsed(startDate, new Date());
  
  if (monthsElapsed <= 0) {
    return loanAmount;
  }
  
  let balance = loanAmount;
  
  for (let month = 0; month < monthsElapsed; month++) {
    const interestPayment = balance * monthlyInterestRate;
    const principalPayment = Math.min(monthlyPayment - interestPayment, balance);
    
    if (principalPayment <= 0) {
      // Payment doesn't cover interest - balance would grow
      balance += interestPayment;
    } else {
      balance -= principalPayment;
    }
    
    if (balance <= 0) {
      return 0;
    }
  }
  
  return Math.max(0, balance);
};

/**
 * Calculate projected payoff date based on current balance and payment schedule
 */
export const calculatePayoffDate = (
  currentBalance: number,
  monthlyPayment: number,
  interestRate: number,
  fromDate: Date = new Date()
): Date => {
  if (currentBalance <= 0) {
    return fromDate;
  }
  
  const monthlyInterestRate = interestRate / 100 / 12;
  let balance = currentBalance;
  let months = 0;
  const maxMonths = 360; // 30 years maximum
  
  while (balance > 0.01 && months < maxMonths) {
    const interestPayment = balance * monthlyInterestRate;
    const principalPayment = Math.min(monthlyPayment - interestPayment, balance);
    
    if (principalPayment <= 0) {
      // Payment doesn't cover interest - loan will never be paid off
      const futureDate = new Date(fromDate);
      futureDate.setFullYear(futureDate.getFullYear() + 30);
      return futureDate;
    }
    
    balance -= principalPayment;
    months++;
  }
  
  const payoffDate = new Date(fromDate);
  payoffDate.setMonth(payoffDate.getMonth() + months);
  return payoffDate;
};

/**
 * Calculate months elapsed between two dates
 */
export const getMonthsElapsed = (startDate: Date, endDate: Date): number => {
  const yearDiff = endDate.getFullYear() - startDate.getFullYear();
  const monthDiff = endDate.getMonth() - startDate.getMonth();
  return yearDiff * 12 + monthDiff;
};

/**
 * Validate that monthly payment can cover minimum interest
 */
export const validatePaymentCoverage = (
  balance: number,
  monthlyPayment: number,
  interestRate: number
): { isValid: boolean; minimumRequired: number } => {
  const monthlyInterestRate = interestRate / 100 / 12;
  const minimumRequired = balance * monthlyInterestRate;
  
  return {
    isValid: monthlyPayment > minimumRequired,
    minimumRequired
  };
};

/**
 * Calculate total interest that will be paid over the life of the loan
 */
export const calculateTotalInterest = (
  currentBalance: number,
  monthlyPayment: number,
  interestRate: number
): number => {
  const monthlyInterestRate = interestRate / 100 / 12;
  let balance = currentBalance;
  let totalInterest = 0;
  let months = 0;
  const maxMonths = 360;
  
  while (balance > 0.01 && months < maxMonths) {
    const interestPayment = balance * monthlyInterestRate;
    const principalPayment = Math.min(monthlyPayment - interestPayment, balance);
    
    if (principalPayment <= 0) {
      break;
    }
    
    totalInterest += interestPayment;
    balance -= principalPayment;
    months++;
  }
  
  return totalInterest;
};

/**
 * Calculate loan-to-value ratio for mortgages
 */
export const calculateLoanToValueRatio = (
  loanAmount: number,
  propertyValue: number
): number => {
  if (propertyValue <= 0) return 0;
  return (loanAmount / propertyValue) * 100;
};

/**
 * Calculate debt service ratio (monthly payment to monthly income)
 */
export const calculateDebtServiceRatio = (
  monthlyPayment: number,
  monthlyIncome: number
): number => {
  if (monthlyIncome <= 0) return 0;
  return (monthlyPayment / monthlyIncome) * 100;
};

/**
 * Validate loan term based on account type
 */
export const validateLoanTerm = (
  accountType: string,
  termMonths: number
): { isValid: boolean; message?: string } => {
  const termLimits = {
    mortgage: { min: 60, max: 360 }, // 5-30 years
    auto: { min: 12, max: 84 }, // 1-7 years
    personal: { min: 12, max: 84 }, // 1-7 years
    student: { min: 60, max: 300 }, // 5-25 years
    business: { min: 12, max: 120 } // 1-10 years
  };

  const limits = termLimits[accountType as keyof typeof termLimits];
  
  if (!limits) {
    return { isValid: true };
  }

  if (termMonths < limits.min) {
    return {
      isValid: false,
      message: `${accountType} loans typically have a minimum term of ${Math.ceil(limits.min / 12)} years`
    };
  }

  if (termMonths > limits.max) {
    return {
      isValid: false,
      message: `${accountType} loans typically have a maximum term of ${Math.floor(limits.max / 12)} years`
    };
  }

  return { isValid: true };
};

/**
 * Calculate effective annual rate (APR) including fees
 */
export const calculateEffectiveAnnualRate = (
  loanAmount: number,
  monthlyPayment: number,
  numberOfMonths: number,
  totalFees: number = 0
): number => {
  const totalPaid = monthlyPayment * numberOfMonths;
  const totalCost = totalPaid + totalFees;
  const totalInterest = totalCost - loanAmount;
  
  if (loanAmount <= 0 || numberOfMonths <= 0) return 0;
  
  // Simple approximation - for exact calculation would need iterative method
  const monthlyRate = totalInterest / (loanAmount * numberOfMonths);
  return monthlyRate * 12 * 100;
};