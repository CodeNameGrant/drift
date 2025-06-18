import { supabase } from '../lib/supabaseClient';
import { DebtAccount, CreateDebtAccountData, UpdateDebtAccountData } from '../types/debt';

/**
 * Service for managing debt accounts in Supabase
 * Handles CRUD operations with proper error handling and type safety
 */
export class DebtService {
  /**
   * Fetch all debt accounts for the authenticated user
   */
  static async getUserDebtAccounts(): Promise<DebtAccount[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('debt_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching debt accounts:', error);
        throw new Error(`Failed to fetch debt accounts: ${error.message}`);
      }

      // Transform the data to match our DebtAccount interface
      return (data || []).map(account => ({
        ...account,
        payoff_date: new Date(account.payoff_date),
        created_at: new Date(account.created_at)
      }));
    } catch (error) {
      console.error('Error in getUserDebtAccounts:', error);
      throw error;
    }
  }

  /**
   * Create a new debt account for the authenticated user
   */
  static async createDebtAccount(accountData: CreateDebtAccountData): Promise<DebtAccount> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Prepare data for insertion
      const insertData = {
        ...accountData,
        user_id: user.id,
        payoff_date: accountData.payoff_date.toISOString().split('T')[0], // Convert to date string
        extra_payment: accountData.extra_payment || 0
      };

      const { data, error } = await supabase
        .from('debt_accounts')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Error creating debt account:', error);
        throw new Error(`Failed to create debt account: ${error.message}`);
      }

      // Transform the response to match our DebtAccount interface
      return {
        ...data,
        payoff_date: new Date(data.payoff_date),
        created_at: new Date(data.created_at)
      };
    } catch (error) {
      console.error('Error in createDebtAccount:', error);
      throw error;
    }
  }

  /**
   * Update an existing debt account
   */
  static async updateDebtAccount(id: string, updates: UpdateDebtAccountData): Promise<DebtAccount> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Prepare update data
      const updateData = { ...updates };
      if (updates.payoff_date) {
        updateData.payoff_date = updates.payoff_date.toISOString().split('T')[0] as any;
      }

      const { data, error } = await supabase
        .from('debt_accounts')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id) // Ensure user can only update their own accounts
        .select()
        .single();

      if (error) {
        console.error('Error updating debt account:', error);
        throw new Error(`Failed to update debt account: ${error.message}`);
      }

      if (!data) {
        throw new Error('Debt account not found or you do not have permission to update it');
      }

      // Transform the response to match our DebtAccount interface
      return {
        ...data,
        payoff_date: new Date(data.payoff_date),
        created_at: new Date(data.created_at)
      };
    } catch (error) {
      console.error('Error in updateDebtAccount:', error);
      throw error;
    }
  }

  /**
   * Soft delete a debt account (set is_active to false)
   */
  static async deleteDebtAccount(id: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('debt_accounts')
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', user.id); // Ensure user can only delete their own accounts

      if (error) {
        console.error('Error deleting debt account:', error);
        throw new Error(`Failed to delete debt account: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deleteDebtAccount:', error);
      throw error;
    }
  }

  /**
   * Permanently delete a debt account from the database
   */
  static async permanentlyDeleteDebtAccount(id: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('debt_accounts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Ensure user can only delete their own accounts

      if (error) {
        console.error('Error permanently deleting debt account:', error);
        throw new Error(`Failed to permanently delete debt account: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in permanentlyDeleteDebtAccount:', error);
      throw error;
    }
  }

  /**
   * Get a single debt account by ID
   */
  static async getDebtAccountById(id: string): Promise<DebtAccount | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('debt_accounts')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error fetching debt account:', error);
        throw new Error(`Failed to fetch debt account: ${error.message}`);
      }

      // Transform the response to match our DebtAccount interface
      return {
        ...data,
        payoff_date: new Date(data.payoff_date),
        created_at: new Date(data.created_at)
      };
    } catch (error) {
      console.error('Error in getDebtAccountById:', error);
      throw error;
    }
  }
}