import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { CATEGORIES } from '../constants/initialData';
import { CURRENCIES } from '../constants/currencies';
import { useLanguage } from '../context/LanguageContext';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';

export const BudgetModal = ({ isOpen, onClose, budgetToEdit = null }) => {
  const { t } = useLanguage();
  const { addBudget, updateBudget, currency, budgets } = useFinance();
  const { showToast } = useToast();

  const expenseCategories = CATEGORIES.filter((c) => c.type === 'expense');

  const [category, setCategory] = useState(expenseCategories[0]?.id || 'Food');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (budgetToEdit) {
      setCategory(budgetToEdit.category);
      setAmount(budgetToEdit.amount);
    } else {
      const unused = expenseCategories.find(
        (c) => !budgets.some((b) => b.category === c.id)
      );
      setCategory(unused ? unused.id : expenseCategories[0]?.id || 'Food');
      setAmount('');
    }
    setError('');
  }, [budgetToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Please provide a valid budget amount greater than 0');
      return;
    }

    if (budgetToEdit) {
      updateBudget(budgetToEdit.id, {
        category,
        amount: parseFloat(amount),
      });
      showToast('Budget allocation updated', 'success');
    } else {
      addBudget({
        category,
        amount: parseFloat(amount),
      });
      showToast('New category budget active', 'success');
    }

    onClose();
  };

  const currSymbol = CURRENCIES[currency]?.symbol || '₹';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={budgetToEdit ? t('editBudget') : t('addBudget')}
      maxWidth="max-w-sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Category *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={!!budgetToEdit}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 disabled:opacity-50"
          >
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {t(c.nameKey)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Monthly Spend Limit ({currSymbol}) *
          </label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
              {currSymbol}
            </span>
            <input
              type="number"
              step="any"
              min="1"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError('');
              }}
              placeholder="e.g. 10000"
              className="w-full pl-7 pr-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
            />
          </div>
          {error && <p className="text-[11px] text-rose-500 mt-0.5">{error}</p>}
        </div>

        <div className="mt-5 flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 text-xs font-semibold text-white dark:text-slate-900 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white rounded-lg shadow-subtle transition-colors"
          >
            {budgetToEdit ? t('saveChanges') : t('addBudget')}
          </button>
        </div>
      </form>
    </Modal>
  );
};
