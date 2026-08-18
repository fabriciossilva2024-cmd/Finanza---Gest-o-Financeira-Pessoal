import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  User,
  Income,
  Expense,
  Goal,
  Budget,
  NotificationItem,
  IncomeType,
  ExpenseCategory,
  ExpenseType,
  GoalCategory,
} from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const SUPABASE_URL = supabaseUrl || 'não configurado';

export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// ---- DB Row types (snake_case) ----
export interface UserRow {
  id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
  monthly_income_goal: number | null;
}

export interface IncomeRow {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  type: string;
  date: string;
  is_recurring: boolean;
  notes: string | null;
}

export interface ExpenseRow {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category: string;
  type: string;
  date: string;
  notes: string | null;
}

export interface GoalRow {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  category: string;
}

export interface BudgetRow {
  id: string;
  user_id: string;
  category: string;
  monthly_limit: number;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  message: string;
  date: string;
  type: string;
  read: boolean;
}

// ---- Mappers: DB row -> app model ----
export const toUser = (r: UserRow): User => ({
  id: r.id,
  name: r.name,
  email: r.email ?? '',
  avatarUrl: r.avatar_url ?? undefined,
  monthlyIncomeGoal: r.monthly_income_goal ?? undefined,
});

export const toIncome = (r: IncomeRow): Income => ({
  id: r.id,
  userId: r.user_id,
  description: r.description,
  amount: Number(r.amount),
  type: r.type as IncomeType,
  date: r.date,
  isRecurring: r.is_recurring,
  notes: r.notes ?? undefined,
});

export const toExpense = (r: ExpenseRow): Expense => ({
  id: r.id,
  userId: r.user_id,
  description: r.description,
  amount: Number(r.amount),
  category: r.category as ExpenseCategory,
  type: r.type as ExpenseType,
  date: r.date,
  notes: r.notes ?? undefined,
});

export const toGoal = (r: GoalRow): Goal => ({
  id: r.id,
  userId: r.user_id,
  name: r.name,
  targetAmount: Number(r.target_amount),
  currentAmount: Number(r.current_amount),
  deadline: r.deadline,
  category: r.category as GoalCategory,
});

export const toBudget = (r: BudgetRow): Budget => ({
  id: r.id,
  userId: r.user_id,
  category: r.category as ExpenseCategory,
  limit: Number(r.monthly_limit),
});

export const toNotification = (r: NotificationRow): NotificationItem => ({
  id: r.id,
  userId: r.user_id,
  title: r.title,
  message: r.message,
  date: new Date(r.date).toLocaleString('pt-BR'),
  type: r.type as NotificationItem['type'],
  read: r.read,
});
