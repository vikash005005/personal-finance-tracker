import React from 'react';
import { Modal } from './Modal';
import { RotateCcw, Check, SlidersHorizontal } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';

export const DashboardCustomizerModal = ({ isOpen, onClose }) => {
  const { dashboardConfig, updateDashboardConfig, resetDashboardConfig } = useFinance();
  const { t } = useLanguage();

  if (!isOpen) return null;

  const sections = [
    { key: 'smartAlerts', labelKey: 'secSmartAlerts', category: 'Alerts & Summary' },
    { key: 'balance', labelKey: 'secBalance', category: 'Alerts & Summary' },
    { key: 'income', labelKey: 'secIncome', category: 'Alerts & Summary' },
    { key: 'expenses', labelKey: 'secExpenses', category: 'Alerts & Summary' },
    { key: 'savings', labelKey: 'secSavings', category: 'Alerts & Summary' },
    { key: 'cashflowChart', labelKey: 'secCashflowChart', category: 'Charts' },
    { key: 'financialHealth', labelKey: 'secFinancialHealth', category: 'Analysis' },
    { key: 'recentTransactions', labelKey: 'secRecentTransactions', category: 'Activity' },
    { key: 'budgetOverview', labelKey: 'secBudgetOverview', category: 'Planning' },
    { key: 'savingsGoals', labelKey: 'secSavingsGoals', category: 'Planning' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('customizeDashboard')}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('dashboardSettingsDesc')}
        </p>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[60vh] overflow-y-auto pr-1">
          {sections.map((sec) => {
            const isEnabled = !!dashboardConfig[sec.key];
            return (
              <div
                key={sec.key}
                onClick={() => updateDashboardConfig(sec.key, !isEnabled)}
                className="py-2.5 px-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg cursor-pointer transition-colors"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {t(sec.labelKey) || sec.labelKey}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {sec.category}
                  </span>
                </div>

                <div
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    isEnabled
                      ? 'bg-slate-900 dark:bg-slate-100'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white dark:bg-slate-900 shadow-xs transform transition-transform ${
                      isEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={resetDashboardConfig}
            className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('resetLayout')}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition-colors"
          >
            {t('save')}
          </button>
        </div>
      </div>
    </Modal>
  );
};
