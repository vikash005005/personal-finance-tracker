import React, { useMemo } from 'react';
import {
  Plus,
  ArrowUpRight,
  Receipt,
  Paperclip,
  Edit2,
  Trash2,
  Calendar,
  Clock,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';
import { CATEGORIES } from '../constants/initialData';

export const CalendarDateDetails = ({
  selectedDate,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onViewReceipt,
}) => {
  const { transactions, formatAmount } = useFinance();
  const { t, language } = useLanguage();

  // Transactions on this exact date
  const dayTransactions = useMemo(() => {
    if (!selectedDate) return [];
    return transactions.filter((tx) => tx.date === selectedDate);
  }, [transactions, selectedDate]);

  // Daily totals
  const dayTotals = useMemo(() => {
    let income = 0;
    let expense = 0;
    dayTransactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'income') income += amt;
      else expense += amt;
    });
    return {
      income,
      expense,
      net: income - expense,
    };
  }, [dayTransactions]);

  // Formatted date string (e.g., September 9, 2026)
  const formattedDate = useMemo(() => {
    if (!selectedDate) return '';
    try {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      }
      return selectedDate;
    } catch {
      return selectedDate;
    }
  }, [selectedDate, language]);

  const weekdayName = useMemo(() => {
    if (!selectedDate) return '';
    try {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
          weekday: 'long',
        });
      }
      return '';
    } catch {
      return '';
    }
  }, [selectedDate, language]);

  if (!selectedDate) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center text-xs text-slate-400 space-y-2 shadow-subtle">
        <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
        <p className="font-medium text-slate-600 dark:text-slate-300">No Date Selected</p>
        <p className="text-[11px]">Click any calendar date to inspect transactions and cashflow.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-subtle space-y-4">
      {/* Header: Date + Quick Action */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>{weekdayName}</span>
            <span>•</span>
            <span>
              {dayTransactions.length}{' '}
              {dayTransactions.length === 1 ? 'transaction' : 'transactions'}
            </span>
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 tracking-tight">
            {formattedDate}
          </h4>
        </div>

        <button
          onClick={() => onAddTransaction(selectedDate)}
          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-subtle transition-colors flex-shrink-0"
          title="Add transaction on this date"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('addTransactionForDate')}</span>
          <span className="sm:hidden">{t('addTransaction')}</span>
        </button>
      </div>

      {/* Daily Cashflow Summary Strip */}
      <div className="bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            {t('totalIncome')}
          </span>
          <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
            +{formatAmount(dayTotals.income)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            {t('totalExpenses')}
          </span>
          <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">
            -{formatAmount(dayTotals.expense)}
          </span>
        </div>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
          <span className="text-slate-800 dark:text-slate-200">{t('netAmount')}</span>
          <span
            className={`font-mono ${
              dayTotals.net >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {dayTotals.net >= 0 ? '+' : ''}
            {formatAmount(dayTotals.net)}
          </span>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {t('numTransactions')} ({dayTransactions.length})
          </h5>
        </div>

        {dayTransactions.length > 0 ? (
          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-0.5">
            {dayTransactions.map((tx) => {
              const catMeta = CATEGORIES.find((c) => c.id === tx.category);
              const catName = catMeta ? t(catMeta.nameKey) : tx.category;
              const isIncome = tx.type === 'income';

              return (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-subtle space-y-2"
                >
                  {/* Row 1: Title and Amount */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                          isIncome
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                        }`}
                      >
                        {isIncome ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <Receipt className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                      <p className="font-semibold text-xs text-slate-900 dark:text-slate-100 leading-snug">
                        {tx.title}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span
                        className={`font-mono font-bold text-xs sm:text-sm tabular-nums ${
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

                  {/* Row 2: Metadata (Category • Payment Method • Time • Receipt) */}
                  <div className="flex items-center flex-wrap gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pl-8">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {catName}
                    </span>
                    <span>•</span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {tx.paymentMethod || 'Other'}
                    </span>

                    {tx.time && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-[10px] text-slate-400 flex items-center space-x-0.5">
                          <Clock className="w-2.5 h-2.5 inline mr-0.5" />
                          <span>{tx.time}</span>
                        </span>
                      </>
                    )}

                    {tx.receiptUrl && (
                      <>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() =>
                            onViewReceipt({
                              url: tx.receiptUrl,
                              title: tx.title,
                              date: tx.date,
                              amount: tx.amount,
                            })
                          }
                          className="inline-flex items-center space-x-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                          title={t('viewReceipt')}
                        >
                          <Paperclip className="w-3 h-3" />
                          <span>{t('receipt')}</span>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Row 3: Description if present */}
                  {tx.description && (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2 pl-8">
                      {tx.description}
                    </p>
                  )}

                  {/* Row 4: Actions (Edit & Delete) */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs pl-8">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                      {tx.type}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onEditTransaction(tx)}
                        className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title={t('edit')}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTransaction(tx)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title={t('delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State when no transactions on this date */
          <div className="py-7 px-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2.5 bg-slate-50/40 dark:bg-slate-900/40">
            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {t('noTransactionsOnDate')}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {t('noTransactionsOnDateDesc')}
              </p>
            </div>
            <button
              onClick={() => onAddTransaction(selectedDate)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-subtle transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('addTransactionForDate')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
