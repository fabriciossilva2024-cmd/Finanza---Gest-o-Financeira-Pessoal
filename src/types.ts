export type ThemeMode = 'light' | 'dark';

export type IncomeType =
  | 'Salário'
  | 'Diária'
  | 'Semanal'
  | 'Quinzenal'
  | 'Mensal'
  | 'Comissão'
  | 'Freelancer'
  | 'Outros';

export type ExpenseCategory =
  | 'Alimentação'
  | 'Moradia'
  | 'Transporte'
  | 'Saúde'
  | 'Educação'
  | 'Lazer'
  | 'Cartão de crédito'
  | 'Contas fixas'
  | 'Assinaturas'
  | 'Investimentos'
  | 'Outros';

export type ExpenseType = 'Despesa fixa' | 'Despesa variável' | 'Despesa recorrente';

export type GoalCategory = 'reserva' | 'carro' | 'viagem' | 'casa' | 'outro';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  monthlyIncomeGoal?: number;
  isGuest?: boolean;
}

export interface Income {
  id: string;
  userId: string;
  description: string;
  amount: number;
  type: IncomeType;
  date: string; // YYYY-MM-DD
  isRecurring: boolean;
  notes?: string;
}

export interface Expense {
  id: string;
  userId: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  type: ExpenseType;
  date: string; // YYYY-MM-DD
  notes?: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  category: GoalCategory;
}

export interface Budget {
  id: string;
  userId: string;
  category: ExpenseCategory;
  limit: number;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  type: 'alert' | 'success' | 'info' | 'warning';
  read: boolean;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'receitas'
  | 'despesas'
  | 'metas'
  | 'orcamento'
  | 'relatorios'
  | 'assistente_ia'
  | 'perfil';
