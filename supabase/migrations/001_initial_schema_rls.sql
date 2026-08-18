-- Finanza PRO — Schema + RLS Policies
-- Execute este SQL no Supabase SQL Editor (https://supabase.com/dashboard)
-- Garante que cada usuário só acessa seus próprios dados via auth.uid()

-- ============================================================
-- 1. TABELAS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY,
    name text NOT NULL DEFAULT 'Novo Usuário',
    email text DEFAULT '',
    avatar_url text,
    monthly_income_goal numeric(12, 2),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.incomes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    description text NOT NULL,
    amount numeric(12, 2) NOT NULL,
    type text NOT NULL,
    date date NOT NULL,
    is_recurring boolean NOT NULL DEFAULT false,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.expenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    description text NOT NULL,
    amount numeric(12, 2) NOT NULL,
    category text NOT NULL,
    type text NOT NULL,
    date date NOT NULL,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.goals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    target_amount numeric(12, 2) NOT NULL,
    current_amount numeric(12, 2) NOT NULL DEFAULT 0,
    deadline date NOT NULL,
    category text NOT NULL DEFAULT 'outro',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.budgets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category text NOT NULL,
    monthly_limit numeric(12, 2) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, category)
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    date timestamptz NOT NULL DEFAULT now(),
    type text NOT NULL DEFAULT 'info',
    read boolean NOT NULL DEFAULT false
);

-- ============================================================
-- 2. HABILITAR RLS EM TODAS AS TABELAS
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. POLÍTICAS RLS — cada usuário só acessa seus próprios dados
-- ============================================================

-- Users
DROP POLICY IF EXISTS "users_own" ON public.users;
CREATE POLICY "users_own" ON public.users
    FOR ALL
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Incomes
DROP POLICY IF EXISTS "incomes_own" ON public.incomes;
CREATE POLICY "incomes_own" ON public.incomes
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Expenses
DROP POLICY IF EXISTS "expenses_own" ON public.expenses;
CREATE POLICY "expenses_own" ON public.expenses
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Goals
DROP POLICY IF EXISTS "goals_own" ON public.goals;
CREATE POLICY "goals_own" ON public.goals
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Budgets
DROP POLICY IF EXISTS "budgets_own" ON public.budgets;
CREATE POLICY "budgets_own" ON public.budgets
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Notifications
DROP POLICY IF EXISTS "notifications_own" ON public.notifications;
CREATE POLICY "notifications_own" ON public.notifications
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 4. ÍNDICES para performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_incomes_user_id ON public.incomes(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
