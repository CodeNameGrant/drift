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

export interface DebtAccount {
  id: string;
  name: string;
  currentBalance: number;
  monthlyPayment: number;
  interestRate: number;
  color: string;
  accountType: 'credit_card' | 'personal_loan' | 'mortgage' | 'auto_loan' | 'student_loan' | 'other';
  startDate: Date;
  isRevolvingCredit: boolean;
  // Loan term for all accounts
  loanTerm: number;
  termUnit: 'months' | 'years';
  originalBalance?: number;
  // Calculated fields
  interestPaidToDate: number;
  paymentDueDate: Date;
  remainingTerm?: number;
  payoffDate?: Date;
}

export interface DebtVisualizationData {
  month: number;
  date: string;
  totalDebt: number;
  accounts: { [accountId: string]: number };
  milestone?: string;
}

export interface Milestone {
  month: number;
  description: string;
  type: 'payoff' | 'halfway' | 'custom';
}

export interface DebtAccountFormData {
  name: string;
  currentBalance: number;
  interestRate: number;
  accountType: DebtAccount['accountType'];
  startDate: Date;
  isRevolvingCredit: boolean;
  // Loan term for all accounts
  loanTerm: number;
  termUnit: 'months' | 'years';
  monthlyPayment?: number;
}