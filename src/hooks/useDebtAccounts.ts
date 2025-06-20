import { useState, useEffect } from 'react';
import { DebtAccount } from '../types/debt';
import { DebtService } from '../services/debtService';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for managing debt accounts data
 * Provides loading states, error handling, and automatic refetching
 */
export const useDebtAccounts = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<DebtAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch debt accounts from Supabase
   */
  const fetchAccounts = async () => {
    if (!user) {
      setAccounts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetchedAccounts = await DebtService.getUserDebtAccounts();
      setAccounts(fetchedAccounts);
    } catch (err) {
      console.error('Error fetching debt accounts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch debt accounts');
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh accounts data
   */
  const refreshAccounts = () => {
    fetchAccounts();
  };

  /**
   * Add a new account and refresh the list
   */
  const addAccount = async (accountData: any) => {
    try {
      await DebtService.createDebtAccount(accountData);
      await fetchAccounts(); // Refresh the list
    } catch (err) {
      throw err; // Re-throw to let the component handle the error
    }
  };

  /**
   * Update an account and refresh the list
   */
  const updateAccount = async (id: string, updates: any) => {
    try {
      await DebtService.updateDebtAccount(id, updates);
      await fetchAccounts(); // Refresh the list
    } catch (err) {
      throw err; // Re-throw to let the component handle the error
    }
  };

  /**
   * Delete an account and refresh the list
   */
  const deleteAccount = async (id: string) => {
    try {
      await DebtService.deleteDebtAccount(id);
      await fetchAccounts(); // Refresh the list
    } catch (err) {
      throw err; // Re-throw to let the component handle the error
    }
  };

  // Fetch accounts when user changes
  useEffect(() => {
    fetchAccounts();
  }, [user]);

  return {
    accounts,
    loading,
    error,
    refreshAccounts,
    addAccount,
    updateAccount,
    deleteAccount
  };
};