import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  Search,
  Trash2,
  Edit2,
  Repeat,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency, formatDateBR } from '../utils/formatters';
import { Income, IncomeType } from '../types';

export const IncomeView: React.FC = () => {
  const { incomes, addIncome, updateIncome, deleteIncome, totalIncomeMonth } =
    useFinancial();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  // Form states
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<IncomeType>('Salário');
  const [isRecurring, setIsRecurring] = useState(false);
  const [notes, setNotes] = useState('');

  const openNewModal = () => {
    setEditingIncome(null);
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setType('Salário');
    setIsRecurring(false);
    setNotes('');
    setShowAddModal(true);
  };

  const openEditModal = (inc: Income) => {
    setEditingIncome(inc);
    setDescription(inc.description);
    setAmount(inc.amount.toString());
    setDate(inc.date);
    setType(inc.type);
    setIsRecurring(inc.isRecurring);
    setNotes(inc.notes || '');
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!description || isNaN(num) || num <= 0) return;

    if (editingIncome) {
      updateIncome(editingIncome.id, {
        description,
        amount: num,
        date,
        type,
        isRecurring,
        notes,
      });
    } else {
      addIncome({
        description,
        amount: num,
        date,
        type,
        isRecurring,
        notes,
      });
    }

    setShowAddModal(false);
  };

  const filteredIncomes = incomes.filter((inc) => {
    const matchesSearch =
      inc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inc.notes && inc.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType =
      selectedTypeFilter === 'todos' || inc.type === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  const typesList: IncomeType[] = [
    'Salário',
    'Diária',
    'Semanal',
    'Quinzenal',
    'Mensal',
    'Comissão',
    'Freelancer',
    'Outros',
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-white/20">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold">
              Gestão de Receitas
            </h1>
          </div>
          <p className="text-xs text-emerald-100">
            Cadastre salários, comissões, diárias, freelancers e entradas recorrentes.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/20">
          <div>
            <p className="text-[11px] font-bold text-emerald-100 uppercase">
              Total no Mês
            </p>
            <p className="text-xl font-black">{formatCurrency(totalIncomeMonth)}</p>
          </div>
          <button
            onClick={openNewModal}
            className="px-4 py-2.5 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-xs shadow-md transition-transform hover:scale-105 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Nova Receita
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por nome ou observação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
          />
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-500 shrink-0">
            Tipo:
          </span>
          <button
            onClick={() => setSelectedTypeFilter('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
              selectedTypeFilter === 'todos'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Todos
          </button>
          {typesList.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                selectedTypeFilter === t
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Income Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <th className="p-4 pl-6">Descrição</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Data</th>
                <th className="p-4">Recorrente</th>
                <th className="p-4">Valor</th>
                <th className="p-4 text-right pr-6">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredIncomes.length > 0 ? (
                filteredIncomes.map((inc) => (
                  <tr
                    key={inc.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-4 pl-6 font-bold text-slate-900 dark:text-white">
                      <div>
                        <p>{inc.description}</p>
                        {inc.notes && (
                          <p className="text-[11px] font-normal text-slate-400 dark:text-slate-500 truncate max-w-xs">
                            {inc.notes}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 font-bold text-[11px] border border-teal-200/50 dark:border-teal-800/40">
                        {inc.type}
                      </span>
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                      {formatDateBR(inc.date)}
                    </td>

                    <td className="p-4">
                      {inc.isRecurring ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                          <Repeat className="w-3 h-3" /> Sim
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Não</span>
                      )}
                    </td>

                    <td className="p-4 font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      + {formatCurrency(inc.amount)}
                    </td>

                    <td className="p-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(inc)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteIncome(inc.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-xs">
                    Nenhuma receita encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Income Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingIncome ? 'Editar Receita' : 'Cadastrar Nova Receita'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Nome da Receita
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Salário Mensal, Freelance, Diária"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
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
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
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
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Tipo de Receita
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as IncomeType)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                >
                  {typesList.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="recCheck"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                />
                <label
                  htmlFor="recCheck"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Receita recorrente automática (mensal/periódica)
                </label>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Observação
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Recebido via Pix, desconto do INSS..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
                >
                  Salvar Receita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
