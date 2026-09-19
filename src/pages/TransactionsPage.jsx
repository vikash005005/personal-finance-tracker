import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Download,
  Edit2,
  Trash2,
  ArrowUpRight,
  Receipt,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { CATEGORIES } from '../constants/initialData';
import { TransactionModal } from '../components/TransactionModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { formatDateDisplay } from '../utils/formatters';
import { exportTransactionsToCsv } from '../utils/exportCsv';

export const TransactionsPage = () => {
  const {
    transactions,
    deleteTransaction,
    formatAmount,
  } = useFinance();
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [typeFilter, setTypeFilter] = useState('all'); // all | income | expense
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('allTime');
  const [sortBy, setSortBy] = useState('dateNewest');

  // Modal States
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState(null);
  const [txToDelete, setTxToDelete] = useState(null);

  useEffect(() => {
    const urlQuery = searchParams.get('search');
    if (urlQuery !== null && urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
    }
  }, [searchParams]);

  // Filtering and Sorting
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return transactions
      .filter((tx) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = (tx.title || '').toLowerCase().includes(q);
          const matchDesc = (tx.description || '').toLowerCase().includes(q);
          const matchCat = (tx.category || '').toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCat) return false;
        }

        if (typeFilter !== 'all' && tx.type !== typeFilter) {
          return false;
        }

        if (categoryFilter !== 'all' && tx.category !== categoryFilter) {
          return false;
        }

        if (dateFilter !== 'allTime') {
          const txDate = new Date(tx.date);
          if (dateFilter === 'thisMonth') {
            if (
              txDate.getFullYear() !== currentYear ||
              txDate.getMonth() !== currentMonth
            )
              return false;
          } else if (dateFilter === 'lastMonth') {
            const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
            if (
              txDate.getFullYear() !== lastMonthDate.getFullYear() ||
              txDate.getMonth() !== lastMonthDate.getMonth()
            )
              return false;
          } else if (dateFilter === 'last6Months') {
            const sixMonthsAgo = new Date(currentYear, currentMonth - 5, 1);
            if (txDate < sixMonthsAgo) return false;
          } else if (dateFilter === 'thisYear') {
            if (txDate.getFullYear() !== currentYear) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'dateNewest') return new Date(b.date) - new Date(a.date);
        if (sortBy === 'dateOldest') return new Date(a.date) - new Date(b.date);
        if (sortBy === 'amountHigh') return b.amount - a.amount;
        if (sortBy === 'amountLow') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, searchQuery, typeFilter, categoryFilter, dateFilter, sortBy]);

  const handleOpenAdd = () => {
    setTransactionToEdit(null);
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (tx) => {
    setTransactionToEdit(tx);
    setIsAddEditOpen(true);
  };

  const handleConfirmDelete = () => {
    if (txToDelete) {
      deleteTransaction(txToDelete.id);
      showToast('Transaction deleted successfully', 'info');
      setTxToDelete(null);
    }
  };

  const handleExportCsv = () => {
    const success = exportTransactionsToCsv(filteredTransactions, 'financetrack-statement.csv');
    if (success) {
      showToast('Account statement exported to CSV', 'success');
    } else {
      showToast('No records to export', 'warning');
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setDateFilter('allTime');
    setSortBy('dateNewest');
    setSearchParams({});
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    typeFilter !== 'all' ||
    categoryFilter !== 'all' ||
    dateFilter !== 'allTime' ||
    sortBy !== 'dateNewest';

  return (
    <div className="space-y-5">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('allTransactions')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Official cash inflow and outflow statement
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-subtle transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('exportCsv')}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-subtle transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('addTransaction')}</span>
          </button>
        </div>
      </div>

      {/* Structured Ledger Filter Strip */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-subtle space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Segmented Type Control */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg w-full md:w-auto">
            <button
              onClick={() => setTypeFilter('all')}
              className={`flex-1 md:flex-initial px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                typeFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-subtle font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`flex-1 md:flex-initial px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                typeFilter === 'income'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-subtle font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Credits (+Inflow)
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`flex-1 md:flex-initial px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                typeFilter === 'expense'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-subtle font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Debits (-Outflow)
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search merchant, notes or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-slate-400 text-slate-900 dark:text-white"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex items-center space-x-2 w-full md:w-auto">
            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex-1 md:flex-initial px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {t(cat.nameKey)}
                </option>
              ))}
            </select>

            {/* Date Range Dropdown */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="flex-1 md:flex-initial px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="allTime">{t('allTime')}</option>
              <option value="thisMonth">{t('thisMonth')}</option>
              <option value="lastMonth">{t('lastMonth')}</option>
              <option value="last6Months">{t('last6Months')}</option>
              <option value="thisYear">{t('thisYear')}</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 md:flex-initial px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="dateNewest">Newest first</option>
              <option value="dateOldest">Oldest first</option>
              <option value="amountHigh">Highest amount</option>
              <option value="amountLow">Lowest amount</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">
              Showing {filteredTransactions.length} of {transactions.length} entries
            </span>
            <button
              onClick={clearAllFilters}
              className="flex items-center space-x-1 text-slate-700 dark:text-slate-300 hover:text-slate-900 font-medium"
            >
              <X className="w-3 h-3" />
              <span>Clear filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-subtle">
        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3">Description / Merchant</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTransactions.map((tx) => {
                  const catMeta = CATEGORIES.find((c) => c.id === tx.category);
                  const catName = catMeta ? t(catMeta.nameKey) : tx.category;
                  const isIncome = tx.type === 'income';

                  return (
                    <tr
                      key={tx.id}
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
                            {isIncome ? (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            ) : (
                              <Receipt className="w-3 h-3 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              {tx.title}
                            </p>
                            {tx.description && (
                              <p className="text-[11px] text-slate-400 line-clamp-1">
                                {tx.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {catName}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {formatDateDisplay(tx.date, language === 'hi' ? 'hi-IN' : 'en-US')}
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
                          {formatAmount(tx.amount)}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenEdit(tx)}
                            className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title={t('edit')}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setTxToDelete(tx)}
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
            <Receipt className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              No transactions found
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {hasActiveFilters
                ? 'Try adjusting your filters or clearing search terms to find what you are looking for.'
                : 'Add your first transaction to start tracking your income and expenses.'}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearAllFilters}
                className="mt-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Clear all filters
              </button>
            ) : (
              <button
                onClick={handleOpenAdd}
                className="mt-2 px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold shadow-subtle"
              >
                Add first transaction
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        transactionToEdit={transactionToEdit}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!txToDelete}
        onClose={() => setTxToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={t('deleteTransaction')}
        message={t('confirmDeleteTx')}
        confirmText={t('delete')}
        isDestructive={true}
      />
    </div>
  );
};
