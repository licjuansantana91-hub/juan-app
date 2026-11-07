import React from 'react';
import { MonthlyStats, CurrencyConfig } from '../../types/finance';
import { formatCurrency } from '../../utils/financeCalculations';
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';

interface FinancialSummaryCardsProps {
  stats: MonthlyStats;
  currency: CurrencyConfig;
}

export const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({
  stats,
  currency,
}) => {
  const isNetPositive = stats.netSavings >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Saldo Neto / Ahorro */}
      <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl flex flex-col justify-between">
        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
          <span className="text-xs font-medium">Balance Neto</span>
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isNetPositive
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
            }`}
          >
            <Wallet className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div
            className={`text-2xl font-bold font-mono tracking-tight ${
              isNetPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrency(stats.netSavings, currency)}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            <span>{isNetPositive ? 'Superávit en período' : 'Déficit en período'}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{stats.savingsRate}% ahorro</span>
          </div>
        </div>
      </div>

      {/* 2. Total Ingresos */}
      <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl flex flex-col justify-between">
        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
          <span className="text-xs font-medium">Total Ingresos</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100">
            {formatCurrency(stats.totalIncome, currency)}
          </div>
          <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Flujo positivo de entradas registradas
          </div>
        </div>
      </div>

      {/* 3. Total Gastos */}
      <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl flex flex-col justify-between">
        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
          <span className="text-xs font-medium">Total Gastos</span>
          <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100">
            {formatCurrency(stats.totalExpense, currency)}
          </div>
          <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Consumo total en todas las categorías
          </div>
        </div>
      </div>

      {/* 4. Ejecución del Presupuesto */}
      <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl flex flex-col justify-between">
        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
          <span className="text-xs font-medium">Uso de Presupuesto</span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100">
            {stats.budgetUsedPercent}%
          </div>
          <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 font-mono">
            De {formatCurrency(stats.totalBudget, currency)} asignado
          </div>
        </div>
      </div>
    </div>
  );
};
