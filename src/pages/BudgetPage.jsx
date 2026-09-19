import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  PieChart,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { CATEGORIES } from '../constants/initialData';
import { BudgetModal } from '../components/BudgetModal';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const BudgetPage = () => {
  const {
    budgets,
    deleteBudget,
    getCategorySpentCurrentMonth,
    formatAmount,
  } = useFinance();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState(null);
  const [budgetToDelete, setBudgetToDelete] = useState(null);

  const budgetStats = useMemo(() => {
    let totalBudgeted = 0;
    let totalSpent = 0;

    budgets.forEach((b) => {
      totalBudgeted += Number(b.amount) || 0;
      totalSpent += getCategorySpentCurrentMonth(b.category);
    });

    const remaining = Math.max(0, totalBudgeted - totalSpent);
    const overallPercent =
      totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;

    return {
      totalBudgeted,
      totalSpent,
      remaining,
      overallPercent,
    };
  }, [budgets, getCategorySpentCurrentMonth]);

  const handleOpenAdd = () => {
    setBudgetToEdit(null);
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (budget) => {
    setBudgetToEdit(budget);
    setIsAddEditOpen(true);
  };

  const handleConfirmDelete = () => {
    if (budgetToDelete) {
      deleteBudget(budgetToDelete.id);
      showToast('Budget deleted successfully', 'info');
      setBudgetToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('monthlyBudget')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Current month category spend allowances & thresholds
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-subtle transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('addBudget')}</span>
        </button>
      </div>

      {/* Aggregate Overview Strip */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-subtle">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
          <div className="space-y-1 sm:pr-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {t('totalBudgeted')}
            </span>
            <p className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {formatAmount(budgetStats.totalBudgeted)}
            </p>
            <span className="text-[11px] text-slate-500 block">Across {budgets.length} budgeted categories</span>
          </div>

          <div className="space-y-1 sm:px-4 pt-3 sm:pt-0">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {t('totalBudgetSpent')}
            </span>
            <p className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {formatAmount(budgetStats.totalSpent)}
            </p>
            <div className="mt-1.5 w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  budgetStats.overallPercent >= 100
                    ? 'bg-rose-600'
                    : budgetStats.overallPercent >= 80
                    ? 'bg-amber-500'
                    : 'bg-slate-900 dark:bg-slate-200'
                } rounded-full`}
                style={{ width: `${Math.min(100, budgetStats.overallPercent)}%` }}
              />
            </div>
          </div>

          <div className="space-y-1 sm:pl-4 pt-3 sm:pt-0">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {t('remainingAmount')}
            </span>
            <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatAmount(budgetStats.remaining)}
            </p>
            <span className="text-[11px] text-slate-500 block">
              {budgetStats.overallPercent}% total budget utilized
            </span>
          </div>
        </div>
      </div>

      {/* Structured Category Allowances List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-subtle">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Category Allocations
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Live utilization calculated against this month's recorded transactions
          </p>
        </div>

        {budgets.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {budgets.map((b) => {
              const spent = getCategorySpentCurrentMonth(b.category);
              const percentage = Math.round((spent / b.amount) * 100) || 0;
              const remaining = b.amount - spent;
              const isOverBudget = spent > b.amount;
              const isWarning = percentage >= 80 && !isOverBudget;

              const catMeta = CATEGORIES.find((c) => c.id === b.category);
              const categoryName = catMeta ? t(catMeta.nameKey) : b.category;

              let barColor = 'bg-slate-900 dark:bg-slate-100';
              let badge = (
                <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {percentage}% used
                </span>
              );

              if (isOverBudget) {
                barColor = 'bg-rose-600';
                badge = (
                  <span className="inline-flex items-center space-x-1 text-[10px] font-medium px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Over by {formatAmount(Math.abs(remaining))}</span>
                  </span>
                );
              } else if (isWarning) {
                barColor = 'bg-amber-500';
                badge = (
                  <span className="inline-flex items-center space-x-1 text-[10px] font-medium px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{percentage}% spent</span>
                  </span>
                );
              }

              return (
                <div
                  key={b.id}
                  className="p-4 sm:px-5 hover:bg-slate-50/60 dark:hover:bg-slate-850/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {categoryName}
                        </span>
                        {badge}
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-2.5 w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${barColor} rounded-full transition-all duration-300`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                        <span>Spent: {formatAmount(spent)}</span>
                        <span>
                          {isOverBudget
                            ? 'Limit Exceeded'
                            : `${formatAmount(remaining)} remaining`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end space-x-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                          Monthly Limit
                        </span>
                        <span className="text-sm font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                          {formatAmount(b.amount)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title={t('edit')}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setBudgetToDelete(b)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title={t('delete')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 px-4 text-center space-y-2">
            <PieChart className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              No budgets established
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Set monthly spending targets on essential categories to stay in control of your outflows.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-2 px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold shadow-subtle"
            >
              {t('addBudget')}
            </button>
          </div>
        )}
      </div>

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        budgetToEdit={budgetToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!budgetToDelete}
        onClose={() => setBudgetToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={t('deleteBudget')}
        message={t('confirmDeleteBudget')}
        confirmText={t('delete')}
        isDestructive={true}
      />
    </div>
  );
};
