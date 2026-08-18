import React from 'react';
import { Wallet, Sparkles, AlertTriangle } from 'lucide-react';
import { AuthForm } from './AuthForm';
import { useFinancial } from '../context/FinancialContext';
import { SUPABASE_URL } from '../lib/supabase';

export const AuthScreen: React.FC = () => {
  const { loadError, isSupabaseConfigured } = useFinancial();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
      {/* Branding */}
      <div className="w-full max-w-md flex flex-col items-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 animate-pulse">
          <Wallet className="w-9 h-9" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
          Finanza
          <span className="ml-2 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 align-middle">
            PRO [B4]
          </span>
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium">
          Gestão Financeira Pessoal
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-4">
        {!isSupabaseConfigured && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Banco de dados não configurado. {loadError ?? 'Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.'}
            </span>
          </div>
        )}
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            SEJA BEM VINDO AO FINANZA PRO
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Entre para acessar seus dados em qualquer dispositivo.
          </p>
        </div>

        <AuthForm allowGuest />
      </div>

      <p className="mt-6 max-w-md text-center text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 justify-center">
        <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
        Análises e insights com IA Finanza sobre seus gastos, orçamentos e metas.
      </p>

      {/* DEBUG - remover após diagnóstico */}
      <div className="mt-4 w-full max-w-md text-center text-[10px] text-slate-400 dark:text-slate-600 font-mono break-all">
        debug: configured={String(isSupabaseConfigured)} url={SUPABASE_URL} build=B4
      </div>
    </div>
  );
};
