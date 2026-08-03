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
import { DatabaseSchemaModal } from './components/DatabaseSchemaModal';
import { AuthScreen } from './components/AuthScreen';

const AppContent: React.FC = () => {
  const { activeTab, isLoading, loadError, authStatus } = useFinancial();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDatabaseSchemaOpen, setIsDatabaseSchemaOpen] = useState(false);

  if (authStatus === 'none') {
    return <AuthScreen />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center gap-4 font-sans p-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 animate-pulse">
          <Wallet className="w-8 h-8" />
        </div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Conectando ao banco de dados...
        </p>
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
      <Header
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenDatabaseSchema={() => setIsDatabaseSchemaOpen(true)}
      />

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

      <DatabaseSchemaModal
        isOpen={isDatabaseSchemaOpen}
        onClose={() => setIsDatabaseSchemaOpen(false)}
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
