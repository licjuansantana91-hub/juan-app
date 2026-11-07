import {
  Transaction,
  Category,
  MonthlyStats,
  CategoryExpenseBreakdown,
  MonthlyHistoryPoint,
  CurrencyConfig,
} from '../types/finance';

export function formatCurrency(
  amount: number,
  currency: CurrencyConfig,
  decimals = 2
): string {
  const formattedNumber = Math.abs(amount).toLocaleString('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const sign = amount < 0 ? '-' : '';
  return `${sign}${currency.symbol} ${formattedNumber}`;
}

export function formatMonthLabel(monthKey: string): string {
  // monthKey: 'YYYY-MM'
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const date = new Date(year, month, 1);

  const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
  const capitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);
  return `${capitalized} ${year}`;
}

export function formatFullDate(dateStr: string): string {
  // dateStr: 'YYYY-MM-DD'
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getAvailableMonths(transactions: Transaction[]): string[] {
  const monthSet = new Set<string>();
  transactions.forEach((tx) => {
    if (tx.date && tx.date.length >= 7) {
      monthSet.add(tx.date.substring(0, 7));
    }
  });

  // Always ensure current month exists
  const now = new Date();
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  monthSet.add(currentKey);

  // Sort descending (latest month first)
  return Array.from(monthSet).sort().reverse();
}

export function calculateMonthlyStats(
  transactions: Transaction[],
  categories: Category[],
  selectedMonth: string // 'all' or 'YYYY-MM'
): MonthlyStats {
  const filtered =
    selectedMonth === 'all'
      ? transactions
      : transactions.filter((tx) => tx.date.startsWith(selectedMonth));

  let totalIncome = 0;
  let totalExpense = 0;

  filtered.forEach((tx) => {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else if (tx.type === 'expense') {
      totalExpense += tx.amount;
    }
  });

  const netSavings = totalIncome - totalExpense;
  const savingsRate =
    totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0;

  // Calculate total monthly budget for expense categories
  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const totalBudget = expenseCategories.reduce(
    (sum, c) => sum + (c.monthlyBudget || 0),
    0
  );

  const budgetUsedPercent =
    totalBudget > 0 ? Math.min(999, Math.round((totalExpense / totalBudget) * 100)) : 0;

  return {
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate,
    totalBudget,
    budgetUsedPercent,
  };
}

export function calculateCategoryBreakdown(
  transactions: Transaction[],
  categories: Category[],
  selectedMonth: string // 'all' or 'YYYY-MM'
): CategoryExpenseBreakdown[] {
  const filtered =
    selectedMonth === 'all'
      ? transactions.filter((tx) => tx.type === 'expense')
      : transactions.filter(
          (tx) => tx.type === 'expense' && tx.date.startsWith(selectedMonth)
        );

  const totalExpense = filtered.reduce((sum, tx) => sum + tx.amount, 0);

  const categoryMap = new Map<string, { total: number; count: number }>();

  filtered.forEach((tx) => {
    const curr = categoryMap.get(tx.categoryId) || { total: 0, count: 0 };
    curr.total += tx.amount;
    curr.count += 1;
    categoryMap.set(tx.categoryId, curr);
  });

  const breakdown: CategoryExpenseBreakdown[] = [];

  // Include categories that have expenses or are active expense categories
  const expenseCats = categories.filter((c) => c.type === 'expense');

  expenseCats.forEach((cat) => {
    const data = categoryMap.get(cat.id) || { total: 0, count: 0 };
    const percentage = totalExpense > 0 ? (data.total / totalExpense) * 100 : 0;
    const budget = cat.monthlyBudget || 0;
    const budgetPercent = budget > 0 ? Math.round((data.total / budget) * 100) : 0;
    const isOverBudget = budget > 0 && data.total > budget;

    breakdown.push({
      category: cat,
      totalSpent: data.total,
      percentage,
      transactionCount: data.count,
      budget,
      budgetPercent,
      isOverBudget,
    });
  });

  // Sort by highest expenditure first
  return breakdown.sort((a, b) => b.totalSpent - a.totalSpent);
}

export function calculateMonthlyHistory(
  transactions: Transaction[],
  lastNMonths = 6
): MonthlyHistoryPoint[] {
  const monthMap = new Map<string, { income: number; expense: number }>();

  transactions.forEach((tx) => {
    const key = tx.date.substring(0, 7);
    const curr = monthMap.get(key) || { income: 0, expense: 0 };
    if (tx.type === 'income') {
      curr.income += tx.amount;
    } else {
      curr.expense += tx.amount;
    }
    monthMap.set(key, curr);
  });

  // Sort keys ascending
  const sortedKeys = Array.from(monthMap.keys()).sort();
  const recentKeys = sortedKeys.slice(-lastNMonths);

  return recentKeys.map((key) => {
    const data = monthMap.get(key) || { income: 0, expense: 0 };
    return {
      monthKey: key,
      monthLabel: formatMonthLabel(key),
      income: data.income,
      expense: data.expense,
      net: data.income - data.expense,
    };
  });
}

export function calculateDailySpending(
  transactions: Transaction[],
  selectedMonth: string
): { day: number; daily: number; cumulative: number }[] {
  if (selectedMonth === 'all') return [];

  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  // Number of days in month
  const daysInMonth = new Date(year, month, 0).getDate();

  const dailyTotals = new Array(daysInMonth + 1).fill(0);

  transactions
    .filter((tx) => tx.type === 'expense' && tx.date.startsWith(selectedMonth))
    .forEach((tx) => {
      const day = parseInt(tx.date.split('-')[2], 10);
      if (day >= 1 && day <= daysInMonth) {
        dailyTotals[day] += tx.amount;
      }
    });

  let cumulative = 0;
  const result = [];
  for (let day = 1; day <= daysInMonth; day++) {
    cumulative += dailyTotals[day];
    result.push({
      day,
      daily: dailyTotals[day],
      cumulative,
    });
  }

  return result;
}

export function exportToCSV(
  transactions: Transaction[],
  categories: Category[],
  currency: CurrencyConfig
): void {
  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  const headers = [
    'ID',
    'Fecha',
    'Concepto',
    'Tipo',
    'Categoría',
    `Monto (${currency.symbol})`,
    'Método de Pago',
    'Recurrente',
    'Notas',
  ];

  const rows = transactions.map((t) => [
    t.id,
    t.date,
    `"${t.title.replace(/"/g, '""')}"`,
    t.type === 'expense' ? 'Gasto' : 'Ingreso',
    `"${(catMap.get(t.categoryId) || 'Sin categoría').replace(/"/g, '""')}"`,
    t.amount.toFixed(2),
    t.paymentMethod,
    t.isRecurring ? 'Sí' : 'No',
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join(
    '\r\n'
  );

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `finanzas_reporte_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
