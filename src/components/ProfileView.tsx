import React, { useState } from 'react';
import { User as UserIcon, Mail, Lock, Shield, Check, Key, LogOut } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

export const ProfileView: React.FC = () => {
  const { user, setUser } = useFinancial();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [incomeGoal, setIncomeGoal] = useState(
    user.monthlyIncomeGoal ? user.monthlyIncomeGoal.toString() : '10000'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Recovery simulator
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

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

  const handleSendRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) return;
    setRecoverySent(true);
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
          <p className="text-xs text-slate-300">{user.email}</p>
          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
            Conta Autenticada
          </span>
        </div>
      </div>

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
          <Key className="w-5 h-5 text-indigo-600" />
          Segurança da Conta & Senha
        </h2>

        <p className="text-xs text-slate-500">
          Você pode redefinir sua senha ou simular o envio de um link de recuperação por e-mail.
        </p>

        <button
          onClick={() => {
            setRecoveryEmail(user.email);
            setRecoverySent(false);
            setShowPasswordRecovery(true);
          }}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold"
        >
          Solicitar Recuperação de Senha
        </button>
      </div>

      {/* Password Recovery Modal */}
      {showPasswordRecovery && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Recuperação de Senha
            </h3>

            {recoverySent ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs space-y-2 border border-emerald-200">
                <p className="font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Link enviado com sucesso!
                </p>
                <p>
                  Enviamos as instruções para <strong>{recoveryEmail}</strong>. Verifique sua caixa de entrada.
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
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md"
                  >
                    Enviar Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
