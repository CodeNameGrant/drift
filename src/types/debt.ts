export interface DebtAccount {
  id: string;
  user_id: string;
  name: string;
  type: 'mortgage' | 'auto' | 'credit_card' | 'personal' | 'student' | 'business';
  current_balance: number;
  original_amount: number;
  monthly_payment: number;
  interest_rate: number;
  payoff_date: Date;
  created_at: Date;
  minimum_payment: number;
  extra_payment?: number;
  is_active: boolean;
}

export interface CreateDebtAccountData {
  name: string;
  type: DebtAccount['type'];
  current_balance: number;
  original_amount: number;
  monthly_payment: number;
  interest_rate: number;
  payoff_date: Date;
  minimum_payment: number;
  extra_payment?: number;
}

export interface UpdateDebtAccountData extends Partial<CreateDebtAccountData> {
  is_active?: boolean;
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
  current_balance?: string;
  original_amount?: string;
  monthly_payment?: string;
  interest_rate?: string;
  payoff_date?: string;
  minimum_payment?: string;
  extra_payment?: string;
}