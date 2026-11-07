import React, { useState } from 'react';
import { MonthlyHistoryPoint, CurrencyConfig } from '../../types/finance';
import { formatCurrency } from '../../utils/financeCalculations';

interface MonthlyEvolutionBarChartProps {
  history: MonthlyHistoryPoint[];
  currency: CurrencyConfig;
  onSelectMonth?: (monthKey: string) => void;
  activeMonthKey?: string;
}

export const MonthlyEvolutionBarChart: React.FC<MonthlyEvolutionBarChartProps> = ({
  history,
  currency,
  onSelectMonth,
  activeMonthKey,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 min-h-[280px]">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No hay datos históricos suficientes para mostrar la evolución.
        </p>
      </div>
    );
  }

  // Calculate maximum value for chart vertical scaling
  const maxVal = Math.max(
    ...history.map((h) => Math.max(h.income, h.expense, 100)),
    500
  );

  // SVG viewBox settings
  const width = 640;
  const height = 260;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const groupWidth = chartWidth / history.length;
  const barWidth = Math.min(24, Math.max(14, groupWidth * 0.28));
  const barGap = 4;

  // Grid levels (4 tick marks)
  const ticks = [0, maxVal * 0.33, maxVal * 0.66, maxVal];

  return (
    <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Evolución Mensual (Ingresos vs. Gastos)
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Comparativa de flujo de caja de los últimos {history.length} meses
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
            <span className="text-neutral-600 dark:text-neutral-300">Ingresos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-rose-500 inline-block" />
            <span className="text-neutral-600 dark:text-neutral-300">Gastos</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[500px] select-none"
        >
          {/* Grid lines */}
          {ticks.map((val, idx) => {
            const y = paddingTop + chartHeight - (val / maxVal) * chartHeight;
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray="3 3"
                  className="text-neutral-100 dark:text-neutral-800"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-neutral-400 dark:fill-neutral-500"
                >
                  {currency.symbol}
                  {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : Math.round(val)}
                </text>
              </g>
            );
          })}

          {/* Bar Groups */}
          {history.map((item, idx) => {
            const groupX = paddingLeft + idx * groupWidth;
            const centerX = groupX + groupWidth / 2;
            const incomeBarX = centerX - barWidth - barGap / 2;
            const expenseBarX = centerX + barGap / 2;

            const incomeH = Math.max(3, (item.income / maxVal) * chartHeight);
            const expenseH = Math.max(3, (item.expense / maxVal) * chartHeight);

            const incomeY = paddingTop + chartHeight - incomeH;
            const expenseY = paddingTop + chartHeight - expenseH;

            const isHovered = hoveredIdx === idx;
            const isSelected = activeMonthKey === item.monthKey;

            return (
              <g
                key={item.monthKey}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onSelectMonth && onSelectMonth(item.monthKey)}
              >
                {/* Background highlight pill for active/hovered month */}
                {(isHovered || isSelected) && (
                  <rect
                    x={groupX + 4}
                    y={paddingTop - 10}
                    width={groupWidth - 8}
                    height={chartHeight + 35}
                    rx={6}
                    className={
                      isSelected
                        ? 'fill-neutral-100 dark:fill-neutral-800/80'
                        : 'fill-neutral-50 dark:fill-neutral-800/40'
                    }
                  />
                )}

                {/* Income Bar */}
                <rect
                  x={incomeBarX}
                  y={incomeY}
                  width={barWidth}
                  height={incomeH}
                  rx={3}
                  className="fill-emerald-500 hover:fill-emerald-400 transition-colors"
                  opacity={isHovered ? 1 : 0.88}
                />

                {/* Expense Bar */}
                <rect
                  x={expenseBarX}
                  y={expenseY}
                  width={barWidth}
                  height={expenseH}
                  rx={3}
                  className="fill-rose-500 hover:fill-rose-400 transition-colors"
                  opacity={isHovered ? 1 : 0.88}
                />

                {/* Month label */}
                <text
                  x={centerX}
                  y={height - 12}
                  textAnchor="middle"
                  className={`text-[11px] font-medium transition-colors ${
                    isSelected
                      ? 'fill-emerald-600 dark:fill-emerald-400 font-semibold'
                      : 'fill-neutral-600 dark:fill-neutral-400'
                  }`}
                >
                  {item.monthLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive Tooltip Card */}
      {hoveredIdx !== null && history[hoveredIdx] && (
        <div className="mt-3 p-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-lg shadow-lg text-xs flex flex-wrap items-center justify-between gap-4 transition-all animate-in fade-in">
          <div>
            <span className="font-semibold">{history[hoveredIdx].monthLabel}</span>
            <span className="text-neutral-400 dark:text-neutral-500 ml-2">
              Balance mensual
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono text-xs">
            <div>
              <span className="text-emerald-400 dark:text-emerald-600 mr-1">Ingresos:</span>
              <span>{formatCurrency(history[hoveredIdx].income, currency)}</span>
            </div>
            <div>
              <span className="text-rose-400 dark:text-rose-600 mr-1">Gastos:</span>
              <span>{formatCurrency(history[hoveredIdx].expense, currency)}</span>
            </div>
            <div>
              <span className="text-neutral-400 dark:text-neutral-500 mr-1">Neto:</span>
              <span
                className={`font-semibold ${
                  history[hoveredIdx].net >= 0
                    ? 'text-emerald-400 dark:text-emerald-600'
                    : 'text-rose-400 dark:text-rose-600'
                }`}
              >
                {formatCurrency(history[hoveredIdx].net, currency)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
