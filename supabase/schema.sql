-- ============================================
-- Finanza - Gestão Financeira Pessoal
-- Schema para Supabase (PostgreSQL)
-- Rode este script no SQL Editor do Supabase
-- Idempotente: pode rodar quantas vezes quiser.
-- ============================================

-- TABELAS
create table if not exists public.users (
    id uuid primary key,
    name text not null default 'Novo Usuário',
    email text default '',
    avatar_url text,
    monthly_income_goal numeric(12, 2),
    created_at timestamptz not null default now()
);

create table if not exists public.incomes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    description text not null,
    amount numeric(12, 2) not null,
    type text not null,
    date date not null,
    is_recurring boolean not null default false,
    notes text,
    created_at timestamptz not null default now()
);

create table if not exists public.expenses (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    description text not null,
    amount numeric(12, 2) not null,
    category text not null,
    type text not null,
    date date not null,
    notes text,
    created_at timestamptz not null default now()
);

create table if not exists public.goals (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    name text not null,
    target_amount numeric(12, 2) not null,
    current_amount numeric(12, 2) not null default 0,
    deadline date not null,
    category text not null default 'outro',
    created_at timestamptz not null default now()
);

create table if not exists public.budgets (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    category text not null,
    monthly_limit numeric(12, 2) not null,
    created_at timestamptz not null default now(),
    unique (user_id, category)
);

create table if not exists public.notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    title text not null,
    message text not null,
    date timestamptz not null default now(),
    type text not null default 'info',
    read boolean not null default false
);

-- ÍNDICES
create index if not exists idx_incomes_user_date on public.incomes (user_id, date);
create index if not exists idx_expenses_user_date on public.expenses (user_id, date);
create index if not exists idx_goals_user on public.goals (user_id);
create index if not exists idx_budgets_user on public.budgets (user_id);
create index if not exists idx_notifications_user on public.notifications (user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Cada usuário só acessa os próprios dados.
-- A tabela users usa id = auth.uid() (login anônimo ou com e-mail).
-- ============================================

alter table public.users enable row level security;
alter table public.incomes enable row level security;
alter table public.expenses enable row level security;
alter table public.goals enable row level security;
alter table public.budgets enable row level security;
alter table public.notifications enable row level security;

-- USERS
drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users for select using (id = auth.uid());
drop policy if exists "users_insert_own" on public.users;
create policy "users_insert_own" on public.users for insert with check (id = auth.uid());
drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users for update using (id = auth.uid());
drop policy if exists "users_delete_own" on public.users;
create policy "users_delete_own" on public.users for delete using (id = auth.uid());

-- INCOMES
drop policy if exists "incomes_select_own" on public.incomes;
create policy "incomes_select_own" on public.incomes for select using (user_id = auth.uid());
drop policy if exists "incomes_insert_own" on public.incomes;
create policy "incomes_insert_own" on public.incomes for insert with check (user_id = auth.uid());
drop policy if exists "incomes_update_own" on public.incomes;
create policy "incomes_update_own" on public.incomes for update using (user_id = auth.uid());
drop policy if exists "incomes_delete_own" on public.incomes;
create policy "incomes_delete_own" on public.incomes for delete using (user_id = auth.uid());

-- EXPENSES
drop policy if exists "expenses_select_own" on public.expenses;
create policy "expenses_select_own" on public.expenses for select using (user_id = auth.uid());
drop policy if exists "expenses_insert_own" on public.expenses;
create policy "expenses_insert_own" on public.expenses for insert with check (user_id = auth.uid());
drop policy if exists "expenses_update_own" on public.expenses;
create policy "expenses_update_own" on public.expenses for update using (user_id = auth.uid());
drop policy if exists "expenses_delete_own" on public.expenses;
create policy "expenses_delete_own" on public.expenses for delete using (user_id = auth.uid());

-- GOALS
drop policy if exists "goals_select_own" on public.goals;
create policy "goals_select_own" on public.goals for select using (user_id = auth.uid());
drop policy if exists "goals_insert_own" on public.goals;
create policy "goals_insert_own" on public.goals for insert with check (user_id = auth.uid());
drop policy if exists "goals_update_own" on public.goals;
create policy "goals_update_own" on public.goals for update using (user_id = auth.uid());
drop policy if exists "goals_delete_own" on public.goals;
create policy "goals_delete_own" on public.goals for delete using (user_id = auth.uid());

-- BUDGETS
drop policy if exists "budgets_select_own" on public.budgets;
create policy "budgets_select_own" on public.budgets for select using (user_id = auth.uid());
drop policy if exists "budgets_insert_own" on public.budgets;
create policy "budgets_insert_own" on public.budgets for insert with check (user_id = auth.uid());
drop policy if exists "budgets_update_own" on public.budgets;
create policy "budgets_update_own" on public.budgets for update using (user_id = auth.uid());
drop policy if exists "budgets_delete_own" on public.budgets;
create policy "budgets_delete_own" on public.budgets for delete using (user_id = auth.uid());

-- NOTIFICATIONS
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications for select using (user_id = auth.uid());
drop policy if exists "notifications_insert_own" on public.notifications;
create policy "notifications_insert_own" on public.notifications for insert with check (user_id = auth.uid());
drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications for update using (user_id = auth.uid());
drop policy if exists "notifications_delete_own" on public.notifications;
create policy "notifications_delete_own" on public.notifications for delete using (user_id = auth.uid());
