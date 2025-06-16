/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6B4DE6',
          dark: '#8A6FFF',
          light: '#9B85FF'
        },
        appBackground: {
          light: '#F5F0FF',
          dark: '#2D2440'
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  safelist: [
    // Account type colors for dynamic class generation
    'border-blue-500',
    'border-green-500', 
    'border-orange-500',
    'border-purple-500',
    'border-teal-500',
    'border-red-500',
    'bg-blue-100',
    'bg-green-100',
    'bg-orange-100', 
    'bg-purple-100',
    'bg-teal-100',
    'bg-red-100',
    'bg-blue-900/30',
    'bg-green-900/30',
    'bg-orange-900/30',
    'bg-purple-900/30', 
    'bg-teal-900/30',
    'bg-red-900/30',
    'text-blue-600',
    'text-green-600',
    'text-orange-600',
    'text-purple-600',
    'text-teal-600', 
    'text-red-600',
    'text-blue-400',
    'text-green-400',
    'text-orange-400',
    'text-purple-400',
    'text-teal-400',
    'text-red-400',
    'bg-blue-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-purple-500',
    'bg-teal-500',
    'bg-red-500',
    'hover:bg-blue-600',
    'hover:bg-green-600',
    'hover:bg-orange-600',
    'hover:bg-purple-600',
    'hover:bg-teal-600',
    'hover:bg-red-600',
    'focus:ring-blue-500',
    'focus:ring-green-500',
    'focus:ring-orange-500',
    'focus:ring-purple-500',
    'focus:ring-teal-500',
    'focus:ring-red-500'
  ],
  plugins: [],
};