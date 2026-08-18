import React, { useState } from 'react';
import { Mail, Lock, LogIn, Check, Info, ShieldCheck } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

interface AuthFormProps {
  allowGuest?: boolean;
  onDone?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  allowGuest = false,
  onDone,
}) => {
  const { loginWithEmail, continueAsGuest, authError, authMessage } =
    useFinancial();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await loginWithEmail(email.trim(), password);
      if (res.ok) {
        onDone?.();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuest = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await continueAsGuest();
      if (res.ok) onDone?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Error */}
      {authError && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{authError}</span>
        </div>
      )}

      {/* Message (e.g. confirmation sent) */}
      {authMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-start gap-2">
          <Check className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{authMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
            E-mail
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
            Senha
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo de 6 caracteres"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <LogIn className="w-4 h-4" />
          )}
          Entrar na minha conta
        </button>
      </form>

      {allowGuest && (
        <>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              ou
            </span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>
          <button
            type="button"
            onClick={handleGuest}
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Continuar como convidado
          </button>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
            Sem cadastro: seus dados ficam salvos apenas neste dispositivo.
          </p>
        </>
      )}
    </div>
  );
};
