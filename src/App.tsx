import React, { useState, useEffect, useMemo } from 'react';
import {
  Transaction,
  Category,
  CurrencyConfig,
} from './types/finance';
import {
  INITIAL_CATEGORIES,
  INITIAL_TRANSACTIONS,
  DEFAULT_CURRENCIES,
} from './data/initialData';
import {
  calculateMonthlyStats,
  calculateCategoryBreakdown,
  calculateMonthlyHistory,
  getAvailableMonths,
  exportToCSV,
  formatMonthLabel,
} from './utils/financeCalculations';
import { Navbar } from './components/layout/Navbar';
import { FinancialSummaryCards } from './components/analytics/FinancialSummaryCards';
import { MonthlyFilterBar } from './components/analytics/MonthlyFilterBar';
import { CategoryDonutChart } from './components/charts/CategoryDonutChart';
import { MonthlyEvolutionBarChart } from './components/charts/MonthlyEvolutionBarChart';
import { BudgetProgressChart } from './components/charts/BudgetProgressChart';
import { DailySpendingTrendChart } from './components/charts/DailySpendingTrendChart';
import { TransactionList } from './components/transactions/TransactionList';
import { TransactionModal } from './components/transactions/TransactionModal';
import { CategoryManagerModal } from './components/categories/CategoryManagerModal';
import { ConfirmModal } from './components/common/ConfirmModal';
import {
  PieChart,
  BarChart3,
  SlidersHorizontal,
  Plus,
} from 'lucide-react';

const STORAGE_KEY_TRANSACTIONS = 'finanzaspro_transactions_v2';
const STORAGE_KEY_CATEGORIES = 'finanzaspro_categories_v2';
const STORAGE_KEY_CURRENCY = 'finanzaspro_currency_v2';
const STORAGE_KEY_DARKMODE = 'finanzaspro_darkmode_v2';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_DARKMODE);
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Sync theme with document.documentElement
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY_DARKMODE, String(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Main data states with local persistence
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_CATEGORIES;
      }
    }
    return INITIAL_CATEGORIES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_TRANSACTIONS;
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [currency, setCurrency] = useState<CurrencyConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CURRENCY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.code === 'EUR') {
          return DEFAULT_CURRENCIES[0]; // DOP by default
        }
        return parsed;
      } catch {
        return DEFAULT_CURRENCIES[0];
      }
    }
    return DEFAULT_CURRENCIES[0];
  });

  // Save to localStorage on state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CURRENCY, JSON.stringify(currency));
  }, [currency]);

  // Available months
  const availableMonths = useMemo(() => {
    return getAvailableMonths(transactions);
  }, [transactions]);

  // Selected period state (default to latest available month)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const months = getAvailableMonths(INITIAL_TRANSACTIONS);
    return months[0] || '2026-11';
  });

  // Category filter selection for drill-down
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  // Navigation section: 'dashboard' | 'charts' | 'budgets' | 'transactions' | 'categories'
  const [activeSection, setActiveSection] = useState('dashboard');

  // Modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  // In-app confirm modal for reset
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Computed statistics
  const monthlyStats = useMemo(() => {
    return calculateMonthlyStats(transactions, categories, selectedMonth);
  }, [transactions, categories, selectedMonth]);

  const categoryBreakdown = useMemo(() => {
    return calculateCategoryBreakdown(transactions, categories, selectedMonth);
  }, [transactions, categories, selectedMonth]);

  const monthlyHistory = useMemo(() => {
    return calculateMonthlyHistory(transactions, 6);
  }, [transactions]);

  // Transaction handlers
  const handleSaveTransaction = (tx: Transaction) => {
    setTransactions((prev) => {
      const exists = prev.some((t) => t.id === tx.id);
      if (exists) {
        return prev.map((t) => (t.id === tx.id ? tx : t));
      }
      return [tx, ...prev];
    });
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleOpenNewTransaction = () => {
    setEditingTransaction(null);
    setIsTransactionModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsTransactionModalOpen(true);
  };

  // Category handlers
  const handleSaveCategory = (cat: Category) => {
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === cat.id);
      if (exists) {
        return prev.map((c) => (c.id === cat.id ? cat : c));
      }
      return [...prev, cat];
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId(null);
    }
  };

  const handleEditCategoryFromChart = (catId: string) => {
    setEditingCategoryId(catId);
    setIsCategoryModalOpen(true);
  };

  const handleQuickUpdateBudget = (categoryId: string, newBudget: number) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId ? { ...c, monthlyBudget: newBudget } : c
      )
    );
  };

  // Reset to initial demo data
  const handleConfirmReset = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setCategories(INITIAL_CATEGORIES);
    setCurrency(DEFAULT_CURRENCIES[0]);
    setSelectedCategoryId(null);
    setIsResetConfirmOpen(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors">
      {/* Top Navbar */}
      <Navbar
        activeSection={activeSection}
        onSelectSection={(sec) => {
          setActiveSection(sec);
          if (sec === 'categories') {
            setEditingCategoryId(null);
            setIsCategoryModalOpen(true);
          }
        }}
        onOpenNewTransaction={handleOpenNewTransaction}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col gap-6">
        {/* Welcome & Period Filter Bar */}
        <div className="flex flex-col gap-1">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Panel Financiero Personal
            </h1>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              <span>Período activo: </span>
              <strong className="text-neutral-900 dark:text-neutral-100 font-semibold">
                {selectedMonth === 'all'
                  ? 'Histórico Completo'
                  : formatMonthLabel(selectedMonth)}
              </strong>
            </div>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Control de gastos mensuales con categorías configurables y gráficos detallados
          </p>
        </div>

        {/* Global Toolbar Filter */}
        <MonthlyFilterBar
          availableMonths={availableMonths}
          selectedMonth={selectedMonth}
          onSelectMonth={setSelectedMonth}
          currency={currency}
          onSelectCurrency={setCurrency}
          onOpenCategories={() => {
            setEditingCategoryId(null);
            setIsCategoryModalOpen(true);
          }}
          onOpenNewTransaction={handleOpenNewTransaction}
          onExportCSV={() => exportToCSV(transactions, categories, currency)}
          onResetData={() => setIsResetConfirmOpen(true)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          categoryCount={categories.length}
        />

        {/* Quick Section View Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-200/60 dark:bg-neutral-800/60 rounded-xl self-start overflow-x-auto max-w-full text-xs">
          <button
            type="button"
            onClick={() => setActiveSection('dashboard')}
            className={`px-3.5 py-1.5 font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeSection === 'dashboard'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            Vista General
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('budgets')}
            className={`px-3.5 py-1.5 font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeSection === 'budgets'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            Presupuestos y Categorías
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('charts')}
            className={`px-3.5 py-1.5 font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeSection === 'charts'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            Gráficos Detallados
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('transactions')}
            className={`px-3.5 py-1.5 font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeSection === 'transactions'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            Movimientos ({transactions.length})
          </button>
        </div>

        {/* KPI Financial Summary Cards (Always visible on dashboard or charts) */}
        {(activeSection === 'dashboard' || activeSection === 'charts' || activeSection === 'budgets') && (
          <FinancialSummaryCards stats={monthlyStats} currency={currency} />
        )}

        {/* Detailed Charts Section */}
        {(activeSection === 'dashboard' || activeSection === 'charts') && (
          <section id="charts" className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  <PieChart className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Análisis Gráfico Detallado
                </h2>
              </div>
              {selectedCategoryId && (
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId(null)}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                >
                  Quitar filtro de categoría
                </button>
              )}
            </div>

            {/* Row 1: Donut Distribution + Monthly Bar Evolution */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 flex flex-col">
                <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center justify-between">
                  <span>Distribución de Gastos por Categoría</span>
                  <span className="text-[11px] text-neutral-400 font-normal">
                    Toca un arco para filtrar
                  </span>
                </div>
                <CategoryDonutChart
                  breakdown={categoryBreakdown}
                  currency={currency}
                  totalExpense={monthlyStats.totalExpense}
                  onSelectCategory={setSelectedCategoryId}
                  selectedCategoryId={selectedCategoryId}
                />
              </div>

              <div className="lg:col-span-6 flex flex-col">
                <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center justify-between">
                  <span>Evolución Histórica de Flujos</span>
                  <span className="text-[11px] text-neutral-400 font-normal">
                    Selecciona un mes para ver su detalle
                  </span>
                </div>
                <MonthlyEvolutionBarChart
                  history={monthlyHistory}
                  currency={currency}
                  onSelectMonth={setSelectedMonth}
                  activeMonthKey={selectedMonth}
                />
              </div>
            </div>

            {/* Row 2: Daily Spending Pace Curve (when specific month selected) */}
            {selectedMonth !== 'all' && (
              <DailySpendingTrendChart
                transactions={transactions}
                selectedMonth={selectedMonth}
                monthlyBudget={monthlyStats.totalBudget}
                currency={currency}
              />
            )}
          </section>
        )}

        {/* Category Budget Limits Progress & Customization */}
        {(activeSection === 'dashboard' || activeSection === 'budgets' || activeSection === 'categories') && (
          <section id="budgets" className="flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    Configuración de Categorías & Límites Mensuales
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Puedes ajustar el presupuesto de cada categoría directamente con el icono de lápiz o hacer clic en "Configurar"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategoryId(null);
                    setIsCategoryModalOpen(true);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors inline-flex items-center gap-1.5"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Gestionar Todas las Categorías</span>
                </button>
              </div>
            </div>

            <BudgetProgressChart
              breakdown={categoryBreakdown}
              currency={currency}
              onEditCategory={handleEditCategoryFromChart}
              onQuickUpdateBudget={handleQuickUpdateBudget}
              onOpenCreateCategory={() => {
                setEditingCategoryId(null);
                setIsCategoryModalOpen(true);
              }}
            />
          </section>
        )}

        {/* Transactions Table Section */}
        {(activeSection === 'dashboard' || activeSection === 'transactions') && (
          <section id="transactions" className="flex flex-col gap-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Registro de Movimientos (Ingresos y Gastos)
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Haz clic en "Editar" sobre cualquier fila para modificar monto, fecha o categoría
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenNewTransaction}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-xs transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Movimiento</span>
              </button>
            </div>

            <TransactionList
              transactions={
                selectedMonth === 'all'
                  ? transactions
                  : transactions.filter((t) => t.date.startsWith(selectedMonth))
              }
              categories={categories}
              currency={currency}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
              onAddNew={handleOpenNewTransaction}
              selectedCategoryId={selectedCategoryId}
              onClearCategoryFilter={() => setSelectedCategoryId(null)}
            />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-6 mt-12 bg-white dark:bg-neutral-900 text-xs text-neutral-500 dark:text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-800 dark:text-neutral-200">
              FinanzasPro
            </span>
            <span>· Control financiero y presupuestos en Pesos Dominicanos (RD$)</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setEditingCategoryId(null);
                setIsCategoryModalOpen(true);
              }}
              className="hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
            >
              Configurar Categorías
            </button>
            <button
              type="button"
              onClick={() => exportToCSV(transactions, categories, currency)}
              className="hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
            >
              Descargar CSV
            </button>
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
            >
              Restaurar Demostración
            </button>
          </div>
        </div>
      </footer>

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategoryId(null);
        }}
        categories={categories}
        onSaveCategory={handleSaveCategory}
        onDeleteCategory={handleDeleteCategory}
        currency={currency}
        initialEditingCategoryId={editingCategoryId}
      />

      {/* Transaction Add / Edit Modal */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        categories={categories}
        currency={currency}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        defaultMonth={selectedMonth}
      />

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="¿Restablecer datos de muestra?"
        message="¿Deseas restaurar todos los datos iniciales de demostración en RD$? Se borrarán las transacciones y categorías creadas manualmente."
        confirmLabel="Restablecer Datos"
        cancelLabel="Cancelar"
        isDestructive={true}
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
}
