export interface LoanFormData {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  termUnit: 'years' | 'months';
  startDate: Date;
}

export interface LoanResult {
  monthlyPayment: number;
  totalInterest: number;
  payoffDate: Date;
}

export interface FormErrors {
  loanAmount?: string;
  interestRate?: string;
  loanTerm?: string;
}