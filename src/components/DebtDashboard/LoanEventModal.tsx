import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Pause, 
  Minus, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info
} from 'lucide-react';
import { 
  LoanEventType, 
  CreateLoanEventData, 
  LoanEventFormErrors,
  ExtraPaymentEventData,
  PaymentSkipEventData,
  LoanWithdrawalEventData,
  InterestRateChangeEventData,
  getEventTypeDisplayName,
  getEventTypeColor
} from '../../types/debt';
import { DebtService } from '../../services/debtService';
import { formatCurrency } from '../../utils/calculations';
import { useCurrency } from '../../context/CurrencyContext';

interface LoanEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtAccountId: string;
  eventType: LoanEventType;
  accountName: string;
  currentBalance: number;
  currentInterestRate: number;
  monthlyPayment: number;
  onEventCreated: () => void;
}

/**
 * Modal component for creating loan events
 * Dynamically renders form fields based on event type with comprehensive validation
 */
const LoanEventModal: React.FC<LoanEventModalProps> = ({
  isOpen,
  onClose,
  debtAccountId,
  eventType,
  accountName,
  currentBalance,
  currentInterestRate,
  monthlyPayment,
  onEventCreated
}) => {
  const { currency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<LoanEventFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Form state for different event types
  const [formData, setFormData] = useState({
    amount: 0,
    eventDate: new Date().toISOString().split('T')[0],
    reason: '',
    oldRate: currentInterestRate,
    newRate: 0,
    scheduledPaymentAmount: monthlyPayment,
    newBalance: currentBalance,
    notes: ''
  });

  // Reset form when modal opens or event type changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        amount: 0,
        eventDate: new Date().toISOString().split('T')[0],
        reason: '',
        oldRate: currentInterestRate,
        newRate: currentInterestRate,
        scheduledPaymentAmount: monthlyPayment,
        newBalance: currentBalance,
        notes: ''
      });
      setErrors({});
      setTouched({});
    }
  }, [isOpen, eventType, currentInterestRate, monthlyPayment, currentBalance]);

  /**
   * Get event type icon
   */
  const getEventIcon = () => {
    switch (eventType) {
      case 'extra_payment':
        return Plus;
      case 'payment_skip':
        return Pause;
      case 'loan_withdrawal':
        return Minus;
      case 'interest_rate_change':
        return TrendingUp;
      default:
        return Plus;
    }
  };

  /**
   * Validate form data based on event type
   */
  const validateForm = (): boolean => {
    const newErrors: LoanEventFormErrors = {};

    // Common validations
    if (!formData.eventDate) {
      newErrors.event_date = 'Event date is required';
    } else {
      const eventDate = new Date(formData.eventDate);
      const today = new Date();
      if (eventDate > today) {
        newErrors.event_date = 'Event date cannot be in the future';
      }
    }

    // Event-specific validations
    switch (eventType) {
      case 'extra_payment':
        if (!formData.amount || formData.amount <= 0) {
          newErrors.amount = 'Payment amount must be greater than 0';
        } else if (formData.amount > currentBalance) {
          newErrors.amount = 'Payment amount cannot exceed current balance';
        }
        break;

      case 'payment_skip':
        if (!formData.scheduledPaymentAmount || formData.scheduledPaymentAmount <= 0) {
          newErrors.scheduled_payment_amount = 'Scheduled payment amount must be greater than 0';
        }
        break;

      case 'loan_withdrawal':
        if (!formData.amount || formData.amount <= 0) {
          newErrors.amount = 'Withdrawal amount must be greater than 0';
        }
        if (formData.newBalance < 0) {
          newErrors.new_balance = 'New balance cannot be negative';
        }
        if (formData.newBalance < currentBalance + formData.amount) {
          newErrors.new_balance = 'New balance must be at least current balance plus withdrawal amount';
        }
        break;

      case 'interest_rate_change':
        if (formData.oldRate < 0 || formData.oldRate > 100) {
          newErrors.old_rate = 'Old interest rate must be between 0% and 100%';
        }
        if (formData.newRate < 0 || formData.newRate > 100) {
          newErrors.new_rate = 'New interest rate must be between 0% and 100%';
        }
        if (formData.oldRate === formData.newRate) {
          newErrors.new_rate = 'New rate must be different from old rate';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle input changes
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setTouched(prev => ({ ...prev, [name]: true }));

    if (name === 'amount' || name === 'newBalance' || name === 'scheduledPaymentAmount') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value.replace(/\D/g, '') || '0')
      }));
    } else if (name === 'oldRate' || name === 'newRate') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name as keyof LoanEventFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all relevant fields as touched
    const touchedFields: Record<string, boolean> = {
      eventDate: true,
      notes: true
    };

    switch (eventType) {
      case 'extra_payment':
        touchedFields.amount = true;
        break;
      case 'payment_skip':
        touchedFields.scheduledPaymentAmount = true;
        touchedFields.reason = true;
        break;
      case 'loan_withdrawal':
        touchedFields.amount = true;
        touchedFields.newBalance = true;
        break;
      case 'interest_rate_change':
        touchedFields.oldRate = true;
        touchedFields.newRate = true;
        touchedFields.reason = true;
        break;
    }

    setTouched(touchedFields);
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare event data based on type
      let eventData: any;

      switch (eventType) {
        case 'extra_payment':
          eventData = {
            amount: formData.amount,
            applied_to_principal: true
          } as ExtraPaymentEventData;
          break;

        case 'payment_skip':
          eventData = {
            scheduled_payment_amount: formData.scheduledPaymentAmount,
            skip_count: 1, // For now, each skip event counts as 1
            ...(formData.reason && { reason: formData.reason })
          } as PaymentSkipEventData;
          break;

        case 'loan_withdrawal':
          eventData = {
            amount: formData.amount,
            new_balance: formData.newBalance
          } as LoanWithdrawalEventData;
          break;

        case 'interest_rate_change':
          eventData = {
            old_rate: formData.oldRate,
            new_rate: formData.newRate,
            ...(formData.reason && { reason: formData.reason })
          } as InterestRateChangeEventData;
          break;

        default:
          throw new Error('Invalid event type');
      }

      const createEventData: CreateLoanEventData = {
        debt_account_id: debtAccountId,
        event_type: eventType,
        event_data: eventData,
        event_date: new Date(formData.eventDate),
        ...(formData.notes && { notes: formData.notes })
      };

      await DebtService.createLoanEvent(createEventData);
      
      // Notify parent components
      onEventCreated();
      onClose();
    } catch (error) {
      console.error('Error creating loan event:', error);
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to create loan event'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  /**
   * Generate input CSS classes
   */
  const inputClasses = (fieldName: string) => `
    block w-full rounded-lg py-3 px-4 
    text-gray-900 bg-white dark:bg-gray-800 dark:text-white 
    border ${touched[fieldName] && errors[fieldName as keyof LoanEventFormErrors]
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
      : 'border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-primary'
    } 
    focus:outline-none focus:ring-2 
    transition duration-200
  `;

  if (!isOpen) return null;

  const EventIcon = getEventIcon();
  const eventColor = getEventTypeColor(eventType);
  const eventDisplayName = getEventTypeDisplayName(eventType);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 9999 
      }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      data-testid="loan-event-modal"
    >
      <div className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${eventColor}20` }}
            >
              <EventIcon className="h-6 w-6" style={{ color: eventColor }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {eventDisplayName}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {accountName}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            aria-label="Close modal"
            data-testid="close-modal-button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Event Type Info */}
          <div 
            className="p-4 rounded-lg border-l-4"
            style={{ 
              backgroundColor: `${eventColor}10`,
              borderLeftColor: eventColor
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4" style={{ color: eventColor }} />
              <h3 className="font-medium text-gray-900 dark:text-white">
                {eventDisplayName} Information
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {eventType === 'extra_payment' && 
                'Extra payments are applied directly to the principal balance, reducing your total interest and shortening your loan term.'
              }
              {eventType === 'payment_skip' && 
                'Record a skipped payment to track missed payments and their impact on your loan timeline.'
              }
              {eventType === 'loan_withdrawal' && 
                'Record additional funds withdrawn from your loan account (e.g., from a line of credit).'
              }
              {eventType === 'interest_rate_change' && 
                'Update your loan\'s interest rate to reflect rate changes from your lender.'
              }
            </p>
          </div>

          {/* Event Date */}
          <div className="space-y-2">
            <label htmlFor="eventDate" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Calendar className="h-4 w-4 text-gray-500" />
              Event Date
            </label>
            <input
              type="date"
              name="eventDate"
              id="eventDate"
              value={formData.eventDate}
              onChange={handleInputChange}
              max={new Date().toISOString().split('T')[0]}
              className={inputClasses('eventDate')}
              data-testid="event-date-input"
            />
            {touched.eventDate && errors.event_date && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.event_date}
              </p>
            )}
          </div>

          {/* Event-specific fields */}
          {eventType === 'extra_payment' && (
            <div className="space-y-2">
              <label htmlFor="amount" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <DollarSign className="h-4 w-4 text-gray-500" />
                Payment Amount
              </label>
              <input
                type="text"
                name="amount"
                id="amount"
                value={formData.amount > 0 ? formatCurrency(formData.amount, currency.code, false) : ''}
                onChange={handleInputChange}
                className={inputClasses('amount')}
                placeholder="Enter payment amount"
                data-testid="payment-amount-input"
              />
              {touched.amount && errors.amount && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.amount}
                </p>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Current balance: {formatCurrency(currentBalance, currency.code)}
              </div>
            </div>
          )}

          {eventType === 'payment_skip' && (
            <>
              <div className="space-y-2">
                <label htmlFor="scheduledPaymentAmount" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  Scheduled Payment Amount
                </label>
                <input
                  type="text"
                  name="scheduledPaymentAmount"
                  id="scheduledPaymentAmount"
                  value={formData.scheduledPaymentAmount > 0 ? formatCurrency(formData.scheduledPaymentAmount, currency.code, false) : ''}
                  onChange={handleInputChange}
                  className={inputClasses('scheduledPaymentAmount')}
                  placeholder="Enter scheduled payment amount"
                  data-testid="scheduled-payment-input"
                />
                {touched.scheduledPaymentAmount && errors.scheduled_payment_amount && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.scheduled_payment_amount}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="reason" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FileText className="h-4 w-4 text-gray-500" />
                  Reason for Skip (Optional)
                </label>
                <input
                  type="text"
                  name="reason"
                  id="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className={inputClasses('reason')}
                  placeholder="e.g., Financial hardship, Emergency expense"
                  data-testid="skip-reason-input"
                />
              </div>
            </>
          )}

          {eventType === 'loan_withdrawal' && (
            <>
              <div className="space-y-2">
                <label htmlFor="amount" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  Withdrawal Amount
                </label>
                <input
                  type="text"
                  name="amount"
                  id="amount"
                  value={formData.amount > 0 ? formatCurrency(formData.amount, currency.code, false) : ''}
                  onChange={handleInputChange}
                  className={inputClasses('amount')}
                  placeholder="Enter withdrawal amount"
                  data-testid="withdrawal-amount-input"
                />
                {touched.amount && errors.amount && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.amount}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="newBalance" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  New Balance After Withdrawal
                </label>
                <input
                  type="text"
                  name="newBalance"
                  id="newBalance"
                  value={formData.newBalance > 0 ? formatCurrency(formData.newBalance, currency.code, false) : ''}
                  onChange={handleInputChange}
                  className={inputClasses('newBalance')}
                  placeholder="Enter new balance"
                  data-testid="new-balance-input"
                />
                {touched.newBalance && errors.new_balance && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.new_balance}
                  </p>
                )}
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Current balance: {formatCurrency(currentBalance, currency.code)}
                </div>
              </div>
            </>
          )}

          {eventType === 'interest_rate_change' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="oldRate" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    Current Rate (%)
                  </label>
                  <input
                    type="number"
                    name="oldRate"
                    id="oldRate"
                    value={formData.oldRate || ''}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className={inputClasses('oldRate')}
                    placeholder="Current rate"
                    data-testid="old-rate-input"
                    readOnly
                  />
                  {touched.oldRate && errors.old_rate && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.old_rate}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="newRate" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    New Rate (%)
                  </label>
                  <input
                    type="number"
                    name="newRate"
                    id="newRate"
                    value={formData.newRate || ''}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className={inputClasses('newRate')}
                    placeholder="Enter new rate"
                    data-testid="new-rate-input"
                  />
                  {touched.newRate && errors.new_rate && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.new_rate}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="reason" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FileText className="h-4 w-4 text-gray-500" />
                  Reason for Change (Optional)
                </label>
                <input
                  type="text"
                  name="reason"
                  id="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className={inputClasses('reason')}
                  placeholder="e.g., Market rate adjustment, Promotional rate expired"
                  data-testid="rate-change-reason-input"
                />
              </div>
            </>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <label htmlFor="notes" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <FileText className="h-4 w-4 text-gray-500" />
              Additional Notes (Optional)
            </label>
            <textarea
              name="notes"
              id="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className={inputClasses('notes')}
              placeholder="Add any additional details about this event..."
              data-testid="notes-input"
            />
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {errors.general}
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium disabled:opacity-50"
              data-testid="cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 text-white rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2 font-medium shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              style={{ 
                backgroundColor: eventColor,
                focusRingColor: eventColor
              }}
              data-testid="submit-button"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Event...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Create {eventDisplayName}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanEventModal;