import React, { useState, useEffect } from 'react';
import { Category, TransactionType, CurrencyConfig } from '../../types/finance';
import {
  AVAILABLE_ICONS,
  COLOR_PALETTE,
  getCategoryIconComponent,
} from '../../utils/categoryIcons';
import { formatCurrency } from '../../utils/financeCalculations';
import { ConfirmModal } from '../common/ConfirmModal';
import { X, Plus, Trash2, Edit3, Check, DollarSign } from 'lucide-react';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSaveCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  currency: CurrencyConfig;
  initialEditingCategoryId?: string | null;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveCategory,
  onDeleteCategory,
  currency,
  initialEditingCategoryId,
}) => {
  const [activeTab, setActiveTab] = useState<TransactionType>('expense');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states with string inputs for reliable typing and backspacing
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<TransactionType>('expense');
  const [formBudget, setFormBudget] = useState<string>('5000');
  const [formColor, setFormColor] = useState(COLOR_PALETTE[0]);
  const [formIcon, setFormIcon] = useState('Home');
  const [formError, setFormError] = useState('');

  // Confirmation modal state for deletion
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Sync edit mode when initialEditingCategoryId is provided or modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialEditingCategoryId) {
        const cat = categories.find((c) => c.id === initialEditingCategoryId);
        if (cat) {
          startEdit(cat);
          return;
        }
      }
      // If modal was opened normally without a specific target, keep list view
      setIsFormOpen(false);
      setEditingId(null);
    }
  }, [isOpen, initialEditingCategoryId]);

  if (!isOpen) return null;

  const startCreate = (type: TransactionType) => {
    setEditingId(null);
    setFormName('');
    setFormType(type);
    setFormBudget(type === 'expense' ? '5000' : '0');
    setFormColor(COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)]);
    setFormIcon(type === 'expense' ? 'ShoppingBag' : 'Briefcase');
    setFormError('');
    setIsFormOpen(true);
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setFormName(cat.name);
    setFormType(cat.type);
    setActiveTab(cat.type);
    setFormBudget(String(cat.monthlyBudget ?? 0));
    setFormColor(cat.color || COLOR_PALETTE[0]);
    setFormIcon(cat.icon || 'Layers');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Por favor ingresa un nombre para la categoría.');
      return;
    }

    const parsedBudget = parseFloat(formBudget);
    const newCategory: Category = {
      id: editingId || `cat-${Date.now()}`,
      name: formName.trim(),
      type: formType,
      monthlyBudget: isNaN(parsedBudget) ? 0 : Math.max(0, parsedBudget),
      color: formColor,
      icon: formIcon,
    };

    onSaveCategory(newCategory);
    setIsFormOpen(false);
    setEditingId(null);
  };

  const filteredCategories = categories.filter((c) => c.type === activeTab);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
        <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Configurar Categorías y Presupuestos
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Personaliza tus nombres, montos presupuestados ({currency.symbol}), iconos y colores
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Form when open */}
            {isFormOpen && (
              <form
                onSubmit={handleFormSubmit}
                className="p-5 bg-neutral-50 dark:bg-neutral-800/70 rounded-xl border-2 border-emerald-500/40 dark:border-emerald-500/30 space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-700">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    {editingId ? `Editar: "${formName || 'Categoría'}"` : 'Crear Nueva Categoría'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingId(null);
                    }}
                    className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 px-2 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  >
                    Cerrar Formulario
                  </button>
                </div>

                {formError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900 font-medium">
                    {formError}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Nombre de la Categoría
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ej. Gimnasio, Mascotas, Combustible..."
                      className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Tipo de Movimiento
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormType('expense')}
                        className={`text-xs py-2 px-3 rounded-lg font-medium border transition-colors ${
                          formType === 'expense'
                            ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 font-bold'
                            : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        Gasto
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormType('income')}
                        className={`text-xs py-2 px-3 rounded-lg font-medium border transition-colors ${
                          formType === 'income'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 font-bold'
                            : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        Ingreso
                      </button>
                    </div>
                  </div>
                </div>

                {/* Monthly Budget Input */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    {formType === 'expense'
                      ? `Límite de Presupuesto Mensual (${currency.symbol})`
                      : `Meta de Ingreso Estimado (${currency.symbol})`}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0.00"
                      value={formBudget}
                      onChange={(e) => setFormBudget(e.target.value)}
                      className="w-full text-xs font-semibold pl-9 pr-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                    Puedes escribir o borrar la cifra directamente. Se usará para calcular el cumplimiento mensual.
                  </p>
                </div>

                {/* Color Picker */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Color de la Categoría
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {COLOR_PALETTE.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormColor(color)}
                        className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center relative focus:outline-hidden hover:scale-110 ${
                          formColor === color ? 'ring-2 ring-offset-2 ring-emerald-500 scale-105' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      >
                        {formColor === color && (
                          <Check className="w-4 h-4 text-white stroke-[2.5]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icon Picker */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Icono Distintivo
                  </label>
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-36 overflow-y-auto p-2 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700">
                    {AVAILABLE_ICONS.map((item) => {
                      const Icon = item.icon;
                      const isSelected = formIcon === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFormIcon(item.id)}
                          title={item.label}
                          className={`p-2 rounded-lg flex flex-col items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 ring-2 ring-emerald-500 shadow-xs'
                              : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingId(null);
                    }}
                    className="px-3.5 py-2 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 font-medium rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-xs transition-colors"
                  >
                    {editingId ? 'Guardar Cambios' : 'Crear Categoría'}
                  </button>
                </div>
              </form>
            )}

            {/* Sub-Tabs: Gastos vs Ingresos */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveTab('expense')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    activeTab === 'expense'
                      ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  Gastos ({categories.filter((c) => c.type === 'expense').length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('income')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    activeTab === 'income'
                      ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  Ingresos ({categories.filter((c) => c.type === 'income').length})
                </button>
              </div>

              {!isFormOpen && (
                <button
                  type="button"
                  onClick={() => startCreate(activeTab)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nueva Categoría
                </button>
              )}
            </div>

            {/* Category List Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredCategories.map((cat) => {
                const IconComp = getCategoryIconComponent(cat.icon);
                const isCurrentlyEditing = editingId === cat.id && isFormOpen;

                return (
                  <div
                    key={cat.id}
                    className={`p-3.5 bg-white dark:bg-neutral-900 border rounded-xl flex items-center justify-between gap-3 transition-all ${
                      isCurrentlyEditing
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                      onClick={() => startEdit(cat)}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white shadow-xs"
                        style={{ backgroundColor: cat.color }}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                          {cat.name}
                        </p>
                        <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                          {cat.type === 'expense'
                            ? `Presupuesto: ${formatCurrency(cat.monthlyBudget || 0, currency)}/mes`
                            : `Meta: ${formatCurrency(cat.monthlyBudget || 0, currency)}/mes`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(cat)}
                        title="Editar categoría y presupuesto"
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCategoryToDelete(cat)}
                        title="Eliminar categoría"
                        className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3.5 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Total {filteredCategories.length} categorías en {activeTab === 'expense' ? 'Gastos' : 'Ingresos'}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-lg hover:opacity-90 transition-opacity"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Internal In-App Confirm Dialog */}
      <ConfirmModal
        isOpen={Boolean(categoryToDelete)}
        title="¿Eliminar categoría?"
        message={`¿Seguro que deseas eliminar "${categoryToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar Categoría"
        cancelLabel="Cancelar"
        isDestructive={true}
        onConfirm={() => {
          if (categoryToDelete) {
            onDeleteCategory(categoryToDelete.id);
            setCategoryToDelete(null);
          }
        }}
        onCancel={() => setCategoryToDelete(null)}
      />
    </>
  );
};
