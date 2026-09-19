import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

export const StatCard = ({
  title,
  amount,
  change,
  isPositive = true,
  icon: Icon,
  colorScheme = 'indigo', // 'emerald', 'rose', 'indigo', 'amber'
  subtitle,
}) => {
  const schemeStyles = {
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-100 dark:border-emerald-900/50',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      indicator: 'text-emerald-600 dark:text-emerald-400',
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-100 dark:border-rose-900/50',
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      indicator: 'text-rose-600 dark:text-rose-400',
    },
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      border: 'border-indigo-100 dark:border-indigo-900/50',
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      indicator: 'text-indigo-600 dark:text-indigo-400',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-100 dark:border-amber-900/50',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      indicator: 'text-amber-600 dark:text-amber-400',
    },
  };

  const currentScheme = schemeStyles[colorScheme] || schemeStyles.indigo;

  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${currentScheme.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {amount}
        </h3>
      </div>

      <div className="mt-3 flex items-center text-xs font-medium space-x-1.5">
        {change && (
          <div
            className={`flex items-center space-x-0.5 px-2 py-0.5 rounded-md ${
              isPositive
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            <span>{change}</span>
          </div>
        )}
        {subtitle && <span className="text-slate-500 dark:text-slate-400">{subtitle}</span>}
      </div>
    </div>
  );
};
