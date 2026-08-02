import React, { useState } from 'react';
import {
  TrendingDown,
  Plus,
  Search,
  Trash2,
  Edit2,
  Tag,
  CreditCard,
  Calendar,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency, formatDateBR, getCategoryBadgeColor } from '../utils/formatters';
import { Expense, ExpenseCategory, ExpenseType } from '../types';

export const ExpenseView: React.FC = () => {
  const { expenses, addExpense, updateExpense, deleteExpense, totalExpenseMonth } =
    useFinancial();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>('todas');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('todos');

  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Form states
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory>('Alimentação');
  const [type, setType] = useState<ExpenseType>('Despesa variável');
  const [notes, setNotes] = useState('');

  const openNewModal = () => {
    setEditingExpense(null);
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('Alimentação');
    setType('Despesa variável');
    setNotes('');
    setShowModal(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setDescription(exp.description);
    setAmount(exp.amount.toString());
    setDate(exp.date);
    setCategory(exp.category);
    setType(exp.type);
    setNotes(exp.notes || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!description || isNaN(num) || num <= 0) return;

    if (editingExpense) {
      updateExpense(editingExpense.id, {
        description,
        amount: num,
        date,
        category,
        type,
        notes,
      });
    } else {
      addExpense({
        description,
        amount: num,
        date,
        category,
        type,
        notes,
      });
    }

    setShowModal(false);
  };

  const categoriesList: ExpenseCategory[] = [
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

  const typesList: ExpenseType[] = [
    'Despesa fixa',
    'Despesa variável',
    'Despesa recorrente',
  ];

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exp.notes && exp.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      selectedCategoryFilter === 'todas' || exp.category === selectedCategoryFilter;
    const matchesType =
      selectedTypeFilter === 'todos' || exp.type === selectedTypeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-white/20">
              <TrendingDown className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold">
              Gestão de Despesas
            </h1>
          </div>
          <p className="text-xs text-rose-100">
            Controle seus gastos com categorias personalizadas, contas fixas, assinaturas e variáveis.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/20">
          <div>
            <p className="text-[11px] font-bold text-rose-100 uppercase">
              Total no Mês
            </p>
            <p className="text-xl font-black">{formatCurrency(totalExpenseMonth)}</p>
          </div>
          <button
            onClick={openNewModal}
            className="px-4 py-2.5 rounded-xl bg-white text-rose-700 hover:bg-rose-50 font-bold text-xs shadow-md transition-transform hover:scale-105 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Nova Despesa
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por descrição ou observação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
            />
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 shrink-0">
              Tipo:
            </span>
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold outline-none focus:ring-2 focus:ring-rose-500 dark:text-white cursor-pointer"
            >
              <option value="todos">Todos os Tipos</option>
              {typesList.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800 pb-1">
          <span className="text-xs font-bold text-slate-500 shrink-0 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" /> Categoria:
          </span>
          <button
            onClick={() => setSelectedCategoryFilter('todas')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
              selectedCategoryFilter === 'todas'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Todas
          </button>
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                selectedCategoryFilter === cat
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <th className="p-4 pl-6">Descrição</th>
                <th className="p-4">Categoria</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Data</th>
                <th className="p-4">Valor</th>
                <th className="p-4 text-right pr-6">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((exp) => {
                  const badge = getCategoryBadgeColor(exp.category);

                  return (
                    <tr
                      key={exp.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-4 pl-6 font-bold text-slate-900 dark:text-white">
                        <div>
                          <p>{exp.description}</p>
                          {exp.notes && (
                            <p className="text-[11px] font-normal text-slate-400 dark:text-slate-500 truncate max-w-xs">
                              {exp.notes}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${badge.badgeBg}`}
                        >
                          {exp.category}
                        </span>
                      </td>

                      <td className="p-4 font-medium text-slate-600 dark:text-slate-300">
                        {exp.type}
                      </td>

                      <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                        {formatDateBR(exp.date)}
                      </td>

                      <td className="p-4 font-black text-rose-600 dark:text-rose-400 text-sm">
                        - {formatCurrency(exp.amount)}
                      </td>

                      <td className="p-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(exp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteExpense(exp.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-xs">
                    Nenhuma despesa encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingExpense ? 'Editar Despesa' : 'Cadastrar Nova Despesa'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Nome da Despesa
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Supermercado, Aluguel, Uber"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
                  >
                    {categoriesList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Tipo
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ExpenseType)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
                  >
                    {typesList.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Observação
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Pagamento no cartão de crédito em 2x..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md"
                >
                  Salvar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
