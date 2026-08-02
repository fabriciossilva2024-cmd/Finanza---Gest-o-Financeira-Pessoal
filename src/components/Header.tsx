import React, { useState } from 'react';
import {
  Wallet,
  Bell,
  Sun,
  Moon,
  Database,
  Calendar,
  Sparkles,
  ChevronDown,
  User as UserIcon,
  RotateCcw,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency } from '../utils/formatters';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenDatabaseSchema: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  onOpenDatabaseSchema,
}) => {
  const {
    user,
    theme,
    toggleTheme,
    notifications,
    currentBalance,
    selectedMonthYear,
    setSelectedMonthYear,
    setActiveTab,
    resetDemoData,
  } = useFinancial();

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                Finanza
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              Gestão Financeira Pessoal
            </p>
          </div>
        </div>

        {/* Center: Month/Year Period Picker */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800/70 p-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/50">
          <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400 ml-2" />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Período:
          </span>
          <input
            type="month"
            value={selectedMonthYear}
            onChange={(e) => setSelectedMonthYear(e.target.value)}
            className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          />
        </div>

        {/* Balance badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40">
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            Saldo:
          </span>
          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
            {formatCurrency(currentBalance)}
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Assistant Button */}
          <button
            onClick={() => setActiveTab('assistente_ia')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-xs font-semibold shadow-sm transition-all hover:scale-105"
            title="Assistente de Inteligência Artificial"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">IA Finanza</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5 text-amber-400" />
            )}
          </button>

          {/* Database Schema Inspector button */}
          <button
            onClick={onOpenDatabaseSchema}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Ver Esquema do Banco de Dados (SQL)"
          >
            <Database className="w-5 h-5 text-indigo-500" />
          </button>

          {/* Notifications Trigger */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Notificações e Alertas"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-emerald-500/30"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden md:inline-block max-w-[120px] truncate">
                {user.name.split(' ')[0]}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {user.email}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('perfil');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  Meu Perfil e Conta
                </button>

                <button
                  onClick={() => {
                    resetDemoData();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Limpar Todos os Dados
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
