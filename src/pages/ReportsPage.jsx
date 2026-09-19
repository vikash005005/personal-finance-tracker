import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  PieChart as PieIcon,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES } from '../constants/initialData';

export const ReportsPage = () => {
  const { transactions, formatAmount } = useFinance();
  const { t } = useLanguage();
  const { isDark } = useTheme();

  const [timeRange, setTimeRange] = useState('thisMonth');

  const filteredTxs = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return transactions.filter((tx) => {
      const txDate = new Date(tx.date);

      if (timeRange === 'thisWeek') {
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);
        return txDate >= oneWeekAgo && txDate <= now;
      }
      if (timeRange === 'thisMonth') {
        return (
          txDate.getFullYear() === currentYear &&
          txDate.getMonth() === currentMonth
        );
      }
      if (timeRange === 'lastMonth') {
        const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
        return (
          txDate.getFullYear() === lastMonthDate.getFullYear() &&
          txDate.getMonth() === lastMonthDate.getMonth()
        );
      }
      if (timeRange === 'last6Months') {
        const sixMonthsAgo = new Date(currentYear, currentMonth - 5, 1);
        return txDate >= sixMonthsAgo;
      }
      if (timeRange === 'thisYear') {
        return txDate.getFullYear() === currentYear;
      }
      return true;
    });
  }, [transactions, timeRange]);

  const periodStats = useMemo(() => {
    let income = 0;
    let expenses = 0;

    filteredTxs.forEach((tx) => {
      const val = Number(tx.amount) || 0;
      if (tx.type === 'income') income += val;
      else if (tx.type === 'expense') expenses += val;
    });

    const netSavings = income - expenses;
    const rate = income > 0 ? ((income - expenses) / income) * 100 : 0;

    return {
      income,
      expenses,
      netSavings,
      rate: Math.max(0, rate),
    };
  }, [filteredTxs]);

  const categoryBreakdown = useMemo(() => {
    const catMap = {};
    let totalExpense = 0;

    filteredTxs
      .filter((t) => t.type === 'expense')
      .forEach((tx) => {
        const cat = tx.category || 'Other';
        const val = Number(tx.amount) || 0;
        catMap[cat] = (catMap[cat] || 0) + val;
        totalExpense += val;
      });

    return Object.entries(catMap)
      .map(([name, value]) => {
        const catMeta = CATEGORIES.find((c) => c.id === name);
        const percent = totalExpense > 0 ? ((value / totalExpense) * 100).toFixed(1) : 0;
        return {
          name,
          value,
          percent,
          color: catMeta ? catMeta.color : '#64748b',
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [filteredTxs]);

  const timelineData = useMemo(() => {
    const dateMap = {};
    filteredTxs.forEach((tx) => {
      const key = tx.date;
      if (!dateMap[key]) {
        dateMap[key] = { date: key, income: 0, expense: 0 };
      }
      if (tx.type === 'income') dateMap[key].income += Number(tx.amount) || 0;
      else if (tx.type === 'expense') dateMap[key].expense += Number(tx.amount) || 0;
    });

    return Object.values(dateMap).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [filteredTxs]);

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
          className="p-3 rounded-lg border shadow-lg text-xs space-y-1 z-50 font-sans"
        >
          {label && <p className="font-semibold text-slate-900 dark:text-white">{label}</p>}
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between space-x-3">
              <span className="text-slate-500 capitalize">{entry.name}:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                {formatAmount(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const timeOptions = [
    { key: 'thisWeek', label: 'This Week' },
    { key: 'thisMonth', label: t('thisMonth') },
    { key: 'lastMonth', label: t('lastMonth') },
    { key: 'last6Months', label: t('last6Months') },
    { key: 'thisYear', label: t('thisYear') },
  ];

  return (
    <div className="space-y-6">
      {/* Header and Filter Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('financialReports')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cashflow distribution & period performance statement
          </p>
        </div>

        {/* Time Filter Segmented Buttons */}
        <div className="flex items-center p-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-subtle overflow-x-auto">
          {timeOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setTimeRange(opt.key)}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                timeRange === opt.key
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold shadow-subtle'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Aggregate Metric Strip */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-subtle">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {t('totalIncome')}
            </span>
            <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              +{formatAmount(periodStats.income)}
            </p>
            <span className="text-[10px] text-slate-400 block">Period inflow</span>
          </div>

          <div className="space-y-0.5 pt-3 lg:pt-0 lg:pl-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {t('totalExpenses')}
            </span>
            <p className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
              -{formatAmount(periodStats.expenses)}
            </p>
            <span className="text-[10px] text-slate-400 block">Period outflow</span>
          </div>

          <div className="space-y-0.5 pt-3 lg:pt-0 lg:pl-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {t('netCashflow')}
            </span>
            <p className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {formatAmount(periodStats.netSavings)}
            </p>
            <span className="text-[10px] text-slate-400 block">Net period delta</span>
          </div>

          <div className="space-y-0.5 pt-3 lg:pt-0 lg:pl-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {t('savingsRate')}
            </span>
            <p className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {periodStats.rate.toFixed(1)}%
            </p>
            <span className="text-[10px] text-slate-400 block">Retained income share</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('monthlyTrends')}
            </h3>
            <span className="text-xs text-slate-400 font-mono">Daily Inflow / Outflow</span>
          </div>

          <div className="h-64 w-full">
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="date" stroke={axisColor} fontSize={10} tickLine={false} />
                  <YAxis
                    stroke={axisColor}
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(val) => (val >= 1000 ? `₹${val / 1000}k` : `₹${val}`)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="income" name="Income" fill="#16a34a" radius={[2, 2, 0, 0]} maxBarSize={24} />
                  <Bar dataKey="expense" name="Expense" fill="#dc2626" radius={[2, 2, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No activity records found in selected period.
              </div>
            )}
          </div>
        </div>

        {/* Expense Category Breakdown (1 Col) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('expenseBreakdown')}
              </h3>
            </div>

            <div className="h-44 w-full relative flex items-center justify-center">
              {categoryBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-slate-400">No outflow records.</div>
              )}
            </div>

            {/* Category breakdown list */}
            <div className="space-y-2 mt-3 max-h-44 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {categoryBreakdown.map((c) => {
                const catMeta = CATEGORIES.find((meta) => meta.id === c.name);
                const label = catMeta ? t(catMeta.nameKey) : c.name;

                return (
                  <div key={c.name} className="flex items-center justify-between pt-1.5 text-xs font-mono tabular-nums">
                    <div className="flex items-center space-x-2 font-sans">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 font-sans text-[11px]">{c.percent}%</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatAmount(c.value)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Health Assessment */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              {t('financialHealth')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              {periodStats.rate >= 20 ? t('excellentHealth') : t('fairHealth')}
            </p>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white self-stretch sm:self-auto text-center tabular-nums">
          Retention: {periodStats.rate.toFixed(1)}%
        </div>
      </div>
    </div>
  );
};
