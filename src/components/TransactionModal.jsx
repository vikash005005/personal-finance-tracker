import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { CATEGORIES } from '../constants/initialData';
import { CURRENCIES } from '../constants/currencies';
import { useLanguage } from '../context/LanguageContext';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';

export const TransactionModal = ({
  isOpen,
  onClose,
  transactionToEdit = null,
}) => {
  const { t } = useLanguage();
  const { addTransaction, updateTransaction, currency } = useFinance();
  const { showToast } = useToast();

  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type || 'expense');
      setTitle(transactionToEdit.title || '');
      setAmount(transactionToEdit.amount || '');
      setCategory(transactionToEdit.category || 'Food');
      setDate(transactionToEdit.date || new Date().toISOString().split('T')[0]);
      setDescription(transactionToEdit.description || '');
    } else {
      setType('expense');
      setTitle('');
      setAmount('');
      setCategory('Food');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
    }
    setErrors({});
  }, [transactionToEdit, isOpen]);

  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'income' && category !== 'Salary' && category !== 'Freelancing' && category !== 'Investments') {
      setCategory('Salary');
    } else if (newType === 'expense' && (category === 'Salary' || category === 'Freelancing' || category === 'Investments')) {
      setCategory('Food');
    }
  };

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Title / description is required';
    if (!amount || Number(amount) <= 0) errs.amount = 'Valid positive amount is required';
    if (!date) errs.date = 'Date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      type,
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      date,
      description: description.trim(),
    };

    if (transactionToEdit) {
      updateTransaction(transactionToEdit.id, payload);
      showToast('Record updated successfully', 'success');
    } else {
      addTransaction(payload);
      showToast('New transaction recorded', 'success');
    }

    onClose();
  };

  const availableCategories = CATEGORIES.filter((c) =>
    type === 'income' ? c.type === 'income' : c.type === 'expense'
  );

  const currSymbol = CURRENCIES[currency]?.symbol || '₹';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transactionToEdit ? t('editTransaction') : t('addTransaction')}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Segmented Type Toggle */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Transaction Direction
          </label>
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                type === 'expense'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-subtle'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Debit (Outflow)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                type === 'income'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-subtle'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Credit (Inflow)
            </button>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Merchant / Description *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Swiggy, TCS Ltd, Blinkit, BESCOM"
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
          />
          {errors.title && <p className="text-[11px] text-rose-500 mt-0.5">{errors.title}</p>}
        </div>

        {/* Amount & Category */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Amount ({currSymbol}) *
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
                {currSymbol}
              </span>
              <input
                type="number"
                step="any"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
              />
            </div>
            {errors.amount && <p className="text-[11px] text-rose-500 mt-0.5">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
            >
              {availableCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {t(c.nameKey)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Transaction Date *
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 font-mono"
          />
          {errors.date && <p className="text-[11px] text-rose-500 mt-0.5">{errors.date}</p>}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Payment Notes / Reference ID
          </label>
          <textarea
            rows="2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="UPI reference, payment purpose, or invoice number..."
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
          />
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 text-xs font-semibold text-white dark:text-slate-900 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white rounded-lg shadow-subtle transition-colors"
          >
            {transactionToEdit ? t('saveChanges') : t('addTransaction')}
          </button>
        </div>
      </form>
    </Modal>
  );
};
