import type { LoanFormData, LoanResult, AmortizationPayment } from '../types';

/**
 * Calculate comprehensive loan information including payments, interest, and amortization
 * @param formData - Loan parameters from the form
 * @returns Complete loan calculation results
 */
export const calculateLoan = (formData: LoanFormData): LoanResult => {
  const { loanAmount, interestRate, loanTerm, termUnit, startDate } = formData;
  
  // Convert to monthly values
  const monthlyInterestRate = interestRate / 100 / 12;
  const numberOfPayments = termUnit === 'years' ? loanTerm * 12 : loanTerm;
  
  // Calculate monthly payment using standard loan formula
  const monthlyPayment = monthlyInterestRate === 0 
    ? loanAmount / numberOfPayments
    : loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
  
  // Calculate totals
  const totalInterest = (monthlyPayment * numberOfPayments) - loanAmount;
  const totalAmountRepaid = loanAmount + totalInterest;
  
  // Calculate payoff date
  const payoffDate = new Date(startDate);
  payoffDate.setMonth(payoffDate.getMonth() + numberOfPayments);

  // Calculate additional metrics
  const effectiveAnnualRate = (Math.pow(1 + monthlyInterestRate, 12) - 1) * 100;
  const costPercentage = (totalInterest / loanAmount) * 100;

  // Generate amortization schedule
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

/**
 * Generate amortization schedule showing payment breakdown over time
 * @param principal - Initial loan amount
 * @param monthlyRate - Monthly interest rate (decimal)
 * @param monthlyPayment - Fixed monthly payment amount
 * @param totalPayments - Total number of payments
 * @param startDate - Loan start date
 * @returns Array of payment details for first and last few payments
 */
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

    // Only include first 3 and last 3 payments to keep data manageable
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

// Re-export validation function with new name for consistency
export { validateLoanForm as validateForm } from './validators';