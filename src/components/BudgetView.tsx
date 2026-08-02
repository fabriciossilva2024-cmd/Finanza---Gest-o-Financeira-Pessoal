import React, { useState } from 'react';
import {
  PieChart as PieChartIcon,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Sliders,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency, getCategoryBadgeColor } from '../utils/formatters';
import { ExpenseCategory } from '../types';

export const BudgetView: React.FC = () => {
  const { budgets, categoryExpensesMonth, setBudgetLimit } = useFinancial();

  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(
    null
  );
  const [newLimitInput, setNewLimitInput] = useState('');

  const allCategories: ExpenseCategory[] = [
    'Alimentação',
    'Moradia',
    'Transporte',
    'Saúde',
    'Educação',
    'Lazer',
    'Cartão de crédito',
    'Contas fixas',
    'Assinaturas',
    'Investimentos',
    'Outros',
  ];

  const handleOpenEdit = (cat: ExpenseCategory, currentLimit: number) => {
    setEditingCategory(cat);
    setNewLimitInput(currentLimit.toString());
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const val = parseFloat(newLimitInput);
    if (isNaN(val) || val <= 0) return;

    setBudgetLimit(editingCategory, val);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-white/20">
              <Sliders className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold">
              Orçamento Mensal por Categoria
            </h1>
          </div>
          <p className="text-xs text-teal-100">
            Defina limites máximos para cada categoria e receba alertas para evitar ultrapassar o orçamento.
          </p>
        </div>
      </div>

      {/* Grid of Budgets by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allCategories.map((cat) => {
          const budgetObj = budgets.find((b) => b.category === cat);
          const limit = budgetObj ? budgetObj.limit : 1000;
          const spent = categoryExpensesMonth[cat] || 0;
          const pct = Math.min(200, Math.round((spent / limit) * 100));

          let status: 'normal' | 'warning' | 'exceeded' = 'normal';
          if (pct >= 100) status = 'exceeded';
          else if (pct >= 80) status = 'warning';

          const catStyle = getCategoryBadgeColor(cat);

          return (
            <div
              key={cat}
              className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border transition-all ${
                status === 'exceeded'
                  ? 'border-rose-500/50 shadow-rose-500/10'
                  : status === 'warning'
                  ? 'border-amber-500/50 shadow-amber-500/10'
                  : 'border-slate-200/80 dark:border-slate-800 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-bold ${catStyle.badgeBg}`}
                  >
                    {cat}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {status === 'exceeded' && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-0.5 rounded-full border border-rose-200/50">
                      <AlertCircle className="w-3.5 h-3.5" /> Excedido!
                    </span>
                  )}
                  {status === 'warning' && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-full border border-amber-200/50">
                      <AlertTriangle className="w-3.5 h-3.5" /> Atenção!
                    </span>
                  )}
                  {status === 'normal' && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200/50">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Normal
                    </span>
                  )}

                  <button
                    onClick={() => handleOpenEdit(cat, limit)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Editar Limite"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expense Metrics */}
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(spent)}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Limite: {formatCurrency(limit)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    status === 'exceeded'
                      ? 'bg-rose-500'
                      : status === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
                <span>{pct}% utilizado</span>
                {spent > limit ? (
                  <span className="text-rose-600 font-bold">
                    Extrapolou R$ {(spent - limit).toFixed(2)}
                  </span>
                ) : (
                  <span>Restam R$ {(limit - spent).toFixed(2)}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Budget Limit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Definir Limite de Orçamento
            </h3>
            <p className="text-xs text-slate-500">
              Categoria: <strong>{editingCategory}</strong>
            </p>

            <form onSubmit={handleSaveBudget} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Limite Máximo Mensal (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="1000.00"
                  value={newLimitInput}
                  onChange={(e) => setNewLimitInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md"
                >
                  Atualizar Limite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
