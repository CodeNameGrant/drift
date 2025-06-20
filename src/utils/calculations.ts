import { LoanFormData, LoanResult, AmortizationPayment, LoanScenario, ChartDataPoint } from '../types';
import { DebtAccount } from '../types/debt';

/**
 * Calculate loan scenarios with base and extra payment simulations
 */
export const calculateLoan = (formData: LoanFormData): LoanResult => {
  const { loanAmount, interestRate, loanTerm, termUnit, startDate, extraPayment1, extraPayment2 } = formData;
  
  const monthlyInterestRate = interestRate / 100 / 12;
  const numberOfPayments = termUnit === 'years' ? loanTerm * 12 : loanTerm;
  
  // Calculate base monthly payment
  const baseMonthlyPayment = monthlyInterestRate === 0 
    ? loanAmount / numberOfPayments
    : loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

  // Calculate scenarios
  const baseScenario = calculateScenario(
    loanAmount, 
    monthlyInterestRate, 
    baseMonthlyPayment, 
    0, 
    startDate,
    'Base Payment',
    '#3B82F6' // Blue
  );

  const simulation1 = calculateScenario(
    loanAmount, 
    monthlyInterestRate, 
    baseMonthlyPayment, 
    extraPayment1, 
    startDate,
    `Base + ${formatCurrency(extraPayment1, 'USD', false)} Extra`,
    '#10B981' // Green
  );

  const simulation2 = calculateScenario(
    loanAmount, 
    monthlyInterestRate, 
    baseMonthlyPayment, 
    extraPayment2, 
    startDate,
    `Base + ${formatCurrency(extraPayment2, 'USD', false)} Extra`,
    '#F59E0B' // Orange
  );

  return {
    baseScenario,
    simulation1,
    simulation2
  };
};

/**
 * Calculate a single loan scenario with optional extra payments
 */
const calculateScenario = (
  principal: number,
  monthlyRate: number,
  basePayment: number,
  extraPayment: number,
  startDate: Date,
  scenarioName: string,
  color: string
): LoanScenario => {
  const totalMonthlyPayment = basePayment + extraPayment;
  
  const { schedule, totalInterest, payoffMonths } = generateAmortizationSchedule(
    principal,
    monthlyRate,
    totalMonthlyPayment,
    startDate
  );

  const payoffDate = new Date(startDate);
  payoffDate.setMonth(payoffDate.getMonth() + payoffMonths);

  const totalAmountRepaid = principal + totalInterest;
  const effectiveAnnualRate = (Math.pow(1 + monthlyRate, 12) - 1) * 100;
  const costPercentage = (totalInterest / principal) * 100;

  return {
    monthlyPayment: totalMonthlyPayment,
    totalInterest,
    payoffDate,
    principalAmount: principal,
    totalAmountRepaid,
    effectiveAnnualRate,
    loanTermYears: payoffMonths / 12,
    loanTermMonths: payoffMonths,
    costPercentage,
    amortizationSchedule: schedule,
    extraPayment,
    scenarioName,
    color
  };
};

/**
 * Generate complete amortization schedule with early payoff detection
 */
const generateAmortizationSchedule = (
  principal: number,
  monthlyRate: number,
  monthlyPayment: number,
  startDate: Date
): { schedule: AmortizationPayment[], totalInterest: number, payoffMonths: number } => {
  const schedule: AmortizationPayment[] = [];
  let balance = principal;
  let paymentDate = new Date(startDate);
  let totalInterest = 0;
  let paymentNumber = 1;

  while (balance > 0.01 && paymentNumber <= 360) { // Max 30 years
    const interest = balance * monthlyRate;
    const principalPayment = Math.min(monthlyPayment - interest, balance);
    balance = Math.max(0, balance - principalPayment);
    totalInterest += interest;

    schedule.push({
      paymentNumber,
      date: new Date(paymentDate),
      principal: principalPayment,
      interest,
      balance,
      totalPayment: principalPayment + interest
    });

    paymentDate.setMonth(paymentDate.getMonth() + 1);
    paymentNumber++;
  }

  return {
    schedule,
    totalInterest,
    payoffMonths: schedule.length
  };
};

/**
 * Generate chart data points for visualization with proper handling of undefined values
 */
export const generateChartData = (result: LoanResult): ChartDataPoint[] => {
  const maxLength = Math.max(
    result.baseScenario.amortizationSchedule.length,
    result.simulation1.amortizationSchedule.length,
    result.simulation2.amortizationSchedule.length
  );

  const chartData: ChartDataPoint[] = [];

  for (let i = 0; i < maxLength; i++) {
    const basePayment = result.baseScenario.amortizationSchedule[i];
    const sim1Payment = result.simulation1.amortizationSchedule[i];
    const sim2Payment = result.simulation2.amortizationSchedule[i];

    chartData.push({
      month: i + 1,
      baseBalance: basePayment?.balance || 0,
      simulation1Balance: sim1Payment?.balance,
      simulation2Balance: sim2Payment?.balance,
      date: basePayment?.date ? formatDate(basePayment.date) : ''
    });
  }

  return chartData;
};

/**
 * Generate debt reduction timeline data for individual accounts
 */
export const generateDebtReductionData = (accounts: DebtAccount[]): Array<{
  month: number;
  date: Date;
  accounts: Array<{ id: string; name: string; balance: number; color: string }>;
}> => {
  const maxMonths = 120; // 10 years projection
  const data: Array<{
    month: number;
    date: Date;
    accounts: Array<{ id: string; name: string; balance: number; color: string }>;
  }> = [];

  for (let month = 0; month <= maxMonths; month++) {
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + month);

    const accountBalances = accounts.map(account => {
      // Simple linear reduction calculation for demonstration
      const monthlyPrincipal = account.monthly_payment * 0.7; // Assume 70% goes to principal
      const projectedBalance = Math.max(0, account.current_balance - (monthlyPrincipal * month));
      
      return {
        id: account.id,
        name: account.name,
        balance: projectedBalance,
        color: getAccountTypeColor(account.type)
      };
    });

    data.push({
      month,
      date: currentDate,
      accounts: accountBalances
    });
  }

  return data;
};

/**
 * Prepare debt distribution data for pie chart
 */
export const prepareDebtDistributionData = (accounts: DebtAccount[]) => {
  const typeGroups = accounts.reduce((acc, account) => {
    if (!acc[account.type]) {
      acc[account.type] = {
        type: account.type,
        totalBalance: 0,
        count: 0,
        accounts: []
      };
    }
    acc[account.type].totalBalance += account.current_balance;
    acc[account.type].count += 1;
    acc[account.type].accounts.push(account);
    return acc;
  }, {} as Record<string, any>);

  return Object.values(typeGroups).map((group: any) => ({
    label: group.type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    value: group.totalBalance,
    count: group.count,
    color: getAccountTypeColor(group.type),
    accounts: group.accounts
  }));
};

/**
 * Prepare interest rate comparison data for bar chart
 */
export const prepareInterestRateData = (accounts: DebtAccount[]) => {
  return accounts
    .map(account => ({
      id: account.id,
      name: account.name,
      rate: account.interest_rate,
      balance: account.current_balance,
      type: account.type,
      color: getAccountTypeColor(account.type)
    }))
    .sort((a, b) => b.rate - a.rate); // Sort by highest rate first
};

/**
 * Get account type color (imported from mockDebtData)
 */
const getAccountTypeColor = (type: DebtAccount['type']): string => {
  const colorMap = {
    mortgage: '#3B82F6',
    auto: '#10B981',
    credit_card: '#F59E0B',
    personal: '#8B5CF6',
    student: '#14B8A6',
    business: '#EF4444'
  };
  return colorMap[type] || '#F59E0B';
};

export const formatNumber = (amount: number): string => {
  return new Intl.NumberFormat(undefined, {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatCurrency = (amount: number, currencyCode: string = 'USD', showDecimals = true): string => {
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'narrowSymbol'
  };

  if (!showDecimals) {
    options.minimumFractionDigits = 0;
    options.maximumFractionDigits = 0;
  }

  return new Intl.NumberFormat(undefined, options).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat(undefined, {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
};

export const validateForm = (data: Partial<LoanFormData>) => {
  const errors: Record<string, string> = {};
  
  if (!data.loanAmount || data.loanAmount < 1) {
    errors.loanAmount = 'Loan amount must be at least 1';
  }
  
  if (!data.interestRate && data.interestRate !== 0) {
    errors.interestRate = 'Interest rate is required';
  } else if (data.interestRate < 0 || data.interestRate > 100) {
    errors.interestRate = 'Interest rate must be between 0% and 100%';
  }
  
  if (!data.loanTerm || data.loanTerm < 1) {
    errors.loanTerm = data.termUnit === 'years' 
      ? 'Term must be between 1-30 years' 
      : 'Term must be between 1-360 months';
  } else if (data.termUnit === 'years' && data.loanTerm > 30) {
    errors.loanTerm = 'Term must be between 1-30 years';
  } else if (data.termUnit === 'months' && data.loanTerm > 360) {
    errors.loanTerm = 'Term must be between 1-360 months';
  }

  if (data.extraPayment1 && data.extraPayment1 < 0) {
    errors.extraPayment1 = 'Extra payment cannot be negative';
  }

  if (data.extraPayment2 && data.extraPayment2 < 0) {
    errors.extraPayment2 = 'Extra payment cannot be negative';
  }
  
  return errors;
};

export const formatNumberWithCommas = (value: string | number): string => {
  const digits = typeof value === 'number' ? value.toString() : value.replace(/\D/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};