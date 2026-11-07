import React, { useState } from 'react';
import { Transaction, CurrencyConfig } from '../../types/finance';
import { calculateDailySpending, formatCurrency } from '../../utils/financeCalculations';

interface DailySpendingTrendChartProps {
  transactions: Transaction[];
  selectedMonth: string;
  monthlyBudget: number;
  currency: CurrencyConfig;
}

export const DailySpendingTrendChart: React.FC<DailySpendingTrendChartProps> = ({
  transactions,
  selectedMonth,
  monthlyBudget,
  currency,
}) => {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  if (selectedMonth === 'all') {
    return null; // Trend is specific to a chosen month
  }

  const dailyData = calculateDailySpending(transactions, selectedMonth);

  if (dailyData.length === 0) {
    return null;
  }

  const daysCount = dailyData.length;
  const maxCumulative = Math.max(
    ...dailyData.map((d) => d.cumulative),
    monthlyBudget > 0 ? monthlyBudget * 1.1 : 500,
    100
  );

  const width = 640;
  const height = 220;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  // Build points for SVG path
  const points = dailyData.map((d) => {
    const x = paddingLeft + ((d.day - 1) / (daysCount - 1)) * chartW;
    const y = paddingTop + chartH - (d.cumulative / maxCumulative) * chartH;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${
    paddingTop + chartH
  } L ${points[0].x} ${paddingTop + chartH} Z`;

  // Ideal budget guide line from (1, 0) to (daysCount, monthlyBudget)
  let budgetLineD = '';
  if (monthlyBudget > 0) {
    const startY = paddingTop + chartH;
    const endY = paddingTop + chartH - (monthlyBudget / maxCumulative) * chartH;
    budgetLineD = `M ${paddingLeft} ${startY} L ${paddingLeft + chartW} ${endY}`;
  }

  const hoveredPoint =
    hoveredDay !== null ? points.find((p) => p.day === hoveredDay) : null;

  return (
    <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Ritmo de Gasto Acumulado Diario
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Seguimiento de la curva de gastos día a día en el mes seleccionado
          </p>
        </div>

        {monthlyBudget > 0 && (
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-500 inline-block" />
              <span className="text-neutral-600 dark:text-neutral-400">Gasto real</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-neutral-400 border-t border-dashed border-neutral-400 inline-block" />
              <span className="text-neutral-500 dark:text-neutral-400">Guía presupuestal</span>
            </div>
          </div>
        )}
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[500px] select-none"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, maxCumulative * 0.5, maxCumulative].map((val, idx) => {
            const y = paddingTop + chartH - (val / maxCumulative) * chartH;
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
                  {Math.round(val)}
                </text>
              </g>
            );
          })}

          {/* Budget guide line */}
          {budgetLineD && (
            <path
              d={budgetLineD}
              stroke="currentColor"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              fill="none"
              className="text-neutral-400 dark:text-neutral-600"
            />
          )}

          {/* Area fill */}
          <path d={areaD} fill="url(#areaGradient)" />

          {/* Spending Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="#10b981"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Day tick marks on X axis */}
          {[1, 5, 10, 15, 20, 25, daysCount].map((day) => {
            const x = paddingLeft + ((day - 1) / (daysCount - 1)) * chartW;
            return (
              <text
                key={day}
                x={x}
                y={height - 12}
                textAnchor="middle"
                className="text-[10px] font-mono fill-neutral-400 dark:fill-neutral-500"
              >
                d{day}
              </text>
            );
          })}

          {/* Interactive hover points */}
          {points.map((p) => (
            <circle
              key={p.day}
              cx={p.x}
              cy={p.y}
              r={hoveredDay === p.day ? 5 : 3}
              fill="#10b981"
              stroke="white"
              strokeWidth={1.5}
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoveredDay(p.day)}
              onMouseLeave={() => setHoveredDay(null)}
            />
          ))}
        </svg>
      </div>

      {hoveredPoint && (
        <div className="mt-2 text-xs flex items-center justify-between bg-neutral-50 dark:bg-neutral-800/60 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800">
          <span className="font-medium text-neutral-700 dark:text-neutral-300">
            Día {hoveredPoint.day} del mes
          </span>
          <div className="flex items-center gap-4 font-mono">
            <span className="text-neutral-600 dark:text-neutral-400">
              Gasto del día:{' '}
              <strong className="text-neutral-900 dark:text-neutral-100">
                {formatCurrency(hoveredPoint.daily, currency)}
              </strong>
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              Acumulado: {formatCurrency(hoveredPoint.cumulative, currency)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
