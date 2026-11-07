import React from 'react';
import { CurrencyConfig } from '../../types/finance';
import { formatMonthLabel } from '../../utils/financeCalculations';
import { DEFAULT_CURRENCIES } from '../../data/initialData';
import {
  Calendar,
  Coins,
  Download,
  SlidersHorizontal,
  Plus,
  Sun,
  Moon,
  RotateCcw,
} from 'lucide-react';

interface MonthlyFilterBarProps {
  availableMonths: string[];
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  currency: CurrencyConfig;
  onSelectCurrency: (currency: CurrencyConfig) => void;
  onOpenCategories: () => void;
  onOpenNewTransaction: () => void;
  onExportCSV: () => void;
  onResetData: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  categoryCount: number;
}

export const MonthlyFilterBar: React.FC<MonthlyFilterBarProps> = ({
  availableMonths,
  selectedMonth,
  onSelectMonth,
  currency,
  onSelectCurrency,
  onOpenCategories,
  onOpenNewTransaction,
  onExportCSV,
  onResetData,
  isDarkMode,
  onToggleDarkMode,
  categoryCount,
}) => {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
      {/* Left: Month selection and quick filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-neutral-400" />
          <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
            Período:
          </span>
          <select
            value={selectedMonth}
            onChange={(e) => onSelectMonth(e.target.value)}
            className="text-xs font-semibold py-1.5 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Todo el Histórico</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {formatMonthLabel(m)}
              </option>
            ))}
          </select>
        </div>

        {/* Currency selector */}
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-neutral-400" />
          <select
            value={currency.code}
            onChange={(e) => {
              const matched = DEFAULT_CURRENCIES.find(
                (c) => c.code === e.target.value
              );
              if (matched) onSelectCurrency(matched);
            }}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            {DEFAULT_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol} {c.code}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Category customization, export and action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Customize Categories Button */}
        <button
          type="button"
          onClick={onOpenCategories}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors whitespace-nowrap"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Categorías ({categoryCount})</span>
        </button>

        {/* Export CSV */}
        <button
          type="button"
          onClick={onExportCSV}
          title="Exportar a archivo Excel / CSV"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5 text-neutral-400" />
          <span>Exportar CSV</span>
        </button>

        {/* Reset Demo Data */}
        <button
          type="button"
          onClick={onResetData}
          title="Restablecer datos de ejemplo"
          className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={onToggleDarkMode}
          title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Primary CTA: Add Transaction */}
        <button
          type="button"
          onClick={onOpenNewTransaction}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-xs transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Movimiento</span>
        </button>
      </div>
    </div>
  );
};
