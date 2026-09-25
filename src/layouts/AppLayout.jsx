import React, { useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { TransactionModal } from '../components/TransactionModal';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Plus } from 'lucide-react';

export const AppLayout = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const path = location.pathname.replace('/', '') || 'dashboard';
  let titleKey = 'dashboard';
  if (path.startsWith('transactions')) titleKey = 'transactions';
  else if (path.startsWith('expense-split')) titleKey = 'expenseSplit';
  else if (path.startsWith('recurring')) titleKey = 'recurringTransactions';
  else if (path.startsWith('budget')) titleKey = 'budget';
  else if (path.startsWith('savings-goals')) titleKey = 'savingsGoals';
  else if (path.startsWith('reports')) titleKey = 'reports';
  else if (path.startsWith('settings')) titleKey = 'settings';

  const pageTitle = t(titleKey);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-slate-900 selection:text-white dark:selection:bg-slate-100 dark:selection:text-slate-900">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          onOpenSidebar={() => setSidebarOpen(true)}
          pageTitle={pageTitle}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating Action Button for Quick Adding Transaction */}
      <button
        onClick={() => setIsTxModalOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center space-x-1.5 px-3.5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 shadow-lg transition-colors border border-slate-700/50 dark:border-slate-300/50 text-xs font-semibold"
        aria-label="Add transaction"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">{t('quickAdd')}</span>
      </button>

      {/* Quick Add Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
      />
    </div>
  );
};
