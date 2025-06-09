/**
 * Application-wide constants
 */

/** Available color palette for debt accounts */
export const DEBT_ACCOUNT_COLORS = [
  '#EF4444', '#3B82F6', '#10B981', '#F59E0B', 
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
] as const;

/** Supported currencies with their display information */
export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' }
] as const;

/** Debt account type labels for UI display */
export const DEBT_ACCOUNT_TYPE_LABELS = {
  credit_card: 'Credit Card',
  personal_loan: 'Personal Loan',
  mortgage: 'Mortgage',
  auto_loan: 'Auto Loan',
  student_loan: 'Student Loan',
  other: 'Other'
} as const;

/** Validation limits for form inputs */
export const VALIDATION_LIMITS = {
  MIN_LOAN_AMOUNT: 1,
  MAX_LOAN_AMOUNT: 100_000_000,
  MIN_INTEREST_RATE: 0,
  MAX_INTEREST_RATE: 100,
  MIN_LOAN_TERM_YEARS: 1,
  MAX_LOAN_TERM_YEARS: 30,
  MIN_LOAN_TERM_MONTHS: 1,
  MAX_LOAN_TERM_MONTHS: 360,
  MAX_PRIME_RATE: 50
} as const;

/** Default values for forms */
export const DEFAULT_VALUES = {
  LOAN_AMOUNT: 1_000_000,
  INTEREST_RATE: 10,
  LOAN_TERM: 10,
  PRIME_RATE: 5.0,
  LOAN_TERM_MONTHS: 360
} as const;

/** Local storage keys */
export const STORAGE_KEYS = {
  THEME: 'theme',
  CURRENCY: 'currency'
} as const;

/** Debounce delays in milliseconds */
export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  FORM_VALIDATION: 500,
  AUTO_SAVE: 1000
} as const;