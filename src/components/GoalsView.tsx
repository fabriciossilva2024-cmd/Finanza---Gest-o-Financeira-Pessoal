import React, { useState } from 'react';
import {
  Target,
  Plus,
  Car,
  Plane,
  Home,
  Shield,
  Coins,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit2,
  ArrowUpRight,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency, formatDateBR, getDaysRemaining } from '../utils/formatters';
import { Goal, GoalCategory } from '../types';

export const GoalsView: React.FC = () => {
  const { goals, addGoal, updateGoal, depositGoal, deleteGoal, accumulatedSavings } =
    useFinancial();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState<Goal | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('2027-12-31');
  const [category, setCategory] = useState<GoalCategory>('reserva');

  // Deposit state
  const [depositValue, setDepositValue] = useState('');

  const openNewModal = (presetCategory?: GoalCategory, presetName?: string) => {
    setEditingGoal(null);
    setName(presetName || '');
    setTargetAmount('');
    setCurrentAmount('0');
    setDeadline('2027-12-31');
    setCategory(presetCategory || 'reserva');
    setShowAddModal(true);
  };

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setCurrentAmount(goal.currentAmount.toString());
    setDeadline(goal.deadline);
    setCategory(goal.category);
    setShowAddModal(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseFloat(targetAmount);
    const currNum = parseFloat(currentAmount) || 0;

    if (!name || isNaN(targetNum) || targetNum <= 0) return;

    if (editingGoal) {
      updateGoal(editingGoal.id, {
        name,
        targetAmount: targetNum,
        currentAmount: currNum,
        deadline,
        category,
      });
    } else {
      addGoal({
        name,
        targetAmount: targetNum,
        currentAmount: currNum,
        deadline,
        category,
      });
    }

    setShowAddModal(false);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDepositModal) return;
    const val = parseFloat(depositValue);
    if (isNaN(val) || val <= 0) return;

    depositGoal(showDepositModal.id, val);
    setDepositValue('');
    setShowDepositModal(null);
  };

  const getCategoryIcon = (cat: GoalCategory) => {
    switch (cat) {
      case 'carro':
        return <Car className="w-5 h-5 text-amber-500" />;
      case 'viagem':
        return <Plane className="w-5 h-5 text-purple-500" />;
      case 'casa':
        return <Home className="w-5 h-5 text-blue-500" />;
      case 'reserva':
        return <Shield className="w-5 h-5 text-emerald-500" />;
      default:
        return <Coins className="w-5 h-5 text-teal-500" />;
    }
  };

  const totalTargetSum = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallPercentage =
    totalTargetSum > 0
      ? Math.min(100, Math.round((accumulatedSavings / totalTargetSum) * 100))
      : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-white/20">
              <Target className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold">
              Planejamento de Metas
            </h1>
          </div>
          <p className="text-xs text-indigo-100">
            Defina objetivos de curto, médio e longo prazo e acompanhe seu progresso de economia.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/20">
          <div>
            <p className="text-[11px] font-bold text-indigo-100 uppercase">
              Total Economizado
            </p>
            <p className="text-xl font-black">{formatCurrency(accumulatedSavings)}</p>
          </div>
          <button
            onClick={() => openNewModal()}
            className="px-4 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs shadow-md transition-transform hover:scale-105 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Criar Meta
          </button>
        </div>
      </div>

      {/* Overall Progress Indicator */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-100">
          <span>Progresso Geral de Todas as Metas</span>
          <span className="text-indigo-600 dark:text-indigo-400">
            {formatCurrency(accumulatedSavings)} de {formatCurrency(totalTargetSum)} ({overallPercentage}%)
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-700"
            style={{ width: `${overallPercentage}%` }}
          />
        </div>
      </div>

      {/* Templates Quick Bar */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50">
        <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-3">
          Sugestões de Metas Financeiras (Clique para criar):
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => openNewModal('reserva', 'Reserva de Emergência')}
            className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-left transition-colors flex items-center gap-2.5"
          >
            <Shield className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Reserva Emergência
              </p>
              <p className="text-[10px] text-slate-400">6 meses de custos</p>
            </div>
          </button>

          <button
            onClick={() => openNewModal('carro', 'Comprar Carro')}
            className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-500 text-left transition-colors flex items-center gap-2.5"
          >
            <Car className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Comprar Carro
              </p>
              <p className="text-[10px] text-slate-400">Veículo novo</p>
            </div>
          </button>

          <button
            onClick={() => openNewModal('viagem', 'Viagem dos Sonhos')}
            className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-500 text-left transition-colors flex items-center gap-2.5"
          >
            <Plane className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Viagem
              </p>
              <p className="text-[10px] text-slate-400">Férias em família</p>
            </div>
          </button>

          <button
            onClick={() => openNewModal('casa', 'Casa Própria')}
            className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-left transition-colors flex items-center gap-2.5"
          >
            <Home className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Casa Própria
              </p>
              <p className="text-[10px] text-slate-400">Entrada ou imóvel</p>
            </div>
          </button>
        </div>
      </div>

      {/* Goals Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const pct = Math.min(
            100,
            Math.round((goal.currentAmount / goal.targetAmount) * 100)
          );
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const daysLeft = getDaysRemaining(goal.deadline);
          const isCompleted = pct >= 100;

          return (
            <div
              key={goal.id}
              className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border transition-all ${
                isCompleted
                  ? 'border-emerald-500/50 shadow-emerald-500/10'
                  : 'border-slate-200/80 dark:border-slate-800 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0">
                    {getCategoryIcon(goal.category)}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      {goal.name}
                      {isCompleted && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Prazo: {formatDateBR(goal.deadline)} ({daysLeft} dias restantes)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(goal)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-600 dark:text-slate-300">
                    {formatCurrency(goal.currentAmount)} economizados
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">
                    {pct}%
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted
                        ? 'bg-emerald-500'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Faltam: {formatCurrency(remaining)}</span>
                  <span>Meta: {formatCurrency(goal.targetAmount)}</span>
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={() => {
                  setDepositValue('');
                  setShowDepositModal(goal);
                }}
                className="w-full py-2.5 px-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" /> Adicionar Economia / Aporte
              </button>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingGoal ? 'Editar Meta' : 'Criar Nova Meta Financeira'}
            </h3>

            <form onSubmit={handleSaveGoal} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Nome da Meta
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Viagem para Europa, Trocar de Carro"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Valor Desejado (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="10000.00"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Valor Já Economizado (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Data Limite
                  </label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as GoalCategory)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  >
                    <option value="reserva">Reserva de Emergência</option>
                    <option value="viagem">Viagem</option>
                    <option value="carro">Carro / Veículo</option>
                    <option value="casa">Casa Própria</option>
                    <option value="outro">Outro Objetivo</option>
                  </select>
                </div>
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
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md"
                >
                  Salvar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Registrar Aporte na Meta
            </h3>
            <p className="text-xs text-slate-500">
              Adicionar economia para: <strong>{showDepositModal.name}</strong>
            </p>

            <form onSubmit={handleDepositSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Valor a Depositar (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="500.00"
                  value={depositValue}
                  onChange={(e) => setDepositValue(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
                >
                  Confirmar Aporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
