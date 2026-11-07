import React from 'react';
import { Plus } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
  onSelectSection: (section: string) => void;
  onOpenNewTransaction: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onSelectSection,
  onOpenNewTransaction,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Resumen' },
    { id: 'charts', label: 'Gráficos Detallados' },
    { id: 'budgets', label: 'Presupuestos' },
    { id: 'transactions', label: 'Movimientos' },
    { id: 'categories', label: 'Categorías' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-14">
          {/* Zone 1: Single text wordmark */}
          <button
            type="button"
            onClick={() => onSelectSection('dashboard')}
            className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap shrink-0 hover:opacity-80 transition-opacity"
          >
            FinanzasPro
          </button>

          {/* Zone 2: 4-5 concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-600 dark:text-neutral-400">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectSection(item.id)}
                  className={`hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'text-neutral-900 dark:text-neutral-100 font-semibold border-b-2 border-emerald-600 dark:border-emerald-500 pb-0.5'
                      : ''
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenNewTransaction}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Gasto</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-start gap-4 overflow-x-auto py-2 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`whitespace-nowrap shrink-0 py-1 transition-colors ${
                  isActive
                    ? 'text-neutral-900 dark:text-neutral-100 font-semibold'
                    : 'hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
