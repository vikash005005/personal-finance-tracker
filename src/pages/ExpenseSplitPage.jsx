import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Receipt,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { CATEGORIES, PAYMENT_METHODS } from '../constants/initialData';
import { CURRENCIES } from '../constants/currencies';
import { formatDateDisplay } from '../utils/formatters';

export const ExpenseSplitPage = () => {
  const { addExpenseSplit, expenseSplits, deleteExpenseSplit, formatAmount, currency } = useFinance();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [splitMethod, setSplitMethod] = useState('equal'); // 'equal' | 'custom'
  const [recordMode, setRecordMode] = useState('myShare'); // 'myShare' | 'full'

  const [participants, setParticipants] = useState([
    { id: 'p-user', name: 'You', isUser: true, share: '' },
    { id: 'p-1', name: 'Rahul', isUser: false, share: '' },
    { id: 'p-2', name: 'Amit', isUser: false, share: '' },
  ]);

  const numPeople = participants.length;
  const numTotalAmount = parseFloat(totalAmount) || 0;

  // Compute calculated shares
  const computedShares = useMemo(() => {
    if (numPeople === 0) return [];
    if (splitMethod === 'equal') {
      const perPerson = numTotalAmount > 0 ? numTotalAmount / numPeople : 0;
      return participants.map((p) => ({
        ...p,
        computedAmount: Math.round(perPerson * 100) / 100,
      }));
    } else {
      return participants.map((p) => ({
        ...p,
        computedAmount: parseFloat(p.share) || 0,
      }));
    }
  }, [participants, splitMethod, numTotalAmount, numPeople]);

  const sumCustomShares = useMemo(() => {
    if (splitMethod === 'equal') return numTotalAmount;
    return computedShares.reduce((s, p) => s + (p.computedAmount || 0), 0);
  }, [computedShares, splitMethod, numTotalAmount]);

  const discrepancy = Math.abs(numTotalAmount - sumCustomShares);
  const isValidSplit = numTotalAmount > 0 && discrepancy < 0.01;

  const myShareAmount = computedShares.find((p) => p.isUser)?.computedAmount || 0;
  const othersShareAmount = computedShares
    .filter((p) => !p.isUser)
    .reduce((s, p) => s + (p.computedAmount || 0), 0);

  const handleAddParticipant = () => {
    setParticipants((prev) => [
      ...prev,
      { id: 'p-' + Date.now(), name: `Friend ${prev.length}`, isUser: false, share: '' },
    ]);
  };

  const handleRemoveParticipant = (id) => {
    if (participants.length <= 2) {
      showToast('Need at least 2 participants for a split', 'warning');
      return;
    }
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const handleNameChange = (id, newName) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: newName } : p))
    );
  };

  const handleShareChange = (id, val) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, share: val } : p))
    );
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please provide an expense title', 'warning');
      return;
    }
    if (numTotalAmount <= 0) {
      showToast('Please enter a valid total amount', 'warning');
      return;
    }
    if (splitMethod === 'custom' && !isValidSplit) {
      showToast(t('splitValidationErr'), 'error');
      return;
    }

    const payload = {
      title: title.trim(),
      totalAmount: numTotalAmount,
      category,
      paymentMethod,
      date,
      splitMethod,
      participants: computedShares.map((p) => ({
        id: p.id,
        name: p.name.trim(),
        isUser: p.isUser,
        share: p.computedAmount,
      })),
    };

    addExpenseSplit(payload, true, recordMode === 'full');
    showToast(t('splitSavedSuccess'), 'success');

    // Reset form
    setTitle('');
    setTotalAmount('');
  };

  const currSymbol = CURRENCIES[currency]?.symbol || '₹';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          {t('expenseSplit')}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('expenseSplitDesc')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Form (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-subtle space-y-4">
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* Title & Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Expense Purpose / Place *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Dinner at Meghana Foods, Goa Airbnb, Grocery Run"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('totalExpenseAmount')} ({currSymbol}) *
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
                    {currSymbol}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Category & Payment Method & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white focus:outline-none"
                >
                  {CATEGORIES.filter((c) => c.type === 'expense').map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {t(cat.nameKey)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white focus:outline-none"
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm} value={pm}>
                      {pm}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* Split Method Toggle */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                {t('splitMethod')}
              </label>
              <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg max-w-xs">
                <button
                  type="button"
                  onClick={() => setSplitMethod('equal')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    splitMethod === 'equal'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-subtle'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t('equalSplit')}
                </button>
                <button
                  type="button"
                  onClick={() => setSplitMethod('custom')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    splitMethod === 'custom'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-subtle'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t('customSplit')}
                </button>
              </div>
            </div>

            {/* Participants list */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {t('participants')} ({participants.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddParticipant}
                  className="inline-flex items-center space-x-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('addParticipant')}</span>
                </button>
              </div>

              <div className="space-y-2">
                {computedShares.map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-center space-x-2 p-2 bg-slate-50 dark:bg-slate-850/60 rounded-lg border border-slate-200 dark:border-slate-800"
                  >
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </div>

                    <input
                      type="text"
                      value={p.name}
                      disabled={p.isUser}
                      onChange={(e) => handleNameChange(p.id, e.target.value)}
                      placeholder="Participant name"
                      className={`flex-1 px-2.5 py-1 text-xs rounded border ${
                        p.isUser
                          ? 'border-transparent bg-transparent font-semibold text-slate-800 dark:text-slate-200'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                      }`}
                    />

                    {splitMethod === 'custom' ? (
                      <div className="relative w-32">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
                          {currSymbol}
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={p.share}
                          onChange={(e) => handleShareChange(p.id, e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-6 pr-2 py-1 text-xs font-mono rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>
                    ) : (
                      <span className="w-28 text-right font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                        {formatAmount(p.computedAmount)}
                      </span>
                    )}

                    {!p.isUser && (
                      <button
                        type="button"
                        onClick={() => handleRemoveParticipant(p.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                        title={t('removeParticipant')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {splitMethod === 'custom' && (
                <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
                  <span className="text-slate-500">
                    Allocated: {formatAmount(sumCustomShares)} / {formatAmount(numTotalAmount)}
                  </span>
                  {discrepancy > 0.01 ? (
                    <span className="text-rose-600 dark:text-rose-400 font-medium">
                      Difference: {formatAmount(discrepancy)}
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Balanced</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Record Option */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                {t('recordFullOrShare')}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <label className="flex items-center space-x-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="recordMode"
                    value="myShare"
                    checked={recordMode === 'myShare'}
                    onChange={() => setRecordMode('myShare')}
                    className="accent-slate-900"
                  />
                  <span>
                    <span className="font-semibold block">{t('recordMyShareOnly')}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatAmount(myShareAmount)} recorded in ledger
                    </span>
                  </span>
                </label>

                <label className="flex items-center space-x-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="recordMode"
                    value="full"
                    checked={recordMode === 'full'}
                    onChange={() => setRecordMode('full')}
                    className="accent-slate-900"
                  />
                  <span>
                    <span className="font-semibold block">{t('recordFullWithNote')}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatAmount(numTotalAmount)} with breakdown notes
                    </span>
                  </span>
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={!isValidSplit}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-subtle disabled:opacity-50 transition-colors"
              >
                <span>{t('saveAsExpenseTx')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* Right Summary & History (1 Col) */}
        <div className="space-y-5">
          {/* Summary Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-subtle space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
              {t('splitSummary')}
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span>{t('totalExpenseAmount')}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {formatAmount(numTotalAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>{t('numberPeople')}</span>
                <span className="font-mono">{numPeople}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{t('yourShare')}</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {formatAmount(myShareAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>{t('othersShares')}</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  {formatAmount(othersShareAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Past Splits Log */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-subtle space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {t('sharedExpenses')}
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                {expenseSplits.length} recorded
              </span>
            </div>

            {expenseSplits.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
                {expenseSplits.slice(0, 5).map((sp) => (
                  <div key={sp.id} className="py-2.5 flex items-start justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                        {sp.title}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {sp.date} • {sp.participants?.length} people
                      </p>
                    </div>

                    <div className="text-right flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {formatAmount(sp.totalAmount)}
                      </span>
                      <button
                        onClick={() => deleteExpenseSplit(sp.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600"
                        title="Delete split"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3 text-center">
                {t('noSharedExpenses')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
