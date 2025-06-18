/**
 * Loan calculation utilities for debt accounts
 * Handles current balance calculation and payoff date estimation
 */

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