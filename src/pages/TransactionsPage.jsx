import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Download,
  Upload,
  Edit2,
  Trash2,
  ArrowUpRight,
  Receipt,
  X,
  SlidersHorizontal,
  Calendar as CalendarIcon,
  List,
  RotateCcw,
  CreditCard,
  Paperclip,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { CATEGORIES, PAYMENT_METHODS } from '../constants/initialData';
import { TransactionModal } from '../components/TransactionModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { TransactionCalendar } from '../components/TransactionCalendar';
import { AdvancedFilterDrawer } from '../components/AdvancedFilterDrawer';
import { formatDateDisplay } from '../utils/formatters';
import { exportTransactionsToCsv } from '../utils/exportCsv';
import { CsvImportModal } from '../components/CsvImportModal';
import { ReceiptViewModal } from '../components/ReceiptViewModal';
import { CalendarDateDetails } from '../components/CalendarDateDetails';

export const TransactionsPage = () => {
  const {
    transactions,
    deleteTransaction,
    formatAmount,
  } = useFinance();
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // View Mode: 'list' | 'calendar'
  const [viewMode, setViewMode] = useState('list');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(
    () => new Date().toISOString().split('T')[0]
  );

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [typeFilter, setTypeFilter] = useState('all'); // all | income | expense
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [datePreset, setDatePreset] = useState('allTime');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [minAmountFilter, setMinAmountFilter] = useState('');
  const [maxAmountFilter, setMaxAmountFilter] = useState('');
  const [sortBy, setSortBy] = useState('dateNewest');

  // UI state for filter drawer / expansion
  const [showAdvancedBar, setShowAdvancedBar] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Modal States
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState(null);
  const [modalDefaultDate, setModalDefaultDate] = useState(null);
  const [txToDelete, setTxToDelete] = useState(null);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

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
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = (tx.title || '').toLowerCase().includes(q);
          const matchDesc = (tx.description || '').toLowerCase().includes(q);
          const matchCat = (tx.category || '').toLowerCase().includes(q);
          const matchMethod = (tx.paymentMethod || '').toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCat && !matchMethod) return false;
        }

        // Type
        if (typeFilter !== 'all' && tx.type !== typeFilter) {
          return false;
        }

        // Category
        if (categoryFilter !== 'all' && tx.category !== categoryFilter) {
          return false;
        }

        // Payment Method
        if (paymentMethodFilter !== 'all') {
          const method = tx.paymentMethod || 'Other';
          if (method !== paymentMethodFilter) return false;
        }

        // Min / Max Amount
        const amount = Number(tx.amount) || 0;
        if (minAmountFilter !== '' && amount < Number(minAmountFilter)) return false;
        if (maxAmountFilter !== '' && amount > Number(maxAmountFilter)) return false;

        // Custom Date Range
        if (startDateFilter && tx.date < startDateFilter) return false;
        if (endDateFilter && tx.date > endDateFilter) return false;

        // Date Preset (only if custom date range is not actively set)
        if (!startDateFilter && !endDateFilter && datePreset !== 'allTime') {
          const txDate = new Date(tx.date);
          if (datePreset === 'thisMonth') {
            if (txDate.getFullYear() !== currentYear || txDate.getMonth() !== currentMonth) return false;
          } else if (datePreset === 'lastMonth') {
            const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
            if (txDate.getFullYear() !== lastMonthDate.getFullYear() || txDate.getMonth() !== lastMonthDate.getMonth()) return false;
          } else if (datePreset === 'last6Months') {
            const sixMonthsAgo = new Date(currentYear, currentMonth - 5, 1);
            if (txDate < sixMonthsAgo) return false;
          } else if (datePreset === 'thisYear') {
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
  }, [
    transactions,
    searchQuery,
    typeFilter,
    categoryFilter,
    paymentMethodFilter,
    datePreset,
    startDateFilter,
    endDateFilter,
    minAmountFilter,
    maxAmountFilter,
    sortBy,
  ]);



  const handleOpenAdd = () => {
    setModalDefaultDate(null);
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
    setPaymentMethodFilter('all');
    setDatePreset('allTime');
    setStartDateFilter('');
    setEndDateFilter('');
    setMinAmountFilter('');
    setMaxAmountFilter('');
    setSortBy('dateNewest');
    setSearchParams({});
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    typeFilter !== 'all' ||
    categoryFilter !== 'all' ||
    paymentMethodFilter !== 'all' ||
    datePreset !== 'allTime' ||
    startDateFilter !== '' ||
    endDateFilter !== '' ||
    minAmountFilter !== '' ||
    maxAmountFilter !== '' ||
    sortBy !== 'dateNewest';

  return (
    <div className="space-y-5">
      {/* Header with Title, View Switcher and Actions */}
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
          {/* View Switcher Toggle */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-subtle font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>{t('listView')}</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-subtle font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>{t('calendarView')}</span>
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-subtle transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">{t('exportCsv')}</span>
          </button>

          <button
            onClick={() => setIsCsvImportOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-subtle transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">{t('importCsv')}</span>
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

      {/* Structured Filter Strip (Shown in both views) */}
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
              placeholder="Search merchant, notes, category or payment method..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-slate-400 text-slate-900 dark:text-white"
            />
          </div>

          {/* Category, Payment Method, and Date Preset Dropdowns */}
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

            {/* Payment Method Dropdown */}
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="flex-1 md:flex-initial px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Payment Methods</option>
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>

            {/* Advanced Filters Button (Mobile & Desktop toggle) */}
            <button
              onClick={() => {
                if (window.innerWidth < 768) {
                  setIsFilterDrawerOpen(true);
                } else {
                  setShowAdvancedBar(!showAdvancedBar);
                }
              }}
              className={`p-1.5 rounded-lg border text-xs font-medium flex items-center space-x-1 transition-colors ${
                showAdvancedBar || isFilterDrawerOpen || minAmountFilter || maxAmountFilter || startDateFilter || endDateFilter
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
              title="More Filters"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('advancedFilters')}</span>
            </button>
          </div>
        </div>

        {/* Expandable Desktop Filter Bar for Amount & Date Ranges */}
        {showAdvancedBar && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">{t('dateFrom')}</label>
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="w-full px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">{t('dateTo')}</label>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="w-full px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">{t('minAmount')}</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={minAmountFilter}
                onChange={(e) => setMinAmountFilter(e.target.value)}
                className="w-full px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">{t('maxAmount')}</label>
              <input
                type="number"
                min="0"
                placeholder="No limit"
                value={maxAmountFilter}
                onChange={(e) => setMaxAmountFilter(e.target.value)}
                className="w-full px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>
        )}

        {/* Counter and Clear Filters */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
          <span className="text-slate-500 dark:text-slate-400 font-mono">
            {t('showingOf')} <span className="font-bold text-slate-800 dark:text-slate-200">{filteredTransactions.length}</span> {t('of')} {transactions.length} {t('entries')}
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center space-x-1 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 font-medium transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t('clearFilters')}</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: CALENDAR VIEW */}
      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left: Monthly Calendar Grid (8 cols on xl, 7 cols on lg) */}
          <div className="lg:col-span-7 xl:col-span-8">
            <TransactionCalendar
              selectedDate={selectedCalendarDate}
              onSelectDate={(date) => {
                setSelectedCalendarDate(date);
                if (window.innerWidth < 1024) {
                  const el = document.getElementById('calendar-date-details');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
              }}
            />
          </div>

          {/* Right: Date Details Panel (Sticky side panel on desktop, full-width section below on mobile) */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-20" id="calendar-date-details">
            <CalendarDateDetails
              selectedDate={selectedCalendarDate}
              onAddTransaction={(date) => {
                setModalDefaultDate(date);
                setTransactionToEdit(null);
                setIsAddEditOpen(true);
              }}
              onEditTransaction={handleOpenEdit}
              onDeleteTransaction={(tx) => setTxToDelete(tx)}
              onViewReceipt={(receiptData) => setSelectedReceipt(receiptData)}
            />
          </div>
        </div>
      ) : (
        /* VIEW 2: LIST / LEDGER VIEW */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-subtle">
          {filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Description / Merchant</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Payment Method</th>
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

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-[11px] text-slate-600 dark:text-slate-400">
                            {tx.paymentMethod || 'Other'}
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
                            {tx.receiptUrl && (
                              <button
                                onClick={() => setSelectedReceipt({
                                  url: tx.receiptUrl,
                                  title: tx.title,
                                  date: tx.date,
                                  amount: tx.amount,
                                })}
                                className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title={t('viewReceipt')}
                              >
                                <Paperclip className="w-3.5 h-3.5" />
                              </button>
                            )}
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
      )}

      {/* Advanced Filter Drawer for Mobile */}
      <AdvancedFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        paymentMethodFilter={paymentMethodFilter}
        setPaymentMethodFilter={setPaymentMethodFilter}
        startDateFilter={startDateFilter}
        setStartDateFilter={setStartDateFilter}
        endDateFilter={endDateFilter}
        setEndDateFilter={setEndDateFilter}
        minAmountFilter={minAmountFilter}
        setMinAmountFilter={setMinAmountFilter}
        maxAmountFilter={maxAmountFilter}
        setMaxAmountFilter={setMaxAmountFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onReset={clearAllFilters}
        totalMatching={filteredTransactions.length}
        totalCount={transactions.length}
      />

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        transactionToEdit={transactionToEdit}
        defaultDate={modalDefaultDate}
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

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
      />

      {/* Receipt View Modal */}
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
