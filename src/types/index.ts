export interface LoanFormData {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  termUnit: 'years' | 'months';
  startDate: Date;
  extraPayment1: number;
  extraPayment2: number;
}

export interface AmortizationPayment {
  paymentNumber: number;
  date: Date;
  principal: number;
  interest: number;
  balance: number;
  totalPayment: number;
}

export interface LoanScenario {
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
  extraPayment: number;
  scenarioName: string;
  color: string;
}

export interface LoanResult {
  baseScenario: LoanScenario;
  simulation1: LoanScenario;
  simulation2: LoanScenario;
}

export interface FormErrors {
  loanAmount?: string;
  interestRate?: string;
  loanTerm?: string;
  extraPayment1?: string;
  extraPayment2?: string;
}

export interface ChartDataPoint {
  month: number;
  baseBalance: number;
  simulation1Balance: number;
  simulation2Balance: number;
  date: string;
}