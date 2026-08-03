import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  KeyRound,
  ShieldCheck,
  Check,
  Link as LinkIcon,
  LogOut,
  X,
  Smartphone,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { supabase } from '../lib/supabase';
import { AuthModal } from './AuthModal';

export const ProfileView: React.FC = () => {
  const { user, setUser, isGuest, logout } = useFinancial();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [incomeGoal, setIncomeGoal] = useState(
    user.monthlyIncomeGoal ? user.monthlyIncomeGoal.toString() : '10000'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [showAuthModal, setShowAuthModal] = useState(false);

  // Password recovery
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState(user.email);
  const [recoverySent, setRecoverySent] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  // Change password
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUser((prev) => ({
      ...prev,
      name,
      email,
      monthlyIncomeGoal: parseFloat(incomeGoal) || 10000,
    }));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSendRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) return;
    setRecoveryLoading(true);
    setRecoveryError('');
    const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail.trim());
    setRecoveryLoading(false);
    if (error) {
      setRecoveryError(error.message);
      return;
    }
    setRecoverySent(true);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);
    if (newPassword.length < 6) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem.');
      return;
    }
    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);
    if (error) {
      setPasswordError(error.message);
      return;
    }
    setPasswordSuccess(true);
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white shadow-lg flex items-center gap-4">
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="w-16 h-16 rounded-2xl object-cover ring-4 ring-emerald-500/40 shrink-0"
        />
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold">{user.name}</h1>
          <p className="text-xs text-slate-300">{isGuest ? '—' : user.email}</p>
          <span
            className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isGuest
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-emerald-500/20 text-emerald-300'
            }`}
          >
            {isGuest ? 'Conta de Convidado' : 'Conta Sincronizada'}
          </span>
        </div>
      </div>

      {/* Guest sync banner */}
      {isGuest && (
        <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                Seus dados estão apenas neste dispositivo
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400/80 mt-1">
                Crie uma conta com e-mail para sincronizar e acessar suas finanças de qualquer lugar.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-transform hover:scale-105 shrink-0 flex items-center gap-2"
          >
            <LinkIcon className="w-4 h-4" />
            Vincular e-mail
          </button>
        </div>
      )}

      {/* Profile Settings Form */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-emerald-600" />
          Perfil do Usuário & Preferências
        </h2>

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 border border-emerald-200">
            <Check className="w-4 h-4" /> Dados atualizados com sucesso!
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
              E-mail de Acesso
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
              Meta de Renda Mensal (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={incomeGoal}
              onChange={(e) => setIncomeGoal(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-transform hover:scale-105"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>

      {/* Password & Security Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-indigo-600" />
          Segurança da Conta & Senha
        </h2>

        {isGuest ? (
          <p className="text-xs text-slate-500">
            Você está usando uma conta de convidado. Vincule um e-mail para gerenciar sua senha e
            proteger seus dados.
          </p>
        ) : (
          <>
            <p className="text-xs text-slate-500">
              Redefina sua senha por e-mail ou defina uma nova senha agora.
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setRecoveryEmail(user.email);
                  setRecoverySent(false);
                  setRecoveryError('');
                  setShowPasswordRecovery(true);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold"
              >
                Esqueci minha senha
              </button>
              <button
                onClick={() => {
                  setShowChangePassword((v) => !v);
                  setPasswordError('');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-950/70 text-xs font-bold"
              >
                Alterar senha
              </button>
            </div>

            {showChangePassword && (
              <form onSubmit={handleChangePassword} className="space-y-3 pt-2">
                {passwordError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-800">
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 border border-emerald-200">
                    <Check className="w-4 h-4" /> Senha alterada com sucesso!
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md disabled:opacity-60"
                  >
                    {passwordLoading ? 'Salvando...' : 'Salvar nova senha'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>

      {!isGuest && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <LogOut className="w-4 h-4 text-rose-500" />
              Sessão
            </h2>
            <p className="text-xs text-slate-500 mt-1">Sair desta conta neste dispositivo.</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/70 text-xs font-bold"
          >
            Sair da conta
          </button>
        </div>
      )}

      {/* Password Recovery Modal */}
      {showPasswordRecovery && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Recuperação de Senha
              </h3>
              <button
                onClick={() => setShowPasswordRecovery(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {recoverySent ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs space-y-2 border border-emerald-200">
                <p className="font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Link enviado com sucesso!
                </p>
                <p>
                  Enviamos as instruções para <strong>{recoveryEmail}</strong>. Verifique sua caixa
                  de entrada (e o spam).
                </p>
                <button
                  onClick={() => setShowPasswordRecovery(false)}
                  className="w-full py-2 mt-2 rounded-xl bg-emerald-600 text-white font-bold"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendRecovery} className="space-y-3">
                {recoveryError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-800">
                    {recoveryError}
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Confirme seu E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordRecovery(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={recoveryLoading}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md disabled:opacity-60"
                  >
                    {recoveryLoading ? 'Enviando...' : 'Enviar Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};
