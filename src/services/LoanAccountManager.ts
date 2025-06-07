export interface PaymentRecord {
  id: string;
  date: Date;
  amount: number;
  principalAmount: number;
  interestAmount: number;
  remainingBalance: number;
  interestRate: number; // Rate at time of payment
  interestType: 'fixed' | 'linked';
}

export interface LoanAccount {
  id: string;
  name: string;
  loanAmount: number;
  currentBalance: number;
  interestType: 'fixed' | 'linked';
  interestRate: number; // Full rate (prime + margin for linked accounts)
  margin?: number; // Only for linked accounts
  monthlyPayment: number;
  loanTermMonths: number;
  startDate: Date;
  paymentHistory: PaymentRecord[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrimeRateHistory {
  date: Date;
  rate: number;
  effectiveDate: Date;
}

export class LoanAccountManager {
  private accounts: Map<string, LoanAccount> = new Map();
  private currentPrimeRate: number = 5.0; // Default prime rate
  private primeRateHistory: PrimeRateHistory[] = [];

  constructor(initialPrimeRate: number = 5.0) {
    this.currentPrimeRate = initialPrimeRate;
    this.primeRateHistory.push({
      date: new Date(),
      rate: initialPrimeRate,
      effectiveDate: new Date()
    });
  }

  /**
   * Get current prime rate
   */
  getPrimeRate(): number {
    return this.currentPrimeRate;
  }

  /**
   * Get prime rate history
   */
  getPrimeRateHistory(): PrimeRateHistory[] {
    return [...this.primeRateHistory];
  }

  /**
   * Update prime rate - affects all linked accounts going forward
   */
  updatePrimeRate(newRate: number, effectiveDate: Date = new Date()): void {
    if (newRate < 0 || newRate > 50) {
      throw new Error('Prime rate must be between 0% and 50%');
    }

    const oldRate = this.currentPrimeRate;
    this.currentPrimeRate = newRate;

    // Record prime rate change
    this.primeRateHistory.push({
      date: new Date(),
      rate: newRate,
      effectiveDate
    });

    // Update all linked accounts
    this.accounts.forEach(account => {
      if (account.interestType === 'linked' && account.isActive) {
        const oldInterestRate = account.interestRate;
        account.interestRate = newRate + (account.margin || 0);
        account.updatedAt = new Date();

        console.log(`Updated linked account ${account.name}: ${oldInterestRate.toFixed(2)}% → ${account.interestRate.toFixed(2)}%`);
      }
    });
  }

  /**
   * Create a new loan account
   */
  createAccount(params: {
    name: string;
    loanAmount: number;
    interestType: 'fixed' | 'linked';
    interestRate: number;
    loanTermMonths: number;
    startDate?: Date;
  }): string {
    // Validation
    if (!params.name.trim()) {
      throw new Error('Account name is required');
    }
    if (params.loanAmount <= 0) {
      throw new Error('Loan amount must be greater than 0');
    }
    if (params.interestRate < 0 || params.interestRate > 50) {
      throw new Error('Interest rate must be between 0% and 50%');
    }
    if (params.loanTermMonths <= 0 || params.loanTermMonths > 600) {
      throw new Error('Loan term must be between 1 and 600 months');
    }

    const accountId = this.generateId();
    const startDate = params.startDate || new Date();

    // Calculate margin for linked accounts
    let margin: number | undefined;
    let effectiveRate = params.interestRate;

    if (params.interestType === 'linked') {
      margin = params.interestRate - this.currentPrimeRate;
      effectiveRate = this.currentPrimeRate + margin;
    }

    // Calculate monthly payment
    const monthlyPayment = this.calculateMonthlyPayment(
      params.loanAmount,
      effectiveRate,
      params.loanTermMonths
    );

    const account: LoanAccount = {
      id: accountId,
      name: params.name,
      loanAmount: params.loanAmount,
      currentBalance: params.loanAmount,
      interestType: params.interestType,
      interestRate: effectiveRate,
      margin,
      monthlyPayment,
      loanTermMonths: params.loanTermMonths,
      startDate,
      paymentHistory: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.accounts.set(accountId, account);
    return accountId;
  }

  /**
   * Get account by ID
   */
  getAccount(accountId: string): LoanAccount | null {
    return this.accounts.get(accountId) || null;
  }

  /**
   * Get all accounts
   */
  getAllAccounts(): LoanAccount[] {
    return Array.from(this.accounts.values());
  }

  /**
   * Switch interest type for an account
   */
  switchInterestType(accountId: string, newType: 'fixed' | 'linked', newRate?: number): void {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    if (!account.isActive) {
      throw new Error('Cannot modify inactive account');
    }

    const oldType = account.interestType;
    const oldRate = account.interestRate;

    if (newType === 'linked') {
      // Switching to linked rate
      if (newRate !== undefined) {
        // Use provided rate to calculate margin
        account.margin = newRate - this.currentPrimeRate;
        account.interestRate = newRate;
      } else {
        // Keep current rate and calculate margin
        account.margin = account.interestRate - this.currentPrimeRate;
      }
    } else {
      // Switching to fixed rate
      if (newRate !== undefined) {
        account.interestRate = newRate;
      }
      // Remove margin for fixed accounts
      account.margin = undefined;
    }

    account.interestType = newType;
    account.updatedAt = new Date();

    // Recalculate monthly payment based on remaining balance and term
    const remainingMonths = this.calculateRemainingMonths(account);
    if (remainingMonths > 0) {
      account.monthlyPayment = this.calculateMonthlyPayment(
        account.currentBalance,
        account.interestRate,
        remainingMonths
      );
    }

    console.log(`Switched account ${account.name} from ${oldType} (${oldRate.toFixed(2)}%) to ${newType} (${account.interestRate.toFixed(2)}%)`);
  }

  /**
   * Change interest rate for an account
   */
  changeInterestRate(accountId: string, newRate: number): void {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    if (!account.isActive) {
      throw new Error('Cannot modify inactive account');
    }

    if (newRate < 0 || newRate > 50) {
      throw new Error('Interest rate must be between 0% and 50%');
    }

    const oldRate = account.interestRate;
    account.interestRate = newRate;

    // Update margin for linked accounts
    if (account.interestType === 'linked') {
      account.margin = newRate - this.currentPrimeRate;
    }

    account.updatedAt = new Date();

    // Recalculate monthly payment based on remaining balance and term
    const remainingMonths = this.calculateRemainingMonths(account);
    if (remainingMonths > 0) {
      account.monthlyPayment = this.calculateMonthlyPayment(
        account.currentBalance,
        account.interestRate,
        remainingMonths
      );
    }

    console.log(`Changed interest rate for account ${account.name}: ${oldRate.toFixed(2)}% → ${newRate.toFixed(2)}%`);
  }

  /**
   * Calculate monthly payment amount
   */
  calculatePayment(accountId: string): number {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    if (!account.isActive || account.currentBalance <= 0) {
      return 0;
    }

    return account.monthlyPayment;
  }

  /**
   * Record a payment
   */
  recordPayment(accountId: string, paymentAmount: number, paymentDate: Date = new Date()): PaymentRecord {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    if (!account.isActive) {
      throw new Error('Cannot record payment for inactive account');
    }

    if (paymentAmount <= 0) {
      throw new Error('Payment amount must be greater than 0');
    }

    if (account.currentBalance <= 0) {
      throw new Error('Account is already paid off');
    }

    // Calculate interest and principal portions
    const monthlyInterestRate = account.interestRate / 100 / 12;
    const interestAmount = account.currentBalance * monthlyInterestRate;
    const principalAmount = Math.min(paymentAmount - interestAmount, account.currentBalance);
    const newBalance = Math.max(0, account.currentBalance - principalAmount);

    // Create payment record
    const paymentRecord: PaymentRecord = {
      id: this.generateId(),
      date: paymentDate,
      amount: paymentAmount,
      principalAmount,
      interestAmount,
      remainingBalance: newBalance,
      interestRate: account.interestRate,
      interestType: account.interestType
    };

    // Update account
    account.currentBalance = newBalance;
    account.paymentHistory.push(paymentRecord);
    account.updatedAt = new Date();

    // Mark as inactive if paid off
    if (newBalance === 0) {
      account.isActive = false;
    }

    return paymentRecord;
  }

  /**
   * Get remaining balance for an account
   */
  getRemainingBalance(accountId: string): number {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    return account.currentBalance;
  }

  /**
   * Get payment history for an account
   */
  getPaymentHistory(accountId: string): PaymentRecord[] {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    return [...account.paymentHistory];
  }

  /**
   * Get accounts affected by prime rate changes
   */
  getLinkedAccounts(): LoanAccount[] {
    return Array.from(this.accounts.values()).filter(
      account => account.interestType === 'linked' && account.isActive
    );
  }

  /**
   * Calculate projected payoff date
   */
  calculatePayoffDate(accountId: string): Date | null {
    const account = this.accounts.get(accountId);
    if (!account || !account.isActive || account.currentBalance <= 0) {
      return null;
    }

    let balance = account.currentBalance;
    let months = 0;
    const monthlyRate = account.interestRate / 100 / 12;
    const maxMonths = 600; // Safety limit

    while (balance > 0.01 && months < maxMonths) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = account.monthlyPayment - interestPayment;
      
      if (principalPayment <= 0) {
        return null; // Payment too low to pay off loan
      }

      balance -= principalPayment;
      months++;
    }

    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + months);
    return payoffDate;
  }

  /**
   * Generate amortization schedule
   */
  generateAmortizationSchedule(accountId: string, numberOfPayments: number = 12): Array<{
    paymentNumber: number;
    date: Date;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }> {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    const schedule = [];
    let balance = account.currentBalance;
    const monthlyRate = account.interestRate / 100 / 12;
    const startDate = new Date();

    for (let i = 1; i <= numberOfPayments && balance > 0.01; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = Math.min(account.monthlyPayment - interestPayment, balance);
      balance -= principalPayment;

      const paymentDate = new Date(startDate);
      paymentDate.setMonth(paymentDate.getMonth() + i);

      schedule.push({
        paymentNumber: i,
        date: paymentDate,
        payment: account.monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance)
      });
    }

    return schedule;
  }

  // Private helper methods

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private calculateMonthlyPayment(principal: number, annualRate: number, months: number): number {
    if (annualRate === 0) {
      return principal / months;
    }

    const monthlyRate = annualRate / 100 / 12;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
           (Math.pow(1 + monthlyRate, months) - 1);
  }

  private calculateRemainingMonths(account: LoanAccount): number {
    const totalMonths = account.loanTermMonths;
    const paymentsMade = account.paymentHistory.length;
    return Math.max(0, totalMonths - paymentsMade);
  }
}

// Export singleton instance
export const loanAccountManager = new LoanAccountManager();