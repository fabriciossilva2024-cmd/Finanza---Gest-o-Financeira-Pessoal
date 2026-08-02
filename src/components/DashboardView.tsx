import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ShieldCheck,
  Target,
  ChevronRight,
  Zap,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency, formatDateBR, getCategoryBadgeColor } from '../utils/formatters';
import { ExpenseCategory, IncomeType, ExpenseType } from '../types';

const COLORS = [
  '#10B981', // emerald
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#F59E0B', // amber
  '#EF4444', // red
  '#06B6D4', // cyan
  '#EC4899', // pink
  '#14B8A6', // teal
  '#6366F1', // indigo
];

export const DashboardView: React.FC = () => {
  const {
    currentBalance,
    totalIncomeMonth,
    totalExpenseMonth,
    accumulatedSavings,
    savingsRatePercentage,
    projectedFutureBalance,
    categoryExpensesMonth,
    expenses,
    incomes,
    goals,
    aiInsights,
    setActiveTab,
    addIncome,
    addExpense,
    selectedMonthYear,
  } = useFinancial();

  const [showQuickModal, setShowQuickModal] = useState<'income' | 'expense' | null>(null);

  // Form states for Quick Add
  const [desc, setDesc] = useState('');
  const [val, setVal] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Alimentação');
  const [incType, setIncType] = useState<IncomeType>('Salário');
  const [expType, setExpType] = useState<ExpenseType>('Despesa variável');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const handleSaveQuick = (e: React.FormEvent) => {
    e.preventDefault();
    const numVal = parseFloat(val);
    if (!desc || isNaN(numVal) || numVal <= 0) return;

    if (showQuickModal === 'income') {
      addIncome({
        description: desc,
        amount: numVal,
        date,
        type: incType,
        isRecurring: false,
      });
    } else {
      addExpense({
        description: desc,
        amount: numVal,
        date,
        category,
        type: expType,
      });
    }

    setDesc('');
    setVal('');
    setShowQuickModal(null);
  };

  // 1. Data for Pie Chart (Expenses distribution)
  const pieData = Object.entries(categoryExpensesMonth).map(([name, value]) => ({
    name,
    value,
  }));

  // 2. Data for Bar Chart (Receitas x Despesas por mês)
  const monthlyBarData = [
    { mes: 'Mai', receitas: 8200, despesas: 6100 },
    { mes: 'Jun', receitas: 9700, despesas: 6400 },
    { mes: 'Jul (Atual)', receitas: totalIncomeMonth, despesas: totalExpenseMonth },
  ];

  // 3. Data for Line / Area Chart (Evolução financeira acumulada)
  const areaData = [
    { dia: '01/Jul', saldo: currentBalance - (totalIncomeMonth - totalExpenseMonth) },
    { dia: '08/Jul', saldo: currentBalance - (totalIncomeMonth - totalExpenseMonth) * 0.7 },
    { dia: '15/Jul', saldo: currentBalance - (totalIncomeMonth - totalExpenseMonth) * 0.4 },
    { dia: '22/Jul', saldo: currentBalance - (totalIncomeMonth - totalExpenseMonth) * 0.2 },
    { dia: 'Hoje', saldo: currentBalance },
    { dia: 'Projeção', saldo: projectedFutureBalance },
  ];

  // Recent combined transactions
  const recentIncomes = incomes.slice(0, 3).map((i) => ({ ...i, kind: 'receita' as const }));
  const recentExpenses = expenses.slice(0, 4).map((e) => ({ ...e, kind: 'despesa' as const }));
  const combinedRecent = [...recentIncomes, ...recentExpenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Welcome Banner & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 dark:from-slate-900 dark:via-emerald-950 dark:to-slate-900 p-6 rounded-3xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold uppercase tracking-wider border border-emerald-500/30">
              Visão Geral Finanza
            </span>
            <span className="text-xs text-slate-300 font-medium">
              Mês: {selectedMonthYear}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Seu Painel Financeiro
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Acompanhe suas receitas, controle seus gastos por categoria e mantenha suas metas no caminho certo.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setShowQuickModal('income')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Nova Receita
          </button>
          <button
            onClick={() => setShowQuickModal('expense')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-rose-500/90 hover:bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-500/25 transition-transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Nova Despesa
          </button>
        </div>
      </div>

      {/* AI Quick Insight Banner */}
      {aiInsights.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/30 flex items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500 text-white shrink-0 shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                Finanza IA Insights
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-0.5">
                {aiInsights[0]}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('assistente_ia')}
            className="hidden sm:flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0"
          >
            Análise Completa <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 5 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Saldo Atual */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Saldo Atual
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(currentBalance)}
          </p>
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
            <ArrowUpRight className="w-4 h-4" />
            <span>Conta principal ativa</span>
          </div>
        </div>

        {/* Card 2: Receitas do Mês */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Receitas no Mês
            </span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalIncomeMonth)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-2">
            {incomes.length} lançamentos de entrada
          </p>
        </div>

        {/* Card 3: Despesas do Mês */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Despesas no Mês
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
            {formatCurrency(totalExpenseMonth)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-2">
            {expenses.length} saídas registradas
          </p>
        </div>

        {/* Card 4: Economia Acumulada */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Economia Acumulada
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(accumulatedSavings)}
          </p>
          <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-2">
            <Target className="w-4 h-4" />
            <span>{goals.length} metas em andamento</span>
          </div>
        </div>

        {/* Card 5: Previsão Futura */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Previsão de Saldo
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(projectedFutureBalance)}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-2">
            Taxa de Economia: {savingsRatePercentage}%
          </p>
        </div>
      </div>

      {/* 4 Indicators Panel */}
      <div className="p-5 rounded-3xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
            Gasto Total no Mês
          </p>
          <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalExpenseMonth)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
            Economia Líquida
          </p>
          <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(Math.max(0, totalIncomeMonth - totalExpenseMonth))}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
            % Economizado
          </p>
          <p className="text-lg font-extrabold text-teal-600 dark:text-teal-400 mt-1">
            {savingsRatePercentage}% da receita
          </p>
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
            Status Financeiro
          </p>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mt-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Saudável
          </span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Donut/Pie Chart - Distribuição de Despesas */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Distribuição de Despesas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Gastos divididos por categoria neste mês
            </p>
          </div>

          <div className="h-64 w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val)), 'Valor']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Nenhuma despesa no período
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Bar Chart - Receitas vs Despesas */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Receitas x Despesas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Comparação dos últimos meses em R$
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyBarData}>
                <XAxis dataKey="mes" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip formatter={(val: any) => [formatCurrency(Number(val)), '']} />
                <Bar dataKey="receitas" fill="#10B981" radius={[6, 6, 0, 0]} name="Receitas" />
                <Bar dataKey="despesas" fill="#F43F5E" radius={[6, 6, 0, 0]} name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Line/Area Chart - Evolução Financeira */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Evolução Financeira
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Trajetória do saldo acumulado no tempo
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="dia" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip formatter={(val: any) => [formatCurrency(Number(val)), 'Saldo']} />
                <Area
                  type="monotone"
                  dataKey="saldo"
                  stroke="#10B981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSaldo)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section: Goals Progress & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metas Destaque */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Metas Financeiras
            </h3>
            <button
              onClick={() => setActiveTab('metas')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Ver Todas
            </button>
          </div>

          <div className="space-y-4">
            {goals.slice(0, 3).map((goal) => {
              const pct = Math.min(
                100,
                Math.round((goal.currentAmount / goal.targetAmount) * 100)
              );
              return (
                <div
                  key={goal.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 space-y-2"
                >
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                      {goal.name}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{formatCurrency(goal.currentAmount)}</span>
                    <span>Alvo: {formatCurrency(goal.targetAmount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Histórico Recente de Lançamentos */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Lançamentos Recentes
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('receitas')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Receitas
              </button>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <button
                onClick={() => setActiveTab('despesas')}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
              >
                Despesas
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {combinedRecent.map((item) => {
              const isIncome = item.kind === 'receita';
              const catBadge = !isIncome
                ? getCategoryBadgeColor((item as any).category)
                : null;

              return (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isIncome
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {formatDateBR(item.date)}
                        </span>
                        {catBadge && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${catBadge.badgeBg}`}
                          >
                            {(item as any).category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-sm font-extrabold ${
                      isIncome
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isIncome ? '+' : '-'} {formatCurrency(item.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Add Modal */}
      {showQuickModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {showQuickModal === 'income' ? 'Adicionar Receita' : 'Adicionar Despesa'}
            </h3>

            <form onSubmit={handleSaveQuick} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Salário, Mercado, Pix"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
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

              {showQuickModal === 'income' ? (
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Tipo de Receita
                  </label>
                  <select
                    value={incType}
                    onChange={(e) => setIncType(e.target.value as IncomeType)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  >
                    {[
                      'Salário',
                      'Diária',
                      'Semanal',
                      'Quinzenal',
                      'Mensal',
                      'Comissão',
                      'Freelancer',
                      'Outros',
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Categoria
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                    >
                      {[
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
                      ].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Tipo de Despesa
                    </label>
                    <select
                      value={expType}
                      onChange={(e) => setExpType(e.target.value as ExpenseType)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                    >
                      <option value="Despesa fixa">Despesa fixa</option>
                      <option value="Despesa variável">Despesa variável</option>
                      <option value="Despesa recorrente">Despesa recorrente</option>
                    </select>
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
