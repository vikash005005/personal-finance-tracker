import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ArrowRight,
  ShieldCheck,
  Coins,
  Receipt,
  SlidersHorizontal,
  Paperclip,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES } from '../constants/initialData';
import { TransactionModal } from '../components/TransactionModal';
import { AddSavingsModal } from '../components/AddSavingsModal';
import { FinancialHealthCard } from '../components/FinancialHealthCard';
import { SmartAlertsBanner } from '../components/SmartAlertsBanner';
import { DashboardCustomizerModal } from '../components/DashboardCustomizerModal';
import { ReceiptViewModal } from '../components/ReceiptViewModal';
import { formatDateDisplay } from '../utils/formatters';

export const DashboardPage = () => {
  const {
    transactions,
    totalIncome,
    totalExpenses,
    currentBalance,
    totalSavings,
    savingsRate,
    formatAmount,
    monthlyChartData,
    budgets,
    savingsGoals,
    getCategorySpentCurrentMonth,
    dashboardConfig,
  } = useFinance();

  const { t, language } = useLanguage();
  const { isDark } = useTheme();

  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [selectedGoalForSavings, setSelectedGoalForSavings] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Latest 6 transactions for the ledger
  const recentTransactions = transactions.slice(0, 6);
  // Primary goal for spotlight
  const primaryGoal = savingsGoals[0];

  // Recharts styling tokens
  const axisColor = isDark ? '#64748b' : '#94a3b8';
  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const tooltipBg = isDark ? '#090d16' : '#ffffff';
  const tooltipBorder = isDark ? '#1e293b' : '#e2e8f0';

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: tooltipBg,
            borderColor: tooltipBorder,
          }}
          className="p-3 rounded-lg border shadow-lg text-xs space-y-1.5 z-50 font-sans"
        >
          {label && <p className="font-semibold text-slate-900 dark:text-slate-100">{label}</p>}
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.fill || entry.color }}
                />
                <span className="text-slate-500 capitalize">{entry.name}:</span>
              </div>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {formatAmount(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const showSummaryCard =
    dashboardConfig?.balance ||
    dashboardConfig?.income ||
    dashboardConfig?.expenses ||
    dashboardConfig?.savings;

  return (
    <div className="space-y-6">
      {/* Top Action Bar: Customize Dashboard & Quick Add */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Financial Cockpit
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time balance, cash flow, and activity overview
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCustomizerOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-subtle transition-colors"
            title={t('customizeDashboard')}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">{t('customizeDashboard')}</span>
          </button>

          <button
            onClick={() => setIsAddTxOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-subtle transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('addTransaction')}</span>
          </button>
        </div>
      </div>

      {/* 1. Smart Alerts Banner */}
      {dashboardConfig?.smartAlerts && <SmartAlertsBanner />}

      {/* 2. Primary Financial Health Header Block */}
      {showSummaryCard && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:p-6 shadow-subtle">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Main Net Balance */}
            {dashboardConfig?.balance && (
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                    {t('currentBalance')}
                  </span>
                  <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                    Active Ledger
                  </span>
                </div>

                <div className="mt-2 flex items-baseline space-x-3">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums tracking-tight">
                    {formatAmount(currentBalance)}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Net available liquidity across checking and savings
                </p>
              </div>
            )}

            {/* Inline Cashflow Columns */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 pt-4 lg:pt-0 lg:pl-6">
              {/* Total Inflow */}
              {dashboardConfig?.income && (
                <div className="space-y-0.5 min-w-[120px]">
                  <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 text-xs">
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('totalIncome')}</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                    +{formatAmount(totalIncome)}
                  </p>
                  <span className="text-[10px] text-slate-400 block">Total recorded inflow</span>
                </div>
              )}

              {/* Total Outflow */}
              {dashboardConfig?.expenses && (
                <div className="space-y-0.5 min-w-[120px]">
                  <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 text-xs">
                    <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
                    <span>{t('totalExpenses')}</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                    -{formatAmount(totalExpenses)}
                  </p>
                  <span className="text-[10px] text-slate-400 block">Total recorded outflow</span>
                </div>
              )}

              {/* Savings Rate Ratio */}
              {dashboardConfig?.savings && (
                <div className="space-y-0.5 min-w-[110px]">
                  <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t('savingsRate')}</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                    {savingsRate.toFixed(1)}%
                  </p>
                  <span className="text-[10px] text-slate-400 block">
                    {savingsRate >= 20 ? 'Target achieved (>20%)' : 'Below 20% benchmark'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Monthly Inflow & Outflow Analytics Chart */}
      {dashboardConfig?.cashflowChart && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('incomeVsExpense')}
              </h3>
              <p className="text-xs text-slate-400">Monthly cash inflow and expenditure comparison</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
                <span className="text-slate-600 dark:text-slate-400">Income</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-600" />
                <span className="text-slate-600 dark:text-slate-400">Expense</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="month" stroke={axisColor} fontSize={11} tickLine={false} />
                <YAxis
                  stroke={axisColor}
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => (val >= 1000 ? `₹${val / 1000}k` : `₹${val}`)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income" name="Income" fill="#16a34a" radius={[2, 2, 0, 0]} maxBarSize={28} />
                <Bar dataKey="expense" name="Expense" fill="#dc2626" radius={[2, 2, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 4. Financial Health Analysis Section */}
      {dashboardConfig?.financialHealth && <FinancialHealthCard />}

      {/* 5. Two-Column Functional Split: Ledger Activity vs Budget & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Recent Activity Ledger (2 Cols) */}
        {dashboardConfig?.recentTransactions && (
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-subtle">
            <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('recentTransactions')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Latest bank, UPI & card transactions
                </p>
              </div>
              <Link
                to="/transactions"
                className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                <span>{t('viewAll')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentTransactions.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentTransactions.map((tx) => {
                  const catMeta = CATEGORIES.find((c) => c.id === tx.category);
                  const catName = catMeta ? t(catMeta.nameKey) : tx.category;
                  const isIncome = tx.type === 'income';

                  return (
                    <div
                      key={tx.id}
                      className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-850/40 transition-colors"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                            isIncome
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {isIncome ? (
                            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Receipt className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">
                            {tx.title}
                          </p>
                          <div className="flex items-center space-x-2 mt-0.5 text-[11px] text-slate-400">
                            <span>
                              {formatDateDisplay(tx.date, language === 'hi' ? 'hi-IN' : 'en-US')}
                            </span>
                            <span>•</span>
                            <span className="font-medium text-slate-500 dark:text-slate-400">
                              {catName}
                            </span>
                            <span>•</span>
                            <span className="text-slate-500 dark:text-slate-400">
                              {tx.paymentMethod || 'Other'}
                            </span>
                            {tx.receiptUrl && (
                              <button
                                onClick={() => setSelectedReceipt({
                                  url: tx.receiptUrl,
                                  title: tx.title,
                                  date: tx.date,
                                  amount: tx.amount,
                                })}
                                className="inline-flex items-center space-x-1 text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium ml-1"
                                title="View Receipt"
                              >
                                <Paperclip className="w-2.5 h-2.5" />
                                <span>Receipt</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 pl-3">
                        <span
                          className={`text-xs sm:text-sm font-bold font-mono tabular-nums ${
                            isIncome
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {isIncome ? '+' : '-'}
                          {formatAmount(tx.amount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                {t('noTransactionsYet')}
              </div>
            )}
          </div>
        )}

        {/* Right: Monthly Budget Status & Savings Spotlight (1 Col) */}
        <div className="space-y-6">
          {/* Monthly Budget Overview */}
          {dashboardConfig?.budgetOverview && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-subtle">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('budgetOverview')}
                  </h3>
                  <p className="text-[11px] text-slate-400">Monthly limits progress</p>
                </div>
                <Link
                  to="/budget"
                  className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  {t('viewAll')} →
                </Link>
              </div>

              <div className="space-y-3.5">
                {budgets.slice(0, 4).map((b) => {
                  const spent = getCategorySpentCurrentMonth(b.category);
                  const percent = Math.min(100, Math.round((spent / b.amount) * 100)) || 0;
                  const catMeta = CATEGORIES.find((c) => c.id === b.category);
                  const label = catMeta ? t(catMeta.nameKey) : b.category;

                  let barColor = 'bg-slate-900 dark:bg-slate-200';
                  let alertColor = 'text-slate-500';

                  if (percent >= 100) {
                    barColor = 'bg-rose-600';
                    alertColor = 'text-rose-600 dark:text-rose-400 font-semibold';
                  } else if (percent >= 80) {
                    barColor = 'bg-amber-500';
                    alertColor = 'text-amber-600 dark:text-amber-400 font-semibold';
                  }

                  return (
                    <div key={b.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {label}
                        </span>
                        <span className={`font-mono text-[11px] ${alertColor}`}>
                          {percent}%
                        </span>
                      </div>

                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>Spent: {formatAmount(spent)}</span>
                        <span>Limit: {formatAmount(b.amount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Primary Savings Goal Spotlight */}
          {dashboardConfig?.savingsGoals && primaryGoal && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-subtle">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Target Spotlight
                </span>
                <Link
                  to="/savings-goals"
                  className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  All Goals →
                </Link>
              </div>

              <div className="mt-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {primaryGoal.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Target date: {primaryGoal.targetDate}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {Math.round((primaryGoal.savedAmount / primaryGoal.targetAmount) * 100)}%
                  </span>
                </div>

                <div className="mt-2.5 w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((primaryGoal.savedAmount / primaryGoal.targetAmount) * 100)
                      )}%`,
                    }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                  <span>Saved: {formatAmount(primaryGoal.savedAmount)}</span>
                  <span>Target: {formatAmount(primaryGoal.targetAmount)}</span>
                </div>

                <button
                  onClick={() => setSelectedGoalForSavings(primaryGoal)}
                  className="mt-3.5 w-full flex items-center justify-center space-x-1.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t('addMoney')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <TransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
      />

      <AddSavingsModal
        isOpen={!!selectedGoalForSavings}
        onClose={() => setSelectedGoalForSavings(null)}
        goal={selectedGoalForSavings}
      />

      <DashboardCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
      />

      <ReceiptViewModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        receiptUrl={selectedReceipt?.url}
        transactionTitle={selectedReceipt?.title}
        date={selectedReceipt?.date}
        amount={selectedReceipt?.amount}
      />
    </div>
  );
};
