/**
 * Form data structure for loan calculations
 */
export interface LoanFormData {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  termUnit: 'years' | 'months';
  startDate: Date;
}

/**
 * Individual payment in an amortization schedule
 */
export interface AmortizationPayment {
  paymentNumber: number;
  date: Date;
  principal: number;
  interest: number;
  balance: number;
}

/**
 * Complete loan calculation results
 */
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

/**
 * Form validation errors
 */
export interface FormErrors {
  loanAmount?: string;
  interestRate?: string;
  loanTerm?: string;
}

/**
 * Debt account types supported by the system
 */
export type DebtAccountType = 'credit_card' | 'personal_loan' | 'mortgage' | 'auto_loan' | 'student_loan' | 'other';

/**
 * Complete debt account information
 */
export interface DebtAccount {
  id: string;
  name: string;
  currentBalance: number;
  monthlyPayment: number;
  interestRate: number;
  color: string;
  accountType: DebtAccountType;
  startDate: Date;
  isRevolvingCredit: boolean;
  loanTerm: number;
  termUnit: 'months' | 'years';
  originalBalance?: number;
  interestPaidToDate: number;
  paymentDueDate: Date;
  remainingTerm?: number;
  payoffDate?: Date;
}

/**
 * Data structure for debt visualization charts
 */
export interface DebtVisualizationData {
  month: number;
  date: string;
  totalDebt: number;
  accounts: { [accountId: string]: number };
  milestone?: string;
}

/**
 * Milestone markers for debt repayment progress
 */
export interface Milestone {
  month: number;
  description: string;
  type: 'payoff' | 'halfway' | 'custom';
}

/**
 * Form data for creating new debt accounts
 */
export interface DebtAccountFormData {
  name: string;
  currentBalance: number;
  interestRate: number;
  accountType: DebtAccountType;
  startDate: Date;
  isRevolvingCredit: boolean;
  loanTerm: number;
  termUnit: 'months' | 'years';
  monthlyPayment?: number;
}

/**
 * Currency information for internationalization
 */
export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

/**
 * Theme configuration
 */
export type Theme = 'light' | 'dark';

/**
 * Tab navigation options for the main application
 */
export type TabType = 'dashboard' | 'visualization' | 'calculator' | 'accounts';