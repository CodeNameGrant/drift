import { DebtAccount, DebtAccountType } from '../types/debt';

/**
 * Mock debt account data for development and testing
 * Includes realistic financial scenarios across different account types
 */

export const debtAccountTypes: DebtAccountType[] = [
  { type: 'mortgage', label: 'Mortgage', color: '#3B82F6', icon: 'home' },
  { type: 'auto', label: 'Auto Loan', color: '#10B981', icon: 'car' },
  { type: 'credit_card', label: 'Credit Card', color: '#F59E0B', icon: 'credit-card' },
  { type: 'personal', label: 'Personal Loan', color: '#4F46E5', icon: 'user' },
  { type: 'student', label: 'Student Loan', color: '#0D9488', icon: 'graduation-cap' },
  { type: 'business', label: 'Business Loan', color: '#EF4444', icon: 'briefcase' }
];

/**
 * Calculate projected payoff date based on current balance and monthly payment
 */
const calculatePayoffDate = (balance: number, monthlyPayment: number, interestRate: number): Date => {
  const monthlyRate = interestRate / 100 / 12;
  let months = 0;
  
  if (monthlyRate === 0) {
    months = Math.ceil(balance / monthlyPayment);
  } else {
    months = Math.ceil(
      -Math.log(1 - (balance * monthlyRate) / monthlyPayment) / Math.log(1 + monthlyRate)
    );
  }
  
  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + months);
  return payoffDate;
};

/**
 * Generate mock debt accounts with realistic data
 */
export const generateMockDebtAccounts = (): DebtAccount[] => {
  const accounts: DebtAccount[] = [
    {
      id: '1',
      name: 'Primary Residence',
      type: 'mortgage',
      currentBalance: 285000,
      originalAmount: 350000,
      monthlyPayment: 2150,
      interestRate: 3.25,
      payoffDate: calculatePayoffDate(285000, 2150, 3.25),
      createdDate: new Date('2020-03-15'),
      minimumPayment: 2150,
      isActive: true
    },
    {
      id: '2',
      name: '2023 Honda Accord',
      type: 'auto',
      currentBalance: 18500,
      originalAmount: 28000,
      monthlyPayment: 485,
      interestRate: 4.2,
      payoffDate: calculatePayoffDate(18500, 485, 4.2),
      createdDate: new Date('2023-01-10'),
      minimumPayment: 485,
      isActive: true
    },
    {
      id: '3',
      name: 'Chase Sapphire Reserve',
      type: 'credit_card',
      currentBalance: 3250,
      originalAmount: 5000,
      monthlyPayment: 150,
      interestRate: 18.99,
      payoffDate: calculatePayoffDate(3250, 150, 18.99),
      createdDate: new Date('2021-08-20'),
      minimumPayment: 65,
      extraPayment: 85,
      isActive: true
    },
    {
      id: '4',
      name: 'Home Improvement Loan',
      type: 'personal',
      currentBalance: 12800,
      originalAmount: 20000,
      monthlyPayment: 425,
      interestRate: 7.5,
      payoffDate: calculatePayoffDate(12800, 425, 7.5),
      createdDate: new Date('2022-06-01'),
      minimumPayment: 425,
      isActive: true
    },
    {
      id: '5',
      name: 'MBA Student Loan',
      type: 'student',
      currentBalance: 45000,
      originalAmount: 65000,
      monthlyPayment: 650,
      interestRate: 5.8,
      payoffDate: calculatePayoffDate(45000, 650, 5.8),
      createdDate: new Date('2019-09-01'),
      minimumPayment: 650,
      isActive: true
    },
    {
      id: '6',
      name: 'Capital One Venture',
      type: 'credit_card',
      currentBalance: 1850,
      originalAmount: 3000,
      monthlyPayment: 100,
      interestRate: 16.24,
      payoffDate: calculatePayoffDate(1850, 100, 16.24),
      createdDate: new Date('2022-11-15'),
      minimumPayment: 37,
      extraPayment: 63,
      isActive: true
    }
  ];

  return accounts;
};

/**
 * Calculate debt summary statistics from account data
 */
export const calculateDebtSummary = (accounts: DebtAccount[]): any => {
  const activeAccounts = accounts.filter(account => account.isActive);
  
  const totalOutstandingDebt = activeAccounts.reduce(
    (sum, account) => sum + account.currentBalance, 0
  );
  
  const totalMonthlyPayments = activeAccounts.reduce(
    (sum, account) => sum + account.monthlyPayment, 0
  );
  
  const numberOfActiveAccounts = activeAccounts.length;
  
  const averageInterestRate = activeAccounts.reduce(
    (sum, account) => sum + account.interestRate, 0
  ) / numberOfActiveAccounts;
  
  const totalPaid = activeAccounts.reduce(
    (sum, account) => sum + (account.originalAmount - account.currentBalance), 0
  );
  
  // Find the latest payoff date
  const projectedPayoffDate = activeAccounts.reduce(
    (latest, account) => account.payoffDate > latest ? account.payoffDate : latest,
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

export const mockDebtAccounts = generateMockDebtAccounts();
export const mockDebtSummary = calculateDebtSummary(mockDebtAccounts);