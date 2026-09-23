import React from 'react';
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { CATEGORIES, PAYMENT_METHODS } from '../constants/initialData';
import { useLanguage } from '../context/LanguageContext';
import { useFinance } from '../context/FinanceContext';

export const AdvancedFilterDrawer = ({
  isOpen,
  onClose,
  typeFilter,
  setTypeFilter,
  categoryFilter,
  setCategoryFilter,
  paymentMethodFilter,
  setPaymentMethodFilter,
  startDateFilter,
  setStartDateFilter,
  endDateFilter,
  setEndDateFilter,
  minAmountFilter,
  setMinAmountFilter,
  maxAmountFilter,
  setMaxAmountFilter,
  searchQuery,
  setSearchQuery,
  onReset,
  totalMatching,
  totalCount,
}) => {
  const { t } = useLanguage();
  const { currency } = useFinance();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t('advancedFilters')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Transaction Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              {t('typeFilter')}
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`py-1 rounded text-center font-medium transition-colors ${
                  typeFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-subtle'
                    : 'text-slate-500'
                }`}
              >
                {t('all')}
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('income')}
                className={`py-1 rounded text-center font-medium transition-colors ${
                  typeFilter === 'income'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-subtle'
                    : 'text-slate-500'
                }`}
              >
                {t('income')}
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('expense')}
                className={`py-1 rounded text-center font-medium transition-colors ${
                  typeFilter === 'expense'
                    ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-subtle'
                    : 'text-slate-500'
                }`}
              >
                {t('expense')}
              </button>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
              {t('categoryFilter')}
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {t(cat.nameKey)}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
              {t('paymentMethod')}
            </label>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="all">All Payment Methods</option>
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range: From / To */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                {t('dateFrom')}
              </label>
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                {t('dateTo')}
              </label>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* Amount: Min / Max */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                {t('minAmount')}
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={minAmountFilter}
                onChange={(e) => setMinAmountFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                {t('maxAmount')}
              </label>
              <input
                type="number"
                min="0"
                placeholder="No limit"
                value={maxAmountFilter}
                onChange={(e) => setMaxAmountFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850/40">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('clearFilters')}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold shadow-subtle hover:bg-slate-800 dark:hover:bg-white transition-colors"
          >
            {t('showingOf')} {totalMatching} {t('of')} {totalCount} • {t('applyFilters')}
          </button>
        </div>
      </div>
    </div>
  );
};
