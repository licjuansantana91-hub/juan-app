export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 'card' | 'cash' | 'transfer' | 'other';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  monthlyBudget: number; // For expenses: budget limit. For incomes: expected target.
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  isRecurring?: boolean;
}

export interface MonthlyStats {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number; // percentage (0 - 100)
  totalBudget: number;
  budgetUsedPercent: number;
}

export interface CategoryExpenseBreakdown {
  category: Category;
  totalSpent: number;
  percentage: number;
  transactionCount: number;
  budget: number;
  budgetPercent: number;
  isOverBudget: boolean;
}

export interface MonthlyHistoryPoint {
  monthKey: string; // 'YYYY-MM'
  monthLabel: string; // 'Nov 2026'
  income: number;
  expense: number;
  net: number;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  label: string;
}
