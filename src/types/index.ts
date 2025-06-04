export interface LoanFormData {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  termUnit: 'years' | 'months';
  startDate: Date;
}

export interface AmortizationPayment {
  paymentNumber: number;
  date: Date;
  principal: number;
  interest: number;
  balance: number;
}

export interface LoanResult {
  monthlyPayment: number;
  totalInterest: number;
  payoffDate: Date;
  principalAmount: number;
  totalAmountRepaid: number;
  effectiveAnnualRate: number;
  loanTermYears: number;
  loanTermMonths: number;
  costPercentage: number;
  amortizationSchedule: AmortizationPayment[];
}

export interface FormErrors {
  loanAmount?: string;
  interestRate?: string;
  loanTerm?: string;
}