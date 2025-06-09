import type { LoanFormData, FormErrors } from '../types';
import { VALIDATION_LIMITS } from './constants';

/**
 * Validates loan form data and returns any validation errors
 * @param data - Partial loan form data to validate
 * @returns Object containing validation errors, if any
 */
export const validateLoanForm = (data: Partial<LoanFormData>): FormErrors => {
  const errors: FormErrors = {};
  
  // Validate loan amount
  if (!data.loanAmount || data.loanAmount < VALIDATION_LIMITS.MIN_LOAN_AMOUNT) {
    errors.loanAmount = `Loan amount must be at least ${VALIDATION_LIMITS.MIN_LOAN_AMOUNT}`;
  } else if (data.loanAmount > VALIDATION_LIMITS.MAX_LOAN_AMOUNT) {
    errors.loanAmount = `Loan amount cannot exceed ${VALIDATION_LIMITS.MAX_LOAN_AMOUNT.toLocaleString()}`;
  }
  
  // Validate interest rate
  if (data.interestRate === undefined || data.interestRate === null) {
    errors.interestRate = 'Interest rate is required';
  } else if (data.interestRate < VALIDATION_LIMITS.MIN_INTEREST_RATE || data.interestRate > VALIDATION_LIMITS.MAX_INTEREST_RATE) {
    errors.interestRate = `Interest rate must be between ${VALIDATION_LIMITS.MIN_INTEREST_RATE}% and ${VALIDATION_LIMITS.MAX_INTEREST_RATE}%`;
  }
  
  // Validate loan term
  if (!data.loanTerm || data.loanTerm < 1) {
    errors.loanTerm = data.termUnit === 'years' 
      ? `Term must be between ${VALIDATION_LIMITS.MIN_LOAN_TERM_YEARS}-${VALIDATION_LIMITS.MAX_LOAN_TERM_YEARS} years` 
      : `Term must be between ${VALIDATION_LIMITS.MIN_LOAN_TERM_MONTHS}-${VALIDATION_LIMITS.MAX_LOAN_TERM_MONTHS} months`;
  } else if (data.termUnit === 'years' && data.loanTerm > VALIDATION_LIMITS.MAX_LOAN_TERM_YEARS) {
    errors.loanTerm = `Term must be between ${VALIDATION_LIMITS.MIN_LOAN_TERM_YEARS}-${VALIDATION_LIMITS.MAX_LOAN_TERM_YEARS} years`;
  } else if (data.termUnit === 'months' && data.loanTerm > VALIDATION_LIMITS.MAX_LOAN_TERM_MONTHS) {
    errors.loanTerm = `Term must be between ${VALIDATION_LIMITS.MIN_LOAN_TERM_MONTHS}-${VALIDATION_LIMITS.MAX_LOAN_TERM_MONTHS} months`;
  }
  
  return errors;
};

/**
 * Validates email format
 * @param email - Email string to validate
 * @returns True if email is valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates that a value is a positive number
 * @param value - Value to validate
 * @returns True if value is a positive number
 */
export const isPositiveNumber = (value: unknown): value is number => {
  return typeof value === 'number' && value > 0 && !isNaN(value);
};

/**
 * Validates that a string is not empty or only whitespace
 * @param value - String to validate
 * @returns True if string has content
 */
export const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Validates prime rate value
 * @param rate - Prime rate to validate
 * @returns True if rate is valid
 */
export const validatePrimeRate = (rate: number): boolean => {
  return isPositiveNumber(rate) && rate <= VALIDATION_LIMITS.MAX_PRIME_RATE;
};