import { supabase } from '../lib/supabaseClient';
import { DebtAccount, CreateDebtAccountData, UpdateDebtAccountData, LoanEvent, CreateLoanEventData, LoanEventStats } from '../types/debt';
import { calculateCurrentBalance, calculatePayoffDate } from '../utils/loanCalculations';

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
        start_date: new Date(account.start_date),
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

      // Calculate current balance based on loan details
      const currentBalance = calculateCurrentBalance(
        accountData.loan_amount,
        accountData.monthly_payment,
        accountData.interest_rate,
        accountData.start_date
      );

      // Calculate projected payoff date
      const payoffDate = calculatePayoffDate(
        currentBalance,
        accountData.monthly_payment,
        accountData.interest_rate
      );

      // Prepare data for insertion
      const insertData = {
        ...accountData,
        user_id: user.id,
        current_balance: currentBalance,
        start_date: accountData.start_date.toISOString().split('T')[0],
        payoff_date: payoffDate.toISOString().split('T')[0]
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
        start_date: new Date(data.start_date),
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
      
      // If loan parameters are being updated, recalculate current balance and payoff date
      if (updates.loan_amount || updates.monthly_payment || updates.interest_rate || updates.start_date) {
        // Get current account data to fill in missing values
        const currentAccount = await this.getDebtAccountById(id);
        if (!currentAccount) {
          throw new Error('Account not found');
        }

        const loanAmount = updates.loan_amount ?? currentAccount.loan_amount;
        const monthlyPayment = updates.monthly_payment ?? currentAccount.monthly_payment;
        const interestRate = updates.interest_rate ?? currentAccount.interest_rate;
        const startDate = updates.start_date ?? currentAccount.start_date;

        // Recalculate current balance and payoff date
        const currentBalance = calculateCurrentBalance(
          loanAmount,
          monthlyPayment,
          interestRate,
          startDate
        );

        const payoffDate = calculatePayoffDate(
          currentBalance,
          monthlyPayment,
          interestRate
        );

        updateData.current_balance = currentBalance;
        updateData.payoff_date = payoffDate;
      }

      // Convert dates to strings for database
      if (updateData.start_date) {
        updateData.start_date = updateData.start_date.toISOString().split('T')[0] as any;
      }
      if (updateData.payoff_date) {
        updateData.payoff_date = updateData.payoff_date.toISOString().split('T')[0] as any;
      }

      const { data, error } = await supabase
        .from('debt_accounts')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
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
        start_date: new Date(data.start_date),
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
        .eq('user_id', user.id);

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
          return null;
        }
        console.error('Error fetching debt account:', error);
        throw new Error(`Failed to fetch debt account: ${error.message}`);
      }

      // Transform the response to match our DebtAccount interface
      return {
        ...data,
        start_date: new Date(data.start_date),
        payoff_date: new Date(data.payoff_date),
        created_at: new Date(data.created_at)
      };
    } catch (error) {
      console.error('Error in getDebtAccountById:', error);
      throw error;
    }
  }

  // ============================================================================
  // LOAN EVENTS METHODS
  // ============================================================================

  /**
   * Create a new loan event for a debt account
   */
  static async createLoanEvent(eventData: CreateLoanEventData): Promise<LoanEvent> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Prepare data for insertion
      const insertData = {
        ...eventData,
        user_id: user.id,
        event_date: eventData.event_date.toISOString().split('T')[0]
      };

      const { data, error } = await supabase
        .from('loan_events')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Error creating loan event:', error);
        throw new Error(`Failed to create loan event: ${error.message}`);
      }

      // Transform the response to match our LoanEvent interface
      return {
        ...data,
        event_date: new Date(data.event_date),
        created_at: new Date(data.created_at)
      };
    } catch (error) {
      console.error('Error in createLoanEvent:', error);
      throw error;
    }
  }

  /**
   * Fetch all loan events for a specific debt account
   */
  static async getLoanEventsByAccountId(debtAccountId: string): Promise<LoanEvent[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('loan_events')
        .select('*')
        .eq('debt_account_id', debtAccountId)
        .eq('user_id', user.id)
        .order('event_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching loan events:', error);
        throw new Error(`Failed to fetch loan events: ${error.message}`);
      }

      // Transform the data to match our LoanEvent interface
      return (data || []).map(event => ({
        ...event,
        event_date: new Date(event.event_date),
        created_at: new Date(event.created_at)
      }));
    } catch (error) {
      console.error('Error in getLoanEventsByAccountId:', error);
      throw error;
    }
  }

  /**
   * Fetch all loan events for the authenticated user across all accounts
   */
  static async getUserLoanEvents(): Promise<LoanEvent[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('loan_events')
        .select('*')
        .eq('user_id', user.id)
        .order('event_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user loan events:', error);
        throw new Error(`Failed to fetch loan events: ${error.message}`);
      }

      // Transform the data to match our LoanEvent interface
      return (data || []).map(event => ({
        ...event,
        event_date: new Date(event.event_date),
        created_at: new Date(event.created_at)
      }));
    } catch (error) {
      console.error('Error in getUserLoanEvents:', error);
      throw error;
    }
  }

  /**
   * Get loan event statistics for a specific debt account
   */
  static async getLoanEventStats(debtAccountId: string): Promise<LoanEventStats> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('loan_events')
        .select('event_type, event_data, event_date')
        .eq('debt_account_id', debtAccountId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching loan event stats:', error);
        throw new Error(`Failed to fetch loan event stats: ${error.message}`);
      }

      // Calculate statistics
      const events = data || [];
      const stats: LoanEventStats = {
        total_events: events.length,
        extra_payments_count: 0,
        extra_payments_total: 0,
        payment_skips_count: 0,
        withdrawals_count: 0,
        withdrawals_total: 0,
        rate_changes_count: 0
      };

      let lastEventDate: Date | undefined;

      events.forEach(event => {
        const eventDate = new Date(event.event_date);
        if (!lastEventDate || eventDate > lastEventDate) {
          lastEventDate = eventDate;
        }

        switch (event.event_type) {
          case 'extra_payment':
            stats.extra_payments_count++;
            stats.extra_payments_total += parseFloat(event.event_data.amount) || 0;
            break;
          case 'payment_skip':
            stats.payment_skips_count++;
            break;
          case 'loan_withdrawal':
            stats.withdrawals_count++;
            stats.withdrawals_total += parseFloat(event.event_data.amount) || 0;
            break;
          case 'interest_rate_change':
            stats.rate_changes_count++;
            break;
        }
      });

      if (lastEventDate) {
        stats.last_event_date = lastEventDate;
      }

      return stats;
    } catch (error) {
      console.error('Error in getLoanEventStats:', error);
      throw error;
    }
  }

  /**
   * Delete a loan event (soft delete by updating notes or hard delete if needed)
   */
  static async deleteLoanEvent(eventId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('loan_events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting loan event:', error);
        throw new Error(`Failed to delete loan event: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deleteLoanEvent:', error);
      throw error;
    }
  }

  /**
   * Update loan event notes (only notes can be updated to maintain audit trail)
   */
  static async updateLoanEventNotes(eventId: string, notes: string): Promise<LoanEvent> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('loan_events')
        .update({ notes })
        .eq('id', eventId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating loan event notes:', error);
        throw new Error(`Failed to update loan event notes: ${error.message}`);
      }

      if (!data) {
        throw new Error('Loan event not found or you do not have permission to update it');
      }

      // Transform the response to match our LoanEvent interface
      return {
        ...data,
        event_date: new Date(data.event_date),
        created_at: new Date(data.created_at)
      };
    } catch (error) {
      console.error('Error in updateLoanEventNotes:', error);
      throw error;
    }
  }
}