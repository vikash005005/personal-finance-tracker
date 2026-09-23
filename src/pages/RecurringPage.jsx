import React, { useState } from 'react';
import {
  Plus,
  Repeat,
  Play,
  Pause,
  Edit2,
  Trash2,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { CATEGORIES } from '../constants/initialData';
import { RecurringModal } from '../components/RecurringModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { formatDateDisplay } from '../utils/formatters';

function computeNextDue(rule) {
  if (!rule.isActive) return 'Paused';
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let current = new Date(rule.startDate);
  const end = rule.endDate ? new Date(rule.endDate) : null;

  while (current < today) {
    const next = new Date(current);
    switch (rule.frequency) {
      case 'daily':   next.setDate(next.getDate() + 1); break;
      case 'weekly':  next.setDate(next.getDate() + 7); break;
      case 'monthly': next.setMonth(next.getMonth() + 1); break;
      case 'yearly':  next.setFullYear(next.getFullYear() + 1); break;
      default: break;
    }
    if (next <= current) break;
    current = next;
  }

  if (end && current > end) return 'Expired';
  return current.toISOString().split('T')[0];
}

export const RecurringPage = () => {
  const {
    recurringRules,
    toggleRecurringRule,
    deleteRecurringRule,
    processRecurringTransactions,
    formatAmount,
  } = useFinance();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ruleToEdit, setRuleToEdit] = useState(null);
  const [ruleToDelete, setRuleToDelete] = useState(null);

  const handleOpenAdd = () => {
    setRuleToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rule) => {
    setRuleToEdit(rule);
    setIsModalOpen(true);
  };

  const handleToggle = (id) => {
    toggleRecurringRule(id);
    showToast('Rule status updated', 'info');
  };

  const handleConfirmDelete = () => {
    if (ruleToDelete) {
      deleteRecurringRule(ruleToDelete.id);
      showToast('Recurring rule deleted', 'info');
      setRuleToDelete(null);
    }
  };

  const handleProcessNow = () => {
    processRecurringTransactions();
    showToast('Transactions synchronized up to today', 'success');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('recurringTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('recurringDesc')}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleProcessNow}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-subtle transition-colors"
            title="Evaluate and post any pending transactions up to today"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('recProcessNow')}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-subtle transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('addRecurring')}</span>
          </button>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-subtle">
        {recurringRules && recurringRules.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3">Rule / Description</th>
                  <th className="px-4 py-3">Frequency</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3">Next Due</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recurringRules.map((rule) => {
                  const catMeta = CATEGORIES.find((c) => c.id === rule.category);
                  const catName = catMeta ? t(catMeta.nameKey) : rule.category;
                  const isIncome = rule.type === 'income';
                  const nextDue = computeNextDue(rule);

                  return (
                    <tr
                      key={rule.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-850/40 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center space-x-2.5">
                          <div
                            className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                              isIncome
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                            }`}
                          >
                            <Repeat className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              {rule.title}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {catName} {rule.description ? `• ${rule.description}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="capitalize px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {rule.frequency}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 dark:text-slate-400 text-xs">
                        {rule.paymentMethod || 'Other'}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {nextDue === 'Paused' || nextDue === 'Expired'
                          ? nextDue
                          : formatDateDisplay(nextDue, language === 'hi' ? 'hi-IN' : 'en-US')}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <button
                          onClick={() => handleToggle(rule.id)}
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                            rule.isActive
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 hover:bg-slate-200'
                          }`}
                        >
                          {rule.isActive ? (
                            <>
                              <Play className="w-2.5 h-2.5 fill-current" />
                              <span>{t('recActive')}</span>
                            </>
                          ) : (
                            <>
                              <Pause className="w-2.5 h-2.5 fill-current" />
                              <span>{t('recPaused')}</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="px-5 py-3.5 text-right whitespace-nowrap font-mono font-bold tabular-nums text-sm">
                        <span
                          className={
                            isIncome
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-900 dark:text-slate-100'
                          }
                        >
                          {isIncome ? '+' : '-'}
                          {formatAmount(rule.amount)}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenEdit(rule)}
                            className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title={t('edit')}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setRuleToDelete(rule)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title={t('delete')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 px-4 text-center space-y-2">
            <Repeat className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t('noRecurringRules')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {t('noRecurringDesc')}
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-2 px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold shadow-subtle"
            >
              {t('addRecurring')}
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Recurring Modal */}
      <RecurringModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ruleToEdit={ruleToEdit}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!ruleToDelete}
        onClose={() => setRuleToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={t('deleteRecurring')}
        message={t('confirmDeleteRecurring')}
        confirmText={t('delete')}
        isDestructive={true}
      />
    </div>
  );
};
