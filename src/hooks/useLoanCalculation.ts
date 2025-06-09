import { useMemo } from 'react';
import type { LoanFormData, LoanResult } from '../types';
import { calculateLoan } from '../utils/calculations';

/**
 * Custom hook for loan calculations with memoization
 * @param formData - Loan form data
 * @returns Calculated loan result or null if data is invalid
 */
export function useLoanCalculation(formData: LoanFormData | null): LoanResult | null {
  return useMemo(() => {
    if (!formData) return null;
    
    try {
      return calculateLoan(formData);
    } catch (error) {
      console.error('Error calculating loan:', error);
      return null;
    }
  }, [formData]);
}