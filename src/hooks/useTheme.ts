import { useTheme as useThemeContext } from '../context/ThemeContext';

/**
 * Custom hook for accessing theme state and toggle function
 * This hook now uses the ThemeContext to ensure synchronized theme state across all components
 * 
 * @deprecated This hook is now a simple wrapper around the ThemeContext.
 * Consider importing useTheme directly from '../context/ThemeContext' instead.
 */
export const useTheme = () => {
  return useThemeContext();
};