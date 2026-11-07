import React, { useState } from 'react';
import { CategoryExpenseBreakdown, CurrencyConfig } from '../../types/finance';
import { formatCurrency } from '../../utils/financeCalculations';
import { getCategoryIconComponent } from '../../utils/categoryIcons';

interface CategoryDonutChartProps {
  breakdown: CategoryExpenseBreakdown[];
  currency: CurrencyConfig;
  totalExpense: number;
  onSelectCategory?: (categoryId: string | null) => void;
  selectedCategoryId?: string | null;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  breakdown,
  currency,
  totalExpense,
  onSelectCategory,
  selectedCategoryId,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Filter only categories with spending > 0 for the pie
  const activeSlices = breakdown.filter((item) => item.totalSpent > 0);

  if (activeSlices.length === 0 || totalExpense === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl text-center bg-white dark:bg-neutral-900 min-h-[320px]">
        <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3 text-neutral-400">
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Sin gastos registrados
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs">
          Añade transacciones de gastos en este período para visualizar la distribución por categorías.
        </p>
      </div>
    );
  }

  // Calculate SVG arc paths
  const size = 260;
  const strokeWidth = 36;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  const slices = activeSlices.map((item, idx) => {
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += item.percentage;

    const isHovered = hoveredIndex === idx;
    const isSelected = selectedCategoryId === item.category.id;

    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
      isHovered,
      isSelected,
      index: idx,
    };
  });

  const activeItem =
    hoveredIndex !== null
      ? activeSlices[hoveredIndex]
      : selectedCategoryId
      ? activeSlices.find((s) => s.category.id === selectedCategoryId) || null
      : null;

  return (
    <div className="flex flex-col lg:flex-row items-center gap-6 p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
      {/* SVG Donut Visualizer */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 select-none overflow-visible"
        >
          {/* Base background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth - 6}
            className="text-neutral-100 dark:text-neutral-800"
          />

          {/* Slices */}
          {slices.map((slice) => {
            const isHighlighted = slice.isHovered || slice.isSelected;
            return (
              <circle
                key={slice.category.id}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={slice.category.color}
                strokeWidth={isHighlighted ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-200 cursor-pointer origin-center"
                style={{
                  opacity:
                    hoveredIndex !== null && !slice.isHovered
                      ? 0.55
                      : selectedCategoryId && !slice.isSelected
                      ? 0.65
                      : 1,
                  filter: isHighlighted
                    ? `drop-shadow(0 2px 8px ${slice.category.color}50)`
                    : 'none',
                }}
                onMouseEnter={() => setHoveredIndex(slice.index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => {
                  if (onSelectCategory) {
                    onSelectCategory(
                      selectedCategoryId === slice.category.id
                        ? null
                        : slice.category.id
                    );
                  }
                }}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
          {activeItem ? (
            <>
              <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 line-clamp-1 max-w-[130px]">
                {activeItem.category.name}
              </span>
              <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100 font-mono mt-0.5">
                {formatCurrency(activeItem.totalSpent, currency)}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                {activeItem.percentage.toFixed(1)}% del gasto
              </span>
            </>
          ) : (
            <>
              <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                Total Gastado
              </span>
              <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100 font-mono mt-0.5">
                {formatCurrency(totalExpense, currency)}
              </span>
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                {activeSlices.length} categoría{activeSlices.length !== 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend & Breakdown List */}
      <div className="flex-1 w-full flex flex-col gap-2 max-h-[290px] overflow-y-auto pr-1">
        <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider pb-1 border-b border-neutral-100 dark:border-neutral-800 flex justify-between">
          <span>Categoría</span>
          <span className="text-right">Monto / %</span>
        </div>

        {activeSlices.map((item, idx) => {
          const IconComp = getCategoryIconComponent(item.category.icon);
          const isSelected = selectedCategoryId === item.category.id;
          const isHovered = hoveredIndex === idx;

          return (
            <button
              type="button"
              key={item.category.id}
              onClick={() => {
                if (onSelectCategory) {
                  onSelectCategory(
                    selectedCategoryId === item.category.id ? null : item.category.id
                  );
                }
              }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-center justify-between p-2 rounded-lg text-left transition-colors text-xs ${
                isSelected
                  ? 'bg-neutral-100 dark:bg-neutral-800 ring-1 ring-neutral-300 dark:ring-neutral-700'
                  : isHovered
                  ? 'bg-neutral-50 dark:bg-neutral-800/60'
                  : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div
                  className="w-6 h-6 rounded flex items-center justify-center shrink-0 text-white shadow-xs"
                  style={{ backgroundColor: item.category.color }}
                >
                  <IconComp className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                    {item.category.name}
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    {item.transactionCount} movimiento{item.transactionCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="font-semibold text-neutral-900 dark:text-neutral-100 font-mono">
                  {formatCurrency(item.totalSpent, currency)}
                </p>
                <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                  {item.percentage.toFixed(1)}%
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
