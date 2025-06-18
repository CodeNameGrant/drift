export interface DebtAccount {
  id: string;
  user_id: string;
  name: string;
  type: 'mortgage' | 'auto' | 'credit_card' | 'personal' | 'student' | 'business';
  current_balance: number;
  loan_amount: number; // Changed from original_amount
  monthly_payment: number;
  interest_rate: number;
  start_date: Date; // Added start date
  payoff_date: Date; // This will be calculated
  created_at: Date;
  minimum_payment: number;
  is_active: boolean;
  // Optional fields for additional loan details
  loan_term_months?: number; // Store original loan term
  extra_payment?: number; // For tracking extra payments
}

export interface CreateDebtAccountData {
  name: string;
  type: DebtAccount['type'];
  loan_amount: number; // Original loan amount
  monthly_payment: number;
  interest_rate: number;
  start_date: Date; // When the loan started
  minimum_payment: number;
  loan_term_months?: number; // Optional: store original term for reference
}

export interface UpdateDebtAccountData extends Partial<CreateDebtAccountData> {
  is_active?: boolean;
  current_balance?: number;
  payoff_date?: Date;
  extra_payment?: number;
}

export interface DebtSummary {
  totalOutstandingDebt: number;
  totalMonthlyPayments: number;
  numberOfActiveAccounts: number;
  averageInterestRate: number;
  totalPaid: number;
  projectedPayoffDate: Date;
}

export interface DebtAccountType {
  type: DebtAccount['type'];
  label: string;
  color: string;
  icon: string;
}

export interface DebtAccountFormErrors {
  name?: string;
  type?: string;
  loan_amount?: string;
  monthly_payment?: string;
  interest_rate?: string;
  start_date?: string;
  minimum_payment?: string;
  loan_term?: string; // For loan term validation
}

// Validation interfaces
export interface LoanValidationResult {
  isValid: boolean;
  errors: DebtAccountFormErrors;
  warnings?: string[];
}

export interface PaymentValidationResult {
  isValid: boolean;
  minimumRequired: number;
  message?: string;
}

// Account type configuration
export interface AccountTypeConfig {
  value: DebtAccount['type'];
  label: string;
  icon: string;
  color: string;
  description: string;
  requiresLoanTerm: boolean;
  requiresMinimumPayment: boolean;
  defaultTermYears?: number;
  maxTermYears?: number;
  minTermYears?: number;
}