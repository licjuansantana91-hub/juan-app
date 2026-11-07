import React, { useState } from 'react';
import { Transaction, Category, CurrencyConfig, TransactionType } from '../../types/finance';
import { formatCurrency, formatFullDate } from '../../utils/financeCalculations';
import { getCategoryIconComponent } from '../../utils/categoryIcons';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  RotateCw,
  Plus,
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  currency: CurrencyConfig;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  selectedCategoryId?: string | null;
  onClearCategoryFilter?: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  currency,
  onEdit,
  onDelete,
  onAddNew,
  selectedCategoryId,
  onClearCategoryFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterCategory, setFilterCategory] = useState<string>(
    selectedCategoryId || 'all'
  );
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

  // Deletion state for in-app confirmation modal
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // Sync with prop if it changes
  React.useEffect(() => {
    if (selectedCategoryId) {
      setFilterCategory(selectedCategoryId);
    }
  }, [selectedCategoryId]);

  const filtered = transactions.filter((tx) => {
    // Type filter
    if (filterType !== 'all' && tx.type !== filterType) {
      return false;
    }

    // Category filter
    if (filterCategory !== 'all' && tx.categoryId !== filterCategory) {
      return false;
    }

    // Search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const catName = categoryMap.get(tx.categoryId)?.name.toLowerCase() || '';
      const notes = (tx.notes || '').toLowerCase();
      const title = tx.title.toLowerCase();

      return (
        title.includes(term) || catName.includes(term) || notes.includes(term)
      );
    }

    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'date') {
      const cmp = a.date.localeCompare(b.date);
      return sortDirection === 'desc' ? -cmp : cmp;
    } else {
      const cmp = a.amount - b.amount;
      return sortDirection === 'desc' ? -cmp : cmp;
    }
  });

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard className="w-3.5 h-3.5" />;
      case 'cash':
        return <Banknote className="w-3.5 h-3.5" />;
      case 'transfer':
        return <ArrowRightLeft className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden flex flex-col shadow-xs">
        {/* List Toolbar */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
            {/* Search box */}
            <div className="relative flex-1 max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Buscar por concepto o notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Type filter button group */}
            <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 font-semibold rounded-md transition-colors whitespace-nowrap ${
                  filterType === 'all'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                Todos ({transactions.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('expense')}
                className={`px-2.5 py-1 font-semibold rounded-md transition-colors whitespace-nowrap ${
                  filterType === 'expense'
                    ? 'bg-white dark:bg-neutral-900 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                Gastos
              </button>
              <button
                type="button"
                onClick={() => setFilterType('income')}
                className={`px-2.5 py-1 font-semibold rounded-md transition-colors whitespace-nowrap ${
                  filterType === 'income'
                    ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                Ingresos
              </button>
            </div>
          </div>

          {/* Category selector & Add button */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  if (e.target.value === 'all' && onClearCategoryFilter) {
                    onClearCategoryFilter();
                  }
                }}
                className="text-xs py-2 pl-3 pr-8 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type === 'expense' ? 'Gasto' : 'Ingreso'})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={onAddNew}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              Nuevo Movimiento
            </button>
          </div>
        </div>

        {/* Table view */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/30 text-neutral-500 dark:text-neutral-400 font-semibold">
                <th className="py-3 px-4 w-32">
                  <button
                    type="button"
                    onClick={() => toggleSort('date')}
                    className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                  >
                    <span>Fecha</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">Concepto / Categoría</th>
                <th className="py-3 px-4 w-32">Método</th>
                <th className="py-3 px-4 text-right w-40">
                  <button
                    type="button"
                    onClick={() => toggleSort('amount')}
                    className="flex items-center gap-1 ml-auto hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                  >
                    <span>Monto</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 text-right w-32">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {sorted.map((tx) => {
                const cat = categoryMap.get(tx.categoryId);
                const IconComp = cat ? getCategoryIconComponent(cat.icon) : Filter;
                const isExpense = tx.type === 'expense';

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-3 px-4 font-mono text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                      {formatFullDate(tx.date)}
                    </td>

                    {/* Title & Category Badge */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-white shadow-xs"
                          style={{ backgroundColor: cat?.color || '#64748b' }}
                        >
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                              {tx.title}
                            </span>
                            {tx.isRecurring && (
                              <span
                                title="Gasto recurrente programado"
                                className="text-neutral-400"
                              >
                                <RotateCw className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                            <span>{cat?.name || 'Sin categoría'}</span>
                            {tx.notes && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="italic truncate max-w-xs">
                                  {tx.notes}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Payment method */}
                    <td className="py-3 px-4 whitespace-nowrap text-neutral-600 dark:text-neutral-400">
                      <div className="flex items-center gap-1.5 capitalize">
                        {getPaymentIcon(tx.paymentMethod)}
                        <span>
                          {tx.paymentMethod === 'card'
                            ? 'Tarjeta'
                            : tx.paymentMethod === 'cash'
                            ? 'Efectivo'
                            : tx.paymentMethod === 'transfer'
                            ? 'Transferencia'
                            : 'Otro'}
                        </span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap text-sm">
                      <span
                        className={
                          isExpense
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }
                      >
                        {isExpense ? '-' : '+'}
                        {formatCurrency(tx.amount, currency)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEdit(tx)}
                          title="Editar este movimiento"
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTxToDelete(tx)}
                          title="Eliminar movimiento"
                          className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {sorted.length === 0 && (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3 text-neutral-400">
              <Filter className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              No se encontraron movimientos
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
              {searchTerm || filterType !== 'all' || filterCategory !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda o categoría.'
                : 'Empieza registrando tu primer ingreso o gasto.'}
            </p>
            <button
              type="button"
              onClick={onAddNew}
              className="mt-4 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Registrar Movimiento
            </button>
          </div>
        )}

        {/* Footer count & info */}
        <div className="p-3 bg-neutral-50/70 dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <span>
            Mostrando {sorted.length} de {transactions.length} registros
          </span>
          {filterCategory !== 'all' && (
            <button
              type="button"
              onClick={() => {
                setFilterCategory('all');
                if (onClearCategoryFilter) onClearCategoryFilter();
              }}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              Quitar filtro de categoría
            </button>
          )}
        </div>
      </div>

      {/* In-app Deletion Confirmation */}
      <ConfirmModal
        isOpen={Boolean(txToDelete)}
        title="¿Eliminar movimiento?"
        message={`¿Estás seguro de que deseas eliminar "${txToDelete?.title}" por ${
          txToDelete ? formatCurrency(txToDelete.amount, currency) : ''
        }?`}
        confirmLabel="Eliminar Movimiento"
        cancelLabel="Cancelar"
        isDestructive={true}
        onConfirm={() => {
          if (txToDelete) {
            onDelete(txToDelete.id);
            setTxToDelete(null);
          }
        }}
        onCancel={() => setTxToDelete(null)}
      />
    </>
  );
};
