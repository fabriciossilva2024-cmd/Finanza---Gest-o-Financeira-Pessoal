import { ExpenseCategory } from '../types';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDateBR(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return dateString;
  return `${day}/${month}/${year}`;
}

export function getDaysRemaining(deadline: string): number {
  if (!deadline) return 0;
  const target = new Date(deadline);
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

export function getCategoryBadgeColor(category: ExpenseCategory): {
  bg: string;
  text: string;
  border: string;
  badgeBg: string;
} {
  switch (category) {
    case 'Alimentação':
      return {
        bg: 'bg-amber-500/10 dark:bg-amber-500/20',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800/40',
        badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
      };
    case 'Moradia':
      return {
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800/40',
        badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      };
    case 'Transporte':
      return {
        bg: 'bg-purple-500/10 dark:bg-purple-500/20',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800/40',
        badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
      };
    case 'Saúde':
      return {
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800/40',
        badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
      };
    case 'Educação':
      return {
        bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
        text: 'text-indigo-600 dark:text-indigo-400',
        border: 'border-indigo-200 dark:border-indigo-800/40',
        badgeBg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
      };
    case 'Lazer':
      return {
        bg: 'bg-rose-500/10 dark:bg-rose-500/20',
        text: 'text-rose-600 dark:text-rose-400',
        border: 'border-rose-200 dark:border-rose-800/40',
        badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300',
      };
    case 'Cartão de crédito':
      return {
        bg: 'bg-red-500/10 dark:bg-red-500/20',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800/40',
        badgeBg: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
      };
    case 'Contas fixas':
      return {
        bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
        text: 'text-cyan-600 dark:text-cyan-400',
        border: 'border-cyan-200 dark:border-cyan-800/40',
        badgeBg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300',
      };
    case 'Assinaturas':
      return {
        bg: 'bg-violet-500/10 dark:bg-violet-500/20',
        text: 'text-violet-600 dark:text-violet-400',
        border: 'border-violet-200 dark:border-violet-800/40',
        badgeBg: 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300',
      };
    case 'Investimentos':
      return {
        bg: 'bg-teal-500/10 dark:bg-teal-500/20',
        text: 'text-teal-600 dark:text-teal-400',
        border: 'border-teal-200 dark:border-teal-800/40',
        badgeBg: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300',
      };
    default:
      return {
        bg: 'bg-slate-500/10 dark:bg-slate-500/20',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-200 dark:border-slate-800/40',
        badgeBg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
      };
  }
}
