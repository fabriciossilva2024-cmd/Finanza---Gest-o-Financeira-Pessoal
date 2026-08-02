import React from 'react';
import { X, Database, Table, Copy, Check } from 'lucide-react';

interface DatabaseSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseSchemaModal: React.FC<DatabaseSchemaModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const sqlSchema = `-- Esquema do Banco de Dados PostgreSQL - Finanza (Supabase)
-- Execute em: Supabase > SQL Editor

create table public.users (
    id uuid primary key,
    name text not null default 'Novo Usuário',
    email text default '',
    avatar_url text,
    monthly_income_goal numeric(12, 2),
    created_at timestamptz not null default now()
);

create table public.incomes (
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

create table public.expenses (
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

create table public.goals (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    name text not null,
    target_amount numeric(12, 2) not null,
    current_amount numeric(12, 2) not null default 0,
    deadline date not null,
    category text not null default 'outro',
    created_at timestamptz not null default now()
);

create table public.budgets (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    category text not null,
    monthly_limit numeric(12, 2) not null,
    created_at timestamptz not null default now(),
    unique (user_id, category)
);

create table public.notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    title text not null,
    message text not null,
    date timestamptz not null default now(),
    type text not null default 'info',
    read boolean not null default false
);

-- RLS: cada usuário acessa somente os próprios dados (auth.uid())
alter table public.users enable row level security;
alter table public.incomes enable row level security;
alter table public.expenses enable row level security;
alter table public.goals enable row level security;
alter table public.budgets enable row level security;
alter table public.notifications enable row level security;

create policy "users_own" on public.users for all using (id = auth.uid()) with check (id = auth.uid());
create policy "incomes_own" on public.incomes for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "expenses_own" on public.expenses for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "goals_own" on public.goals for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "budgets_own" on public.budgets for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notifications_own" on public.notifications for all using (user_id = auth.uid()) with check (user_id = auth.uid());`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-3xl w-full max-h-[85vh] flex flex-col justify-between shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Esquema do Banco de Dados (PostgreSQL)
              </h2>
              <p className="text-xs text-slate-500">
                Tabelas relacionais: users, incomes, expenses, goals, budgets e notifications.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SQL Code View */}
        <div className="flex-1 overflow-y-auto bg-slate-950 p-4 rounded-2xl text-emerald-400 font-mono text-xs leading-relaxed border border-slate-800">
          <pre>{sqlSchema}</pre>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500">
            Estrutura pronta para Supabase (PostgreSQL) com Row Level Security.
          </p>
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" /> SQL Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copiar Código DDL SQL
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
