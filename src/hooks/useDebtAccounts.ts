import { useState, useCallback, useMemo } from 'react';
import type { DebtAccount, DebtAccountFormData } from '../types';
import { DEBT_ACCOUNT_COLORS } from '../utils/constants';

/**
 * Custom hook for managing debt accounts state and operations
 * @param initialAccounts - Initial debt accounts array
 * @returns Object with accounts state and management functions
 */
export function useDebtAccounts(initialAccounts: DebtAccount[] = []) {
  const [accounts, setAccounts] = useState<DebtAccount[]>(initialAccounts);

  /**
   * Add a new debt account
   */
  const addAccount = useCallback((accountData: DebtAccountFormData) => {
    const newAccount: DebtAccount = {
      id: Date.now().toString(),
      name: accountData.name,
      currentBalance: accountData.currentBalance,
      monthlyPayment: accountData.monthlyPayment || calculateMonthlyPayment(accountData),
      interestRate: accountData.interestRate,
      color: DEBT_ACCOUNT_COLORS[accounts.length % DEBT_ACCOUNT_COLORS.length],
      accountType: accountData.accountType,
      startDate: accountData.startDate,
      isRevolvingCredit: accountData.isRevolvingCredit,
      loanTerm: accountData.loanTerm,
      termUnit: accountData.termUnit,
      originalBalance: accountData.currentBalance,
      interestPaidToDate: 0,
      paymentDueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
    };

    // Calculate payoff date
    if (!newAccount.isRevolvingCredit) {
      const payoffDate = new Date(newAccount.startDate);
      if (newAccount.termUnit === 'years') {
        payoffDate.setFullYear(payoffDate.getFullYear() + newAccount.loanTerm);
      } else {
        payoffDate.setMonth(payoffDate.getMonth() + newAccount.loanTerm);
      }
      newAccount.payoffDate = payoffDate;
      newAccount.remainingTerm = newAccount.loanTerm * (newAccount.termUnit === 'years' ? 12 : 1);
    }

    setAccounts(prev => [...prev, newAccount]);
  }, [accounts.length]);

  /**
   * Update an existing debt account
   */
  const updateAccount = useCallback((accountId: string, updates: Partial<DebtAccount>) => {
    setAccounts(prev => prev.map(account => 
      account.id === accountId ? { ...account, ...updates } : account
    ));
  }, []);

  /**
   * Remove a debt account
   */
  const removeAccount = useCallback((accountId: string) => {
    setAccounts(prev => prev.filter(account => account.id !== accountId));
  }, []);

  /**
   * Calculate total debt across all accounts
   */
  const totalDebt = useMemo(() => {
    return accounts.reduce((sum, account) => sum + account.currentBalance, 0);
  }, [accounts]);

  /**
   * Calculate total monthly payments
   */
  const totalMonthlyPayments = useMemo(() => {
    return accounts.reduce((sum, account) => sum + account.monthlyPayment, 0);
  }, [accounts]);

  /**
   * Get active accounts only
   */
  const activeAccounts = useMemo(() => {
    return accounts.filter(account => account.currentBalance > 0);
  }, [accounts]);

  return {
    accounts,
    addAccount,
    updateAccount,
    removeAccount,
    totalDebt,
    totalMonthlyPayments,
    activeAccounts,
    setAccounts
  };
}

/**
 * Calculate monthly payment based on loan terms
 */
function calculateMonthlyPayment(accountData: DebtAccountFormData): number {
  const { currentBalance, interestRate, loanTerm, termUnit } = accountData;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = termUnit === 'years' ? loanTerm * 12 : loanTerm;
  
  if (monthlyRate === 0) {
    return currentBalance / numberOfPayments;
  }
  
  return currentBalance * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
         (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
}