import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Income,
  Expense,
  Goal,
  Budget,
  NotificationItem,
  ThemeMode,
  ActiveTab,
  AIMessage,
  ExpenseCategory,
} from '../types';
import {
  supabase,
  isSupabaseConfigured,
  toUser,
  toIncome,
  toExpense,
  toGoal,
  toBudget,
  toNotification,
} from '../lib/supabase';

export interface AuthResult {
  ok: boolean;
  error?: string;
  needsConfirmation?: boolean;
}

interface FinancialContextType {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  theme: ThemeMode;
  toggleTheme: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Authentication
  authStatus: 'loading' | 'guest' | 'email' | 'none';
  isGuest: boolean;
  authError: string | null;
  authMessage: string | null;
  loginWithEmail: (email: string, password: string) => Promise<AuthResult>;
  signUpWithEmail: (
    email: string,
    password: string,
    name?: string
  ) => Promise<AuthResult>;
  continueAsGuest: () => Promise<AuthResult>;
  logout: () => Promise<void>;

  // Loading state
  isLoading: boolean;
  isSupabaseConnected: boolean;
  loadError: string | null;

  // Data lists
  incomes: Income[];
  expenses: Expense[];
  goals: Goal[];
  budgets: Budget[];
  notifications: NotificationItem[];

  // Actions - Income
  addIncome: (income: Omit<Income, 'id' | 'userId'>) => void;
  updateIncome: (id: string, updated: Partial<Income>) => void;
  deleteIncome: (id: string) => void;

  // Actions - Expense
  addExpense: (expense: Omit<Expense, 'id' | 'userId'>) => void;
  updateExpense: (id: string, updated: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Actions - Goals
  addGoal: (goal: Omit<Goal, 'id' | 'userId'>) => void;
  updateGoal: (id: string, updated: Partial<Goal>) => void;
  depositGoal: (id: string, amount: number) => void;
  deleteGoal: (id: string) => void;

  // Actions - Budgets
  setBudgetLimit: (category: ExpenseCategory, limit: number) => void;

  // Actions - Notifications
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Filters & Period selection
  selectedMonthYear: string; // "YYYY-MM"
  setSelectedMonthYear: (monthYear: string) => void;

  // AI Assistant
  aiMessages: AIMessage[];
  isAiLoading: boolean;
  askAiAssistant: (question: string) => Promise<void>;
  aiInsights: string[];
  refreshAiInsights: () => Promise<void>;

  // Calculated Metrics
  totalIncomeMonth: number;
  totalExpenseMonth: number;
  currentBalance: number;
  accumulatedSavings: number;
  savingsRatePercentage: number;
  projectedFutureBalance: number;
  topExpenseCategory: string;
  categoryExpensesMonth: Record<string, number>;

  // Reset data
  resetDemoData: () => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(
  undefined
);

const LOCAL_STORAGE_KEY_PREFIX = 'finanza_app_v1_';

// --- Payload builders (partial update -> snake_case DB columns) ---
const incomeUpdatePayload = (u: Partial<Income>) => {
  const p: Record<string, unknown> = {};
  if (u.description !== undefined) p.description = u.description;
  if (u.amount !== undefined) p.amount = u.amount;
  if (u.type !== undefined) p.type = u.type;
  if (u.date !== undefined) p.date = u.date;
  if (u.isRecurring !== undefined) p.is_recurring = u.isRecurring;
  if (u.notes !== undefined) p.notes = u.notes ?? null;
  return p;
};

const expenseUpdatePayload = (u: Partial<Expense>) => {
  const p: Record<string, unknown> = {};
  if (u.description !== undefined) p.description = u.description;
  if (u.amount !== undefined) p.amount = u.amount;
  if (u.category !== undefined) p.category = u.category;
  if (u.type !== undefined) p.type = u.type;
  if (u.date !== undefined) p.date = u.date;
  if (u.notes !== undefined) p.notes = u.notes ?? null;
  return p;
};

const goalUpdatePayload = (u: Partial<Goal>) => {
  const p: Record<string, unknown> = {};
  if (u.name !== undefined) p.name = u.name;
  if (u.targetAmount !== undefined) p.target_amount = u.targetAmount;
  if (u.currentAmount !== undefined) p.current_amount = u.currentAmount;
  if (u.deadline !== undefined) p.deadline = u.deadline;
  if (u.category !== undefined) p.category = u.category;
  return p;
};

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Theme state
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}theme`);
    return (saved as ThemeMode) || 'light';
  });

  // Active Tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Selected Period "YYYY-MM"
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });

  // Loading / connection state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Authentication state
  const [authStatus, setAuthStatus] = useState<
    'loading' | 'guest' | 'email' | 'none'
  >('loading');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  // Data state (começa vazio — dados vêm do Supabase)
  const [user, setUser] = useState<User>({
    id: '',
    name: 'Carregando...',
    email: '',
  });
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // AI Chat Messages state
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: 'Olá! Sou o **Finanza AI**, seu assistente de finanças pessoais. Posso analisar suas receitas, despesas e metas para responder perguntas como:\n- "Quanto gastei este mês?"\n- "Onde posso economizar mais?"\n- "Qual é a previsão do meu saldo futuro?"\n\nComo posso te ajudar hoje?',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiInsights, setAiInsights] = useState<string[]>([
    '💡 **Superávit Positivo**: Suas receitas superam as despesas neste mês. Mantenha os aportes nas suas metas!',
    '📊 **Alerta de Alimentação**: A categoria Alimentação é o seu segundo maior gasto do mês.',
    '🎯 **Metas em Foco**: Falta apenas R$ 7.500,00 para atingir sua Reserva de Emergência!',
  ]);

  // Sync theme to LocalStorage + <html>
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}theme`, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Persist user profile changes to Supabase after initial hydration
  useEffect(() => {
    if (!isHydrated || !user.id) return;
    supabase
      .from('users')
      .update({
        name: user.name,
        email: user.email,
        avatar_url: user.avatarUrl ?? null,
        monthly_income_goal: user.monthlyIncomeGoal ?? null,
      })
      .eq('id', user.id)
      .then(({ error }) => {
        if (error) console.error('Erro ao salvar perfil:', error);
      });
  }, [user, isHydrated]);

  // Helper: carrega perfil + dados da sessão autenticada atual
  const hydrateFromSession = async () => {
    const { data: sessionData } = await supabase.auth.getUser();
    const authUser = sessionData?.user;
    if (!authUser) {
      setAuthStatus('none');
      return;
    }

    const isAnon =
      authUser.is_anonymous === true ||
      authUser.app_metadata?.provider === 'anon';
    setAuthStatus(isAnon ? 'guest' : 'email');

    const authUserId = authUser.id;

    // Obter ou criar o perfil do usuário
    let { data: userRow } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUserId)
      .maybeSingle();

    if (!userRow) {
      const { data: newRow, error: insertError } = await supabase
        .from('users')
        .insert({
          id: authUserId,
          name: isAnon ? 'Convidado' : 'Novo Usuário',
          email: '',
        })
        .select()
        .single();
      if (insertError) throw insertError;
      userRow = newRow;
    }

    // Carregar todos os dados
    const [incomesRes, expensesRes, goalsRes, budgetsRes, notificationsRes] =
      await Promise.all([
        supabase
          .from('incomes')
          .select('*')
          .eq('user_id', authUserId)
          .order('date', { ascending: false }),
        supabase
          .from('expenses')
          .select('*')
          .eq('user_id', authUserId)
          .order('date', { ascending: false }),
        supabase
          .from('goals')
          .select('*')
          .eq('user_id', authUserId)
          .order('created_at', { ascending: false }),
        supabase.from('budgets').select('*').eq('user_id', authUserId),
        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', authUserId)
          .order('date', { ascending: false }),
      ]);

    setUser({
      ...toUser(userRow),
      email: userRow.email || authUser.email || '',
      isGuest: isAnon,
    });
    setIncomes((incomesRes.data ?? []).map(toIncome));
    setExpenses((expensesRes.data ?? []).map(toExpense));
    setGoals((goalsRes.data ?? []).map(toGoal));
    setBudgets((budgetsRes.data ?? []).map(toBudget));
    setNotifications((notificationsRes.data ?? []).map(toNotification));
    setIsSupabaseConnected(true);
  };

  // Load data from Supabase on mount
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        if (!isSupabaseConfigured) {
          setLoadError(
            'Banco de dados não configurado. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env'
          );
          setAuthStatus('none');
          return;
        }

        await hydrateFromSession();
      } catch (err: any) {
        console.error('Erro ao carregar dados do Supabase:', err);
        setLoadError(err?.message || 'Erro inesperado ao conectar ao banco.');
        setAuthStatus('none');
      } finally {
        if (!cancelled) {
          setIsHydrated(true);
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  // Snapshot dos dados do convidado para migrar para a conta de e-mail
  const captureGuestData = (targetUserId: string) => ({
    incomes: incomes.map((i) => ({
      id: i.id,
      user_id: targetUserId,
      description: i.description,
      amount: i.amount,
      type: i.type,
      date: i.date,
      is_recurring: i.isRecurring,
      notes: i.notes ?? null,
    })),
    expenses: expenses.map((e) => ({
      id: e.id,
      user_id: targetUserId,
      description: e.description,
      amount: e.amount,
      category: e.category,
      type: e.type,
      date: e.date,
      notes: e.notes ?? null,
    })),
    goals: goals.map((g) => ({
      id: g.id,
      user_id: targetUserId,
      name: g.name,
      target_amount: g.targetAmount,
      current_amount: g.currentAmount,
      deadline: g.deadline,
      category: g.category,
    })),
    budgets: budgets.map((b) => ({
      id: b.id,
      user_id: targetUserId,
      category: b.category,
      monthly_limit: b.limit,
    })),
    notifications: notifications.map((n) => ({
      id: n.id,
      user_id: targetUserId,
      title: n.title,
      message: n.message,
      date: new Date(n.date).toISOString(),
      type: n.type,
      read: n.read,
    })),
  });

  const ensureUserRow = async (userId: string) => {
    const { data: row } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    if (!row) {
      await supabase
        .from('users')
        .insert({ id: userId, name: 'Novo Usuário', email: '' });
    }
  };

  const migrateGuestData = async (targetUserId: string) => {
    await ensureUserRow(targetUserId);
    const guest = captureGuestData(targetUserId);
    const hasData =
      guest.incomes.length > 0 ||
      guest.expenses.length > 0 ||
      guest.goals.length > 0 ||
      guest.budgets.length > 0 ||
      guest.notifications.length > 0;
    if (!hasData) return;

    // Evitar violação de unique(user_id, category) em budgets
    let budgets = guest.budgets;
    if (guest.budgets.length) {
      const { data: existing } = await supabase
        .from('budgets')
        .select('category')
        .eq('user_id', targetUserId);
      const existingCats = new Set((existing ?? []).map((b) => b.category));
      budgets = guest.budgets.filter((b) => !existingCats.has(b.category));
    }

    const tasks: PromiseLike<unknown>[] = [];
    if (guest.incomes.length) tasks.push(supabase.from('incomes').insert(guest.incomes).then(() => undefined));
    if (guest.expenses.length) tasks.push(supabase.from('expenses').insert(guest.expenses).then(() => undefined));
    if (guest.goals.length) tasks.push(supabase.from('goals').insert(guest.goals).then(() => undefined));
    if (budgets.length) tasks.push(supabase.from('budgets').insert(budgets).then(() => undefined));
    if (guest.notifications.length)
      tasks.push(supabase.from('notifications').insert(guest.notifications).then(() => undefined));
    await Promise.all(tasks);

    // Copiar nome e meta de renda do convidado para a nova conta
    if (user.name && user.name !== 'Convidado' && user.name !== 'Novo Usuário') {
      await supabase.from('users').update({ name: user.name }).eq('id', targetUserId);
    }
    if (user.monthlyIncomeGoal) {
      await supabase
        .from('users')
        .update({ monthly_income_goal: user.monthlyIncomeGoal })
        .eq('id', targetUserId);
    }
  };

  const continueAsGuest = async (): Promise<AuthResult> => {
    setAuthError(null);
    setAuthMessage(null);
    if (!isSupabaseConfigured) {
      const msg = 'Banco de dados não configurado. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.';
      setAuthError(msg);
      return { ok: false, error: msg };
    }
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error || !data.user) {
      const msg =
        error?.message ||
        'Não foi possível entrar como convidado. Verifique se o login anônimo está habilitado no Supabase.';
      setAuthError(msg);
      return { ok: false, error: msg };
    }
    try {
      await hydrateFromSession();
      setIsHydrated(true);
      setIsLoading(false);
      setLoadError(null);
      return { ok: true };
    } catch (err: any) {
      const msg = err?.message || 'Erro ao carregar seus dados.';
      setAuthError(msg);
      return { ok: false, error: msg };
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    name?: string
  ): Promise<AuthResult> => {
    setAuthError(null);
    setAuthMessage(null);
    if (!isSupabaseConfigured) {
      const msg = 'Banco de dados não configurado. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.';
      setAuthError(msg);
      return { ok: false, error: msg };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) {
      let msg = error.message;
      if (/already registered/i.test(msg)) {
        msg = 'Este e-mail já está cadastrado. Faça login.';
      }
      setAuthError(msg);
      return { ok: false, error: msg };
    }
    const needsConfirmation = !data.session;
    if (needsConfirmation) {
      setAuthMessage(
        'Enviamos um link de confirmação para o seu e-mail. Confirme para ativar sua conta.'
      );
      return { ok: true, needsConfirmation: true };
    }
    if (data.user) {
      await migrateGuestData(data.user.id);
    }
    await hydrateFromSession();
    setIsHydrated(true);
    setIsLoading(false);
    setLoadError(null);
    setAuthMessage('Conta criada com sucesso!');
    return { ok: true, needsConfirmation: false };
  };

  const loginWithEmail = async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    setAuthError(null);
    setAuthMessage(null);
    if (!isSupabaseConfigured) {
      const msg = 'Banco de dados não configurado. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.';
      setAuthError(msg);
      return { ok: false, error: msg };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      let msg = error.message;
      if (/email not confirmed/i.test(msg) || error.code === 'email_not_confirmed') {
        msg = 'E-mail ainda não confirmado. Verifique sua caixa de entrada.';
      }
      if (/invalid login credentials/i.test(msg)) {
        msg = 'E-mail ou senha incorretos.';
      }
      setAuthError(msg);
      return { ok: false, error: msg };
    }
    if (data.user) {
      await migrateGuestData(data.user.id);
    }
    await hydrateFromSession();
    setIsHydrated(true);
    setIsLoading(false);
    setLoadError(null);
    setAuthMessage('Login realizado com sucesso!');
    return { ok: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser({ id: '', name: '', email: '' });
    setIncomes([]);
    setExpenses([]);
    setGoals([]);
    setBudgets([]);
    setNotifications([]);
    setAuthStatus('none');
    setAuthError(null);
    setAuthMessage(null);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Metric Calculations
  const filteredIncomesMonth = incomes.filter((inc) =>
    inc.date.startsWith(selectedMonthYear)
  );
  const filteredExpensesMonth = expenses.filter((exp) =>
    exp.date.startsWith(selectedMonthYear)
  );

  const totalIncomeMonth = filteredIncomesMonth.reduce(
    (sum, inc) => sum + inc.amount,
    0
  );
  const totalExpenseMonth = filteredExpensesMonth.reduce(
    (sum, exp) => sum + exp.amount,
    0
  );

  const allTimeIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
  const allTimeExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const currentBalance = allTimeIncome - allTimeExpense;

  const accumulatedSavings = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  const savingsRatePercentage =
    totalIncomeMonth > 0
      ? Math.max(
          0,
          Math.round(
            ((totalIncomeMonth - totalExpenseMonth) / totalIncomeMonth) * 100
          )
        )
      : 0;

  const projectedFutureBalance = currentBalance + (totalIncomeMonth - totalExpenseMonth);

  // Group month expenses by category
  const categoryExpensesMonth: Record<string, number> = {};
  filteredExpensesMonth.forEach((exp) => {
    categoryExpensesMonth[exp.category] =
      (categoryExpensesMonth[exp.category] || 0) + exp.amount;
  });

  let topExpenseCategory = 'Nenhuma';
  let maxSpent = 0;
  Object.entries(categoryExpensesMonth).forEach(([cat, amount]) => {
    if (amount > maxSpent) {
      maxSpent = amount;
      topExpenseCategory = cat;
    }
  });

  // Helper: create notification in DB + state
  const pushNotification = async (
    n: Omit<NotificationItem, 'id' | 'userId' | 'read'>
  ) => {
    const item: NotificationItem = {
      ...n,
      id: crypto.randomUUID(),
      userId: user.id,
      read: false,
    };
    setNotifications((prev) => [item, ...prev]);
    const { error } = await supabase.from('notifications').insert({
      id: item.id,
      user_id: user.id,
      title: item.title,
      message: item.message,
      date: new Date().toISOString(),
      type: item.type,
      read: false,
    });
    if (error) console.error('Erro ao criar notificação:', error);
    return item;
  };

  // Action handlers
  const addIncome = async (newInc: Omit<Income, 'id' | 'userId'>) => {
    const item: Income = {
      ...newInc,
      id: crypto.randomUUID(),
      userId: user.id,
    };
    setIncomes((prev) => [item, ...prev]);
    const { error } = await supabase.from('incomes').insert({
      id: item.id,
      user_id: user.id,
      description: item.description,
      amount: item.amount,
      type: item.type,
      date: item.date,
      is_recurring: item.isRecurring,
      notes: item.notes ?? null,
    });
    if (error) console.error('Erro ao inserir receita:', error);
  };

  const updateIncome = async (id: string, updated: Partial<Income>) => {
    setIncomes((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, ...updated } : inc))
    );
    const { error } = await supabase
      .from('incomes')
      .update(incomeUpdatePayload(updated))
      .eq('id', id);
    if (error) console.error('Erro ao atualizar receita:', error);
  };

  const deleteIncome = async (id: string) => {
    setIncomes((prev) => prev.filter((inc) => inc.id !== id));
    const { error } = await supabase.from('incomes').delete().eq('id', id);
    if (error) console.error('Erro ao excluir receita:', error);
  };

  const addExpense = async (newExp: Omit<Expense, 'id' | 'userId'>) => {
    const item: Expense = {
      ...newExp,
      id: crypto.randomUUID(),
      userId: user.id,
    };
    setExpenses((prev) => [item, ...prev]);

    const { error } = await supabase.from('expenses').insert({
      id: item.id,
      user_id: user.id,
      description: item.description,
      amount: item.amount,
      category: item.category,
      type: item.type,
      date: item.date,
      notes: item.notes ?? null,
    });
    if (error) {
      console.error('Erro ao inserir despesa:', error);
      return;
    }

    // Check budget limit alert
    const budgetObj = budgets.find((b) => b.category === newExp.category);
    if (budgetObj && newExp.date.startsWith(selectedMonthYear)) {
      const currentCategoryTotal =
        expenses
          .filter(
            (e) =>
              e.category === newExp.category &&
              e.date.startsWith(selectedMonthYear)
          )
          .reduce((sum, e) => sum + e.amount, 0) + newExp.amount;
      if (currentCategoryTotal > budgetObj.limit) {
        await pushNotification({
          title: '🚨 Limite de Orçamento Excedido!',
          message: `A categoria "${newExp.category}" ultrapassou o limite de R$ ${budgetObj.limit.toFixed(
            2
          )}. Atual: R$ ${currentCategoryTotal.toFixed(2)}.`,
          date: new Date().toLocaleString('pt-BR'),
          type: 'alert',
        });
      }
    }
  };

  const updateExpense = async (id: string, updated: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, ...updated } : exp))
    );
    const { error } = await supabase
      .from('expenses')
      .update(expenseUpdatePayload(updated))
      .eq('id', id);
    if (error) console.error('Erro ao atualizar despesa:', error);
  };

  const deleteExpense = async (id: string) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) console.error('Erro ao excluir despesa:', error);
  };

  const addGoal = async (newGoal: Omit<Goal, 'id' | 'userId'>) => {
    const item: Goal = {
      ...newGoal,
      id: crypto.randomUUID(),
      userId: user.id,
    };
    setGoals((prev) => [...prev, item]);
    const { error } = await supabase.from('goals').insert({
      id: item.id,
      user_id: user.id,
      name: item.name,
      target_amount: item.targetAmount,
      current_amount: item.currentAmount,
      deadline: item.deadline,
      category: item.category,
    });
    if (error) console.error('Erro ao inserir meta:', error);
  };

  const updateGoal = async (id: string, updated: Partial<Goal>) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updated } : g))
    );
    const { error } = await supabase
      .from('goals')
      .update(goalUpdatePayload(updated))
      .eq('id', id);
    if (error) console.error('Erro ao atualizar meta:', error);
  };

  const depositGoal = async (id: string, amount: number) => {
    if (amount <= 0) return;
    const target = goals.find((g) => g.id === id);
    const prevAmount = target?.currentAmount ?? 0;
    const newAmount = prevAmount + amount;

    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, currentAmount: newAmount } : g))
    );

    const { error } = await supabase
      .from('goals')
      .update({ current_amount: newAmount })
      .eq('id', id);
    if (error) {
      console.error('Erro ao depositar na meta:', error);
      return;
    }

    if (
      target &&
      newAmount >= target.targetAmount &&
      prevAmount < target.targetAmount
    ) {
      await pushNotification({
        title: '🎉 Meta Financeira Concluída!',
        message: `Parabéns! Você alcançou 100% da meta "${target.name}"!`,
        date: new Date().toLocaleString('pt-BR'),
        type: 'success',
      });
    }
  };

  const deleteGoal = async (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) console.error('Erro ao excluir meta:', error);
  };

  const setBudgetLimit = async (category: ExpenseCategory, limit: number) => {
    const exists = budgets.find((b) => b.category === category);
    if (exists) {
      setBudgets((prev) =>
        prev.map((b) => (b.category === category ? { ...b, limit } : b))
      );
      const { error } = await supabase
        .from('budgets')
        .update({ monthly_limit: limit })
        .eq('id', exists.id);
      if (error) console.error('Erro ao atualizar orçamento:', error);
    } else {
      const item: Budget = {
        id: crypto.randomUUID(),
        userId: user.id,
        category,
        limit,
      };
      setBudgets((prev) => [...prev, item]);
      const { error } = await supabase.from('budgets').insert({
        id: item.id,
        user_id: user.id,
        category,
        monthly_limit: limit,
      });
      if (error) console.error('Erro ao criar orçamento:', error);
    }
  };

  const markNotificationRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    if (error) console.error('Erro ao marcar notificação:', error);
  };

  const clearAllNotifications = async () => {
    setNotifications([]);
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id);
    if (error) console.error('Erro ao limpar notificações:', error);
  };

  // AI Assistant Call
  const askAiAssistant = async (question: string) => {
    const userMsg: AIMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: question,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setAiMessages((prev) => [...prev, userMsg]);
    setIsAiLoading(true);

    try {
      const financialContext = {
        balance: currentBalance,
        totalIncome: totalIncomeMonth,
        totalExpense: totalExpenseMonth,
        savings: totalIncomeMonth - totalExpenseMonth,
        savingsRate: savingsRatePercentage,
        categoryExpenses: categoryExpensesMonth,
        topExpenseCategory,
        goals,
        budgets,
      };

      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, financialContext }),
      });

      const data = await res.json();
      const botText = data.answer || data.error || 'Desculpe, ocorreu um erro na consulta.';

      const assistantMsg: AIMessage = {
        id: 'msg_bot_' + Date.now(),
        sender: 'assistant',
        text: botText,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };

      setAiMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setAiMessages((prev) => [
        ...prev,
        {
          id: 'msg_err_' + Date.now(),
          sender: 'assistant',
          text: 'Desculpe, não consegui conectar ao servidor de inteligência no momento. Tente novamente.',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const refreshAiInsights = async () => {
    try {
      const financialContext = {
        totalIncome: totalIncomeMonth,
        totalExpense: totalExpenseMonth,
        topExpenseCategory,
        goals,
        overBudgetCount: budgets.filter((b) => (categoryExpensesMonth[b.category] || 0) > b.limit).length,
      };

      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ financialContext }),
      });
      const data = await res.json();
      if (data.insights && Array.isArray(data.insights)) {
        setAiInsights(data.insights);
      }
    } catch (e) {
      console.warn('Erro ao atualizar insights:', e);
    }
  };

  const resetDemoData = async () => {
    if (!user.id) return;
    await Promise.all([
      supabase.from('incomes').delete().eq('user_id', user.id),
      supabase.from('expenses').delete().eq('user_id', user.id),
      supabase.from('goals').delete().eq('user_id', user.id),
      supabase.from('budgets').delete().eq('user_id', user.id),
      supabase.from('notifications').delete().eq('user_id', user.id),
    ]);
    setIncomes([]);
    setExpenses([]);
    setGoals([]);
    setBudgets([]);
    setNotifications([]);
  };

  return (
    <FinancialContext.Provider
      value={{
        user,
        setUser,
        theme,
        toggleTheme,
        activeTab,
        setActiveTab,
        authStatus,
        isGuest: authStatus === 'guest',
        authError,
        authMessage,
        loginWithEmail,
        signUpWithEmail,
        continueAsGuest,
        logout,
        isLoading,
        isSupabaseConnected,
        loadError,
        incomes,
        expenses,
        goals,
        budgets,
        notifications,
        addIncome,
        updateIncome,
        deleteIncome,
        addExpense,
        updateExpense,
        deleteExpense,
        addGoal,
        updateGoal,
        depositGoal,
        deleteGoal,
        setBudgetLimit,
        markNotificationRead,
        clearAllNotifications,
        selectedMonthYear,
        setSelectedMonthYear,
        aiMessages,
        isAiLoading,
        askAiAssistant,
        aiInsights,
        refreshAiInsights,
        totalIncomeMonth,
        totalExpenseMonth,
        currentBalance,
        accumulatedSavings,
        savingsRatePercentage,
        projectedFutureBalance,
        topExpenseCategory,
        categoryExpensesMonth,
        resetDemoData,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial deve ser usado dentro de um FinancialProvider');
  }
  return context;
};
