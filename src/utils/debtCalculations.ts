import { DebtAccount, DebtSummary } from '../types/debt';

/**
 * Calculate comprehensive debt summary from user's accounts
 */
export const calculateDebtSummary = (accounts: DebtAccount[]): DebtSummary => {
  const activeAccounts = accounts.filter(account => account.is_active);
  
  if (activeAccounts.length === 0) {
    return {
      totalOutstandingDebt: 0,
      totalMonthlyPayments: 0,
      numberOfActiveAccounts: 0,
      averageInterestRate: 0,
      totalPaid: 0,
      projectedPayoffDate: new Date()
    };
  }
  
  const totalOutstandingDebt = activeAccounts.reduce(
    (sum, account) => sum + account.current_balance, 0
  );
  
  const totalMonthlyPayments = activeAccounts.reduce(
    (sum, account) => sum + account.monthly_payment, 0
  );
  
  const numberOfActiveAccounts = activeAccounts.length;
  
  // Calculate weighted average interest rate based on balances
  const weightedInterestSum = activeAccounts.reduce(
    (sum, account) => sum + (account.interest_rate * account.current_balance), 0
  );
  const averageInterestRate = totalOutstandingDebt > 0 
    ? weightedInterestSum / totalOutstandingDebt 
    : 0;
  
  const totalPaid = activeAccounts.reduce(
    (sum, account) => sum + (account.original_amount - account.current_balance), 0
  );
  
  // Find the latest payoff date
  const projectedPayoffDate = activeAccounts.reduce(
    (latest, account) => account.payoff_date > latest ? account.payoff_date : latest,
    new Date()
  );

  return {
    totalOutstandingDebt,
    totalMonthlyPayments,
    numberOfActiveAccounts,
    averageInterestRate,
    totalPaid,
    projectedPayoffDate
  };
};

/**
 * Calculate monthly interest cost for all accounts
 */
export const calculateMonthlyInterestCost = (accounts: DebtAccount[]): number => {
  return accounts
    .filter(account => account.is_active)
    .reduce((total, account) => {
      const monthlyRate = account.interest_rate / 100 / 12;
      return total + (account.current_balance * monthlyRate);
    }, 0);
};

/**
 * Calculate debt-to-income ratio (requires monthly income parameter)
 */
export const calculateDebtToIncomeRatio = (accounts: DebtAccount[], monthlyIncome: number): number => {
  if (monthlyIncome <= 0) return 0;
  
  const totalMonthlyPayments = accounts
    .filter(account => account.is_active)
    .reduce((sum, account) => sum + account.monthly_payment, 0);
  
  return (totalMonthlyPayments / monthlyIncome) * 100;
};

/**
 * Find accounts with highest interest rates
 */
export const getHighInterestAccounts = (accounts: DebtAccount[], threshold: number = 15): DebtAccount[] => {
  return accounts
    .filter(account => account.is_active && account.interest_rate > threshold)
    .sort((a, b) => b.interest_rate - a.interest_rate);
};

/**
 * Calculate potential savings from debt avalanche strategy
 */
export const calculateAvalancheSavings = (accounts: DebtAccount[]): {
  totalInterestSaved: number;
  monthsSaved: number;
} => {
  // This is a simplified calculation - in a real app you'd want more sophisticated modeling
  const activeAccounts = accounts.filter(account => account.is_active);
  const totalExtraPayments = activeAccounts.reduce(
    (sum, account) => sum + (account.extra_payment || 0), 0
  );
  
  if (totalExtraPayments === 0) {
    return { totalInterestSaved: 0, monthsSaved: 0 };
  }
  
  // Simplified calculation - assumes 20% interest savings and 30% time savings with avalanche
  const currentTotalInterest = activeAccounts.reduce((sum, account) => {
    const monthlyRate = account.interest_rate / 100 / 12;
    const months = Math.ceil(account.current_balance / (account.monthly_payment * 0.7)); // Assume 70% goes to principal
    return sum + (months * account.monthly_payment - account.current_balance);
  }, 0);
  
  return {
    totalInterestSaved: currentTotalInterest * 0.2, // 20% savings estimate
    monthsSaved: 12 // 1 year savings estimate
  };
};