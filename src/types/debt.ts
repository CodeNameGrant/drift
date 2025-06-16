export interface DebtAccount {
  id: string;
  name: string;
  type: 'mortgage' | 'auto' | 'credit_card' | 'personal' | 'student' | 'business';
  currentBalance: number;
  originalAmount: number;
  monthlyPayment: number;
  interestRate: number;
  payoffDate: Date;
  createdDate: Date;
  minimumPayment: number;
  extraPayment?: number;
  isActive: boolean;
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