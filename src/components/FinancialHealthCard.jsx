import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';
import { Activity, TrendingUp, TrendingDown, CheckCircle, AlertCircle } from 'lucide-react';

export const FinancialHealthCard = () => {
  const { financialHealth, formatAmount } = useFinance();
  const { t } = useLanguage();

  const {
    monthIncome,
    monthExpense,
    monthCashFlow,
    savingsRate,
    expenseRatio,
    budgetUsage,
    goalProgress,
  } = financialHealth;

  // Transparent overall health score calculated from the 4 primary ratios (0 - 100)
  // Savings Rate (up to 30 pts for 20%+ savings)
  const savingsScore = Math.min(30, (savingsRate / 20) * 30);
  // Budget Adherence (up to 30 pts if budget usage is <= 100%, drops as it exceeds 100%)
  const budgetScore = budgetUsage <= 100 ? Math.max(0, 30 - (budgetUsage > 80 ? (budgetUsage - 80) : 0)) : Math.max(0, 30 - (budgetUsage - 100));
  // Positive Cashflow (up to 20 pts)
  const cashflowScore = monthCashFlow > 0 ? 20 : Math.max(0, 20 + (monthCashFlow / 1000));
  // Goal Progress (up to 20 pts)
  const goalScore = (goalProgress / 100) * 20;

  const totalScore = Math.round(Math.min(100, Math.max(0, savingsScore + budgetScore + cashflowScore + goalScore)));

  const getScoreBadge = (score) => {
    if (score >= 80) return { label: 'Strong', color: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800' };
    if (score >= 60) return { label: 'Healthy', color: 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800' };
    if (score >= 40) return { label: 'Moderate', color: 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800' };
    return { label: 'Needs Attention', color: 'text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800' };
  };

  const badge = getScoreBadge(totalScore);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-subtle space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {t('financialHealthTitle')}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${badge.color}`}>
            {badge.label} • {totalScore}/100
          </span>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Savings Rate */}
        <div className="p-3 bg-slate-50 dark:bg-slate-850/60 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>{t('fhSavingsRate')}</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{Math.round(savingsRate)}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 dark:bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">{t('fhSavingsRateDesc')}</p>
        </div>

        {/* Expense Ratio */}
        <div className="p-3 bg-slate-50 dark:bg-slate-850/60 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>{t('fhExpenseRatio')}</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{Math.round(expenseRatio)}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                expenseRatio > 80 ? 'bg-rose-500' : 'bg-slate-700 dark:bg-slate-300'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, expenseRatio))}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">{t('fhExpenseRatioDesc')}</p>
        </div>

        {/* Budget Usage */}
        <div className="p-3 bg-slate-50 dark:bg-slate-850/60 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>{t('fhBudgetUsage')}</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{Math.round(budgetUsage)}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                budgetUsage > 100 ? 'bg-rose-500' : budgetUsage > 80 ? 'bg-amber-500' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, budgetUsage))}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">{t('fhBudgetUsageDesc')}</p>
        </div>

        {/* Monthly Cash Flow */}
        <div className="p-3 bg-slate-50 dark:bg-slate-850/60 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>{t('fhCashFlow')}</span>
            <span className={`font-mono font-bold ${monthCashFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
              {monthCashFlow >= 0 ? '+' : ''}{formatAmount(monthCashFlow)}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${monthCashFlow >= 0 ? 'bg-emerald-600' : 'bg-rose-500'}`}
              style={{ width: `${monthCashFlow >= 0 ? Math.min(100, (monthCashFlow / (monthIncome || 1)) * 100) : 100}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">Inflow minus outflow this month</p>
        </div>
      </div>

      {/* Goal Progress & Explanation */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center space-x-2">
          <span>{t('fhGoalProgress')}:</span>
          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{Math.round(goalProgress)}% complete</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span>Inflow: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">+{formatAmount(monthIncome)}</span></span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span>Outflow: <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">-{formatAmount(monthExpense)}</span></span>
        </div>
        <p className="text-[11px] text-slate-400">
          Calculated transparently from your current month cashflow and target savings.
        </p>
      </div>
    </div>
  );
};
