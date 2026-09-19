import React, { useState } from 'react';
import {
  Plus,
  Coins,
  Edit2,
  Trash2,
  Calendar,
  CheckCircle2,
  Target,
  Trophy,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { GoalModal } from '../components/GoalModal';
import { AddSavingsModal } from '../components/AddSavingsModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { formatDateDisplay } from '../utils/formatters';

export const SavingsGoalsPage = () => {
  const {
    savingsGoals,
    deleteSavingsGoal,
    formatAmount,
    totalSavings,
  } = useFinance();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState(null);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [goalToAddSavings, setGoalToAddSavings] = useState(null);

  const handleOpenAdd = () => {
    setGoalToEdit(null);
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (goal) => {
    setGoalToEdit(goal);
    setIsAddEditOpen(true);
  };

  const handleConfirmDelete = () => {
    if (goalToDelete) {
      deleteSavingsGoal(goalToDelete.id);
      showToast('Savings goal deleted successfully', 'info');
      setGoalToDelete(null);
    }
  };

  const totalTargetAmount = savingsGoals.reduce(
    (sum, g) => sum + (Number(g.targetAmount) || 0),
    0
  );
  const totalSavedSoFar = savingsGoals.reduce(
    (sum, g) => sum + (Number(g.savedAmount) || 0),
    0
  );
  const overallSavingsRate =
    totalTargetAmount > 0
      ? Math.round((totalSavedSoFar / totalTargetAmount) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('savingsGoalsTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dedicated capital milestones & reserve targets
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-subtle transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('addGoal')}</span>
        </button>
      </div>

      {/* Aggregate Status Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-subtle">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Accumulated Capital
            </span>
            <p className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
              {formatAmount(totalSavedSoFar)}
            </p>
            <span className="text-xs text-slate-500 block mt-0.5">
              Target across all goals: {formatAmount(totalTargetAmount)}
            </span>
          </div>

          <div className="sm:col-span-2 space-y-1.5 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-3 sm:pt-0 sm:pl-6">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600 dark:text-slate-400">
                Portfolio Completion
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                {overallSavingsRate}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-900 dark:bg-slate-100 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, overallSavingsRate)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div>
        {savingsGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {savingsGoals.map((g) => {
              const percentage =
                g.targetAmount > 0
                  ? Math.min(100, Math.round((g.savedAmount / g.targetAmount) * 100))
                  : 0;
              const remaining = Math.max(0, g.targetAmount - g.savedAmount);
              const isCompleted = g.savedAmount >= g.targetAmount;

              return (
                <div
                  key={g.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-subtle hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col justify-between space-y-4"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {g.name}
                        </h4>
                        {g.targetDate && (
                          <div className="flex items-center space-x-1 text-[11px] text-slate-400 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            <span>
                              Target: {formatDateDisplay(g.targetDate, language === 'hi' ? 'hi-IN' : 'en-US')}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenEdit(g)}
                          className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title={t('edit')}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setGoalToDelete(g)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title={t('delete')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="mt-2.5">
                      {isCompleted ? (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Milestone Achieved</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {percentage}% saved
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 space-y-1.5">
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted ? 'bg-emerald-600' : 'bg-slate-900 dark:bg-slate-200'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <div className="flex items-baseline justify-between font-mono text-xs tabular-nums">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans">Accumulated</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {formatAmount(g.savedAmount)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-sans">Target</span>
                          <span className="text-slate-500 dark:text-slate-400">
                            {formatAmount(g.targetAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Add Funds Button */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setGoalToAddSavings(g)}
                      className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-subtle transition-colors"
                    >
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      <span>{t('addMoney')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 px-4 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
            <Target className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              No savings goals established
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Create targets for your emergency fund, equipment purchases, or family holidays.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-2 px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold shadow-subtle"
            >
              {t('addGoal')}
            </button>
          </div>
        )}
      </div>

      {/* Goal Add / Edit Modal */}
      <GoalModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        goalToEdit={goalToEdit}
      />

      {/* Add Funds Modal */}
      <AddSavingsModal
        isOpen={!!goalToAddSavings}
        onClose={() => setGoalToAddSavings(null)}
        goal={goalToAddSavings}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!goalToDelete}
        onClose={() => setGoalToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={t('deleteGoal')}
        message={t('confirmDeleteGoal')}
        confirmText={t('delete')}
        isDestructive={true}
      />
    </div>
  );
};
