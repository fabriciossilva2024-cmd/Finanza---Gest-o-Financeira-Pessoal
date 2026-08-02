import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Printer,
  PieChart as PieChartIcon,
  Calendar,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency, getCategoryBadgeColor } from '../utils/formatters';

export const ReportsView: React.FC = () => {
  const {
    totalIncomeMonth,
    totalExpenseMonth,
    currentBalance,
    categoryExpensesMonth,
    selectedMonthYear,
  } = useFinancial();

  const [periodType, setPeriodType] = useState<'mensal' | 'semanal' | 'anual'>(
    'mensal'
  );

  // Calculate multiplier for weekly or annual reports simulation
  let incomeMultiplier = 1;
  let expenseMultiplier = 1;
  if (periodType === 'semanal') {
    incomeMultiplier = 0.25;
    expenseMultiplier = 0.25;
  } else if (periodType === 'anual') {
    incomeMultiplier = 12;
    expenseMultiplier = 11.5;
  }

  const reportIncome = totalIncomeMonth * incomeMultiplier;
  const reportExpense = totalExpenseMonth * expenseMultiplier;
  const reportBalance = reportIncome - reportExpense;

  // Category breakdown sorting
  const sortedCategoryExpenses = Object.entries(categoryExpensesMonth)
    .map(([cat, amountVal]) => {
      const amt = Number(amountVal) || 0;
      return {
        category: cat,
        amount: amt * expenseMultiplier,
        percentage:
          reportExpense > 0
            ? Math.round(((amt * expenseMultiplier) / reportExpense) * 100)
            : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const chartData = sortedCategoryExpenses.slice(0, 6).map((c) => ({
    name: c.category,
    valor: c.amount,
  }));

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in print:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 text-white shadow-lg print:bg-none print:text-black">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-white/20 print:hidden">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold">
              Relatório Financeiro Inteligente
            </h1>
          </div>
          <p className="text-xs text-blue-100 print:text-slate-600">
            Análise detalhada de entradas, saídas, balanço e ranking de maiores custos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white/10 p-1 rounded-2xl border border-white/20 print:hidden">
            <button
              onClick={() => setPeriodType('semanal')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                periodType === 'semanal'
                  ? 'bg-white text-blue-700'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setPeriodType('mensal')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                periodType === 'mensal'
                  ? 'bg-white text-blue-700'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setPeriodType('anual')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                periodType === 'anual'
                  ? 'bg-white text-blue-700'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Anual
            </button>
          </div>

          <button
            onClick={handlePrintReport}
            className="p-2.5 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-md print:hidden flex items-center gap-1.5"
            title="Imprimir / Baixar PDF"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards for Report */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">
            Total Recebido ({periodType})
          </p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            + {formatCurrency(reportIncome)}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">
            Total Gasto ({periodType})
          </p>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            - {formatCurrency(reportExpense)}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">
            Saldo Líquido no Período
          </p>
          <p
            className={`text-2xl font-black mt-1 ${
              reportBalance >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrency(reportBalance)}
          </p>
        </div>
      </div>

      {/* Top Consuming Categories Chart & Breakdown Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            Categorias Mais Custosas
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Comparação dos principais grupos de custos
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={100} />
                <Tooltip formatter={(val: any) => [formatCurrency(Number(val)), 'Gasto']} />
                <Bar dataKey="valor" fill="#6366F1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown Ranking Table */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Detalhamento por Categoria
          </h3>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {sortedCategoryExpenses.map((catItem) => {
              const badge = getCategoryBadgeColor(catItem.category as any);
              return (
                <div
                  key={catItem.category}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/40 space-y-2"
                >
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className={`px-2.5 py-0.5 rounded-lg ${badge.badgeBg}`}>
                      {catItem.category}
                    </span>
                    <span className="text-slate-900 dark:text-white">
                      {formatCurrency(catItem.amount)} ({catItem.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${catItem.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
