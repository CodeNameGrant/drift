import type { Currency } from '../types';

/**
 * Formats a number as currency with proper localization
 * @param amount - The numeric amount to format
 * @param currencyCode - ISO currency code (e.g., 'USD', 'EUR')
 * @param showDecimals - Whether to show decimal places
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number, 
  currencyCode: string = 'USD', 
  showDecimals: boolean = true
): string => {
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'narrowSymbol'
  };

  if (!showDecimals) {
    options.minimumFractionDigits = 0;
    options.maximumFractionDigits = 0;
  }

  return new Intl.NumberFormat(undefined, options).format(amount);
};

/**
 * Formats a date for display with proper localization
 * @param date - The date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date, 
  options?: Intl.DateTimeFormatOptions
): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  };

  return new Intl.DateTimeFormat(undefined, { ...defaultOptions, ...options }).format(date);
};

/**
 * Formats a percentage value for display
 * @param value - The percentage value (e.g., 5.5 for 5.5%)
 * @param decimals - Number of decimal places to show
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat(undefined, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100);
};

/**
 * Formats a number with proper thousand separators
 * @param value - The number to format
 * @param decimals - Number of decimal places
 * @returns Formatted number string
 */
export const formatNumber = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat(undefined, {
    style: 'decimal',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Adds commas to a number string for better readability
 * @param value - String or number to format
 * @returns Number string with comma separators
 */
export const formatNumberWithCommas = (value: string | number): string => {
  const digits = typeof value === 'number' ? value.toString() : value.replace(/\D/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Truncates text to a specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};