export interface DebtAccount {
  id: string;
  user_id: string;
  name: string;
  type: 'mortgage' | 'auto' | 'credit_card' | 'personal' | 'student' | 'business';
  current_balance: number;
  loan_amount: number; // Changed from original_amount
  monthly_payment: number;
  interest_rate: number;
  start_date: Date; // Added start date
  payoff_date: Date; // This will be calculated
  created_at: Date;
  minimum_payment: number;
  is_active: boolean;
  // Optional fields for additional loan details
  loan_term_months?: number; // Store original loan term
  extra_payment?: number; // For tracking extra payments
}

export interface CreateDebtAccountData {
  name: string;
  type: DebtAccount['type'];
  loan_amount: number; // Original loan amount
  monthly_payment: number;
  interest_rate: number;
  start_date: Date; // When the loan started
  minimum_payment: number;
  loan_term_months?: number; // Optional: store original term for reference
}

export interface UpdateDebtAccountData extends Partial<CreateDebtAccountData> {
  is_active?: boolean;
  current_balance?: number;
  payoff_date?: Date;
  extra_payment?: number;
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

export interface DebtAccountFormErrors {
  name?: string;
  type?: string;
  loan_amount?: string;
  monthly_payment?: string;
  interest_rate?: string;
  start_date?: string;
  minimum_payment?: string;
  loan_term?: string; // For loan term validation
}

// Validation interfaces
export interface LoanValidationResult {
  isValid: boolean;
  errors: DebtAccountFormErrors;
  warnings?: string[];
}

export interface PaymentValidationResult {
  isValid: boolean;
  minimumRequired: number;
  message?: string;
}

// Account type configuration
export interface AccountTypeConfig {
  value: DebtAccount['type'];
  label: string;
  icon: string;
  color: string;
  description: string;
  requiresLoanTerm: boolean;
  requiresMinimumPayment: boolean;
  defaultTermYears?: number;
  maxTermYears?: number;
  minTermYears?: number;
}

// ============================================================================
// LOAN EVENTS SYSTEM
// ============================================================================

/**
 * Enum for loan event types
 */
export type LoanEventType = 
  | 'extra_payment'
  | 'payment_skip'
  | 'loan_withdrawal'
  | 'interest_rate_change';

/**
 * Base interface for all loan events
 */
export interface LoanEvent {
  id: string;
  debt_account_id: string;
  user_id: string;
  event_type: LoanEventType;
  event_data: LoanEventData;
  event_date: Date;
  created_at: Date;
  notes?: string;
}

/**
 * Union type for all possible event data structures
 */
export type LoanEventData = 
  | ExtraPaymentEventData
  | PaymentSkipEventData
  | LoanWithdrawalEventData
  | InterestRateChangeEventData;

/**
 * Event data for extra payment events
 * Note: Extra payments are applied directly to principal debt
 */
export interface ExtraPaymentEventData {
  amount: number;
  applied_to_principal: boolean; // Always true for extra payments
}

/**
 * Event data for payment skip events
 */
export interface PaymentSkipEventData {
  scheduled_payment_amount: number;
  reason?: string;
  skip_count: number; // Running count of skipped payments
}

/**
 * Event data for loan withdrawal events
 * (e.g., taking additional funds from a line of credit)
 */
export interface LoanWithdrawalEventData {
  amount: number;
  new_balance: number; // Updated balance after withdrawal
}

/**
 * Event data for interest rate change events
 */
export interface InterestRateChangeEventData {
  old_rate: number;
  new_rate: number;
  reason?: string; // e.g., "Market rate adjustment", "Promotional rate expired"
}

/**
 * Interface for creating new loan events
 */
export interface CreateLoanEventData {
  debt_account_id: string;
  event_type: LoanEventType;
  event_data: LoanEventData;
  event_date: Date;
  notes?: string;
}

/**
 * Interface for loan event form validation errors
 */
export interface LoanEventFormErrors {
  amount?: string;
  event_date?: string;
  reason?: string;
  old_rate?: string;
  new_rate?: string;
  scheduled_payment_amount?: string;
  new_balance?: string;
  notes?: string;
  general?: string;
}

/**
 * Interface for loan event statistics and analytics
 */
export interface LoanEventStats {
  total_events: number;
  extra_payments_count: number;
  extra_payments_total: number;
  payment_skips_count: number;
  withdrawals_count: number;
  withdrawals_total: number;
  rate_changes_count: number;
  last_event_date?: Date;
}

/**
 * Interface for loan event timeline data (for visualizations)
 */
export interface LoanEventTimelinePoint {
  date: Date;
  event_type: LoanEventType;
  amount?: number;
  balance_after_event: number;
  description: string;
  color: string;
}

/**
 * Interface for loan balance history (including events)
 */
export interface LoanBalanceHistoryPoint {
  date: Date;
  balance: number;
  event?: LoanEvent;
  is_projected: boolean;
}

/**
 * Type guard functions for event data
 */
export const isExtraPaymentEvent = (data: LoanEventData): data is ExtraPaymentEventData => {
  return 'amount' in data && 'applied_to_principal' in data;
};

export const isPaymentSkipEvent = (data: LoanEventData): data is PaymentSkipEventData => {
  return 'scheduled_payment_amount' in data && 'skip_count' in data;
};

export const isLoanWithdrawalEvent = (data: LoanEventData): data is LoanWithdrawalEventData => {
  return 'amount' in data && 'new_balance' in data;
};

export const isInterestRateChangeEvent = (data: LoanEventData): data is InterestRateChangeEventData => {
  return 'old_rate' in data && 'new_rate' in data;
};

/**
 * Helper function to get event type display name
 */
export const getEventTypeDisplayName = (eventType: LoanEventType): string => {
  const displayNames: Record<LoanEventType, string> = {
    extra_payment: 'Extra Payment',
    payment_skip: 'Payment Skip',
    loan_withdrawal: 'Loan Withdrawal',
    interest_rate_change: 'Interest Rate Change'
  };
  return displayNames[eventType];
};

/**
 * Helper function to get event type color for UI
 */
export const getEventTypeColor = (eventType: LoanEventType): string => {
  const colors: Record<LoanEventType, string> = {
    extra_payment: '#10B981', // Green - positive action
    payment_skip: '#F59E0B', // Orange - caution
    loan_withdrawal: '#EF4444', // Red - increases debt
    interest_rate_change: '#3B82F6' // Blue - neutral change
  };
  return colors[eventType];
};

/**
 * Helper function to get event type icon
 */
export const getEventTypeIcon = (eventType: LoanEventType): string => {
  const icons: Record<LoanEventType, string> = {
    extra_payment: 'plus-circle',
    payment_skip: 'pause-circle',
    loan_withdrawal: 'minus-circle',
    interest_rate_change: 'trending-up'
  };
  return icons[eventType];
};