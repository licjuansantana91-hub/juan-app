import React, { useState } from 'react';
import { CategoryExpenseBreakdown, CurrencyConfig } from '../../types/finance';
import { formatCurrency } from '../../utils/financeCalculations';
import { getCategoryIconComponent } from '../../utils/categoryIcons';
import {
  AlertTriangle,
  SlidersHorizontal,
  Check,
  X,
  Pencil,
  Plus,
} from 'lucide-react';

interface BudgetProgressChartProps {
  breakdown: CategoryExpenseBreakdown[];
  currency: CurrencyConfig;
  onEditCategory: (categoryId: string) => void;
  onQuickUpdateBudget: (categoryId: string, newBudget: number) => void;
  onOpenCreateCategory: () => void;
}

export const BudgetProgressChart: React.FC<BudgetProgressChartProps> = ({
  breakdown,
  currency,
  onEditCategory,
  onQuickUpdateBudget,
  onOpenCreateCategory,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'alerts' | 'withBudget'>('all');

  // Inline editing state for quick budget adjustment
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlineBudgetValue, setInlineBudgetValue] = useState<string>('');

  const filteredItems = breakdown.filter((item) => {
    if (filterMode === 'alerts') {
      return item.budget > 0 && item.budgetPercent >= 80;
    }
    if (filterMode === 'withBudget') {
      return item.budget > 0;
    }
    return true;
  });

  const totalBudget = breakdown.reduce((sum, item) => sum + item.budget, 0);
  const totalSpent = breakdown.reduce((sum, item) => sum + item.totalSpent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPercent =
    totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const startInlineEdit = (categoryId: string, currentBudget: number) => {
    setInlineEditingId(categoryId);
    setInlineBudgetValue(String(currentBudget || ''));
  };

  const handleSaveInlineBudget = (categoryId: string) => {
    const val = parseFloat(inlineBudgetValue);
    onQuickUpdateBudget(categoryId, isNaN(val) ? 0 : Math.max(0, val));
    setInlineEditingId(null);
  };

  return (
    <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl flex flex-col gap-5">
      {/* Header and overall budget gauge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <span>Presupuestos y Categorías de Gastos</span>
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Ajusta tus límites mensuales directamente o personaliza cada categoría
          </p>
        </div>

        {/* Filter tabs & Add Category */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              Todas ({breakdown.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('withBudget')}
              className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
                filterMode === 'withBudget'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              Con Presupuesto
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('alerts')}
              className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
                filterMode === 'alerts'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              En Alerta (≥80%)
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenCreateCategory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Categoría</span>
          </button>
        </div>
      </div>

      {/* Global summary strip */}
      <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-100 dark:border-neutral-800">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs mb-2">
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
            Presupuesto Mensual Total: {formatCurrency(totalBudget, currency)}
          </span>
          <span className="font-mono text-neutral-600 dark:text-neutral-400">
            Gastado:{' '}
            <strong className="text-neutral-900 dark:text-neutral-100">
              {formatCurrency(totalSpent, currency)}
            </strong>{' '}
            ({overallPercent}%)
            {totalRemaining >= 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 ml-2 font-semibold">
                · Disponible: {formatCurrency(totalRemaining, currency)}
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 ml-2 font-semibold">
                · Excedido: {formatCurrency(Math.abs(totalRemaining), currency)}
              </span>
            )}
          </span>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full h-2.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              overallPercent > 100
                ? 'bg-rose-500'
                : overallPercent >= 80
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, overallPercent)}%` }}
          />
        </div>
      </div>

      {/* Categories Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredItems.map((item) => {
          const IconComp = getCategoryIconComponent(item.category.icon);
          const hasBudget = item.budget > 0;
          const remaining = item.budget - item.totalSpent;
          const percent = hasBudget ? item.budgetPercent : 0;

          const isOver = hasBudget && percent > 100;
          const isWarning = hasBudget && percent >= 80 && !isOver;

          let barColor = 'bg-emerald-500';
          if (isOver) barColor = 'bg-rose-500';
          else if (isWarning) barColor = 'bg-amber-500';

          const isInlineEditing = inlineEditingId === item.category.id;

          return (
            <div
              key={item.category.id}
              className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all flex flex-col justify-between shadow-xs"
            >
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white shadow-xs"
                    style={{ backgroundColor: item.category.color }}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                      {item.category.name}
                    </h4>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      {item.transactionCount} movimiento{item.transactionCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Edit full category button */}
                <button
                  type="button"
                  onClick={() => onEditCategory(item.category.id)}
                  title="Configurar nombre, color, icono o presupuesto"
                  className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors"
                >
                  <SlidersHorizontal className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Configurar</span>
                </button>
              </div>

              {/* Inline Budget Quick Editor */}
              {isInlineEditing ? (
                <div className="my-2 p-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-emerald-500/40">
                  <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Nuevo límite mensual ({currency.symbol}):
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={inlineBudgetValue}
                      onChange={(e) => setInlineBudgetValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveInlineBudget(item.category.id);
                        if (e.key === 'Escape') setInlineEditingId(null);
                      }}
                      className="w-full text-xs font-mono font-bold px-2.5 py-1.5 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveInlineBudget(item.category.id)}
                      className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium shadow-xs"
                      title="Guardar presupuesto"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setInlineEditingId(null)}
                      className="p-1.5 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 rounded"
                      title="Cancelar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Budget metrics */}
              {hasBudget ? (
                <div className="space-y-1.5 mt-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="text-neutral-600 dark:text-neutral-300">
                        {formatCurrency(item.totalSpent, currency)}
                        <span className="text-neutral-400"> / {formatCurrency(item.budget, currency)}</span>
                      </span>
                      {!isInlineEditing && (
                        <button
                          type="button"
                          onClick={() => startInlineEdit(item.category.id, item.budget)}
                          title="Modificar límite de presupuesto rápidamente"
                          className="text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 p-0.5"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <span
                      className={`font-semibold ${
                        isOver
                          ? 'text-rose-600 dark:text-rose-400 flex items-center gap-1'
                          : isWarning
                          ? 'text-amber-600 dark:text-amber-400 flex items-center gap-1'
                          : 'text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {isOver && <AlertTriangle className="w-3 h-3" />}
                      {percent}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
                    {isOver ? (
                      <span className="text-rose-600 dark:text-rose-400 font-medium font-mono">
                        Sobrepasado por {formatCurrency(Math.abs(remaining), currency)}
                      </span>
                    ) : (
                      <span className="font-mono">
                        Disponible: {formatCurrency(remaining, currency)}
                      </span>
                    )}
                    <span className="text-[10px] text-neutral-400">
                      {remaining > 0 ? `${100 - percent}% libre` : 'Límite alcanzado'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs py-1.5 bg-neutral-50 dark:bg-neutral-800/40 px-2.5 rounded-lg">
                  <span className="text-neutral-500 dark:text-neutral-400 font-mono">
                    Gastado: {formatCurrency(item.totalSpent, currency)}
                  </span>
                  <button
                    type="button"
                    onClick={() => startInlineEdit(item.category.id, 5000)}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Fijar Presupuesto
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="py-8 text-center text-xs text-neutral-500 dark:text-neutral-400">
          No hay categorías que coincidan con el filtro seleccionado.
        </div>
      )}
    </div>
  );
};
