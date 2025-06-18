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
}

export interface CreateDebtAccountData {
  name: string;
  type: DebtAccount['type'];
  loan_amount: number; // Original loan amount
  monthly_payment: number;
  interest_rate: number;
  start_date: Date; // When the loan started
  minimum_payment: number;
}

export interface UpdateDebtAccountData extends Partial<CreateDebtAccountData> {
  is_active?: boolean;
  current_balance?: number;
  payoff_date?: Date;
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
}