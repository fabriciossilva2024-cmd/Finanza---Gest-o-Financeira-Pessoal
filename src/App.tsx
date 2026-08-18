import React, { useState } from 'react';
import { Wallet } from 'lucide-react';
import { FinancialProvider, useFinancial } from './context/FinancialContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { IncomeView } from './components/IncomeView';
import { ExpenseView } from './components/ExpenseView';
import { GoalsView } from './components/GoalsView';
import { BudgetView } from './components/BudgetView';
import { ReportsView } from './components/ReportsView';
import { AIAssistantView } from './components/AIAssistantView';
import { ProfileView } from './components/ProfileView';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { AuthScreen } from './components/AuthScreen';

const AppContent: React.FC = () => {
  const { activeTab, isLoading, loadError, authStatus } = useFinancial();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  if (authStatus === 'none') {
    return <AuthScreen />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center gap-5 font-sans p-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
          <Wallet className="w-9 h-9" />
        </div>
        <h1 className="text-xl font-extrabold tracking-tight">
          Finanza
          <span className="ml-2 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 align-middle">
            PRO
          </span>
        </h1>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            Conectando ao banco de dados...
          </p>
        </div>
        {loadError && (
          <div className="max-w-md w-full p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs leading-relaxed">
            <p className="font-bold mb-1">Erro na conexão</p>
            <p>{loadError}</p>
          </div>
        )}
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'receitas':
        return <IncomeView />;
      case 'despesas':
        return <ExpenseView />;
      case 'metas':
        return <GoalsView />;
      case 'orcamento':
        return <BudgetView />;
      case 'relatorios':
        return <ReportsView />;
      case 'assistente_ia':
        return <AIAssistantView />;
      case 'perfil':
        return <ProfileView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-emerald-500 selection:text-white">
      <Header onOpenNotifications={() => setIsNotificationsOpen(true)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-16 md:pb-0">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderActiveTab()}
        </main>
      </div>

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <FinancialProvider>
      <AppContent />
    </FinancialProvider>
  );
}
