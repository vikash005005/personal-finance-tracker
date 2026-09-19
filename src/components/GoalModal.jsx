import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { CURRENCIES } from '../constants/currencies';
import { useLanguage } from '../context/LanguageContext';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';

export const GoalModal = ({ isOpen, onClose, goalToEdit = null }) => {
  const { t } = useLanguage();
  const { addSavingsGoal, updateSavingsGoal, currency } = useFinance();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [savedAmount, setSavedAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (goalToEdit) {
      setName(goalToEdit.name || '');
      setTargetAmount(goalToEdit.targetAmount || '');
      setSavedAmount(goalToEdit.savedAmount ?? '');
      setTargetDate(goalToEdit.targetDate || '');
    } else {
      setName('');
      setTargetAmount('');
      setSavedAmount('');
      const future = new Date();
      future.setMonth(future.getMonth() + 6);
      setTargetDate(future.toISOString().split('T')[0]);
    }
    setErrors({});
  }, [goalToEdit, isOpen]);

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Goal name is required';
    if (!targetAmount || Number(targetAmount) <= 0) {
      errs.targetAmount = 'Valid target amount is required';
    }
    if (savedAmount && Number(savedAmount) < 0) {
      errs.savedAmount = 'Saved amount cannot be negative';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: name.trim(),
      targetAmount: parseFloat(targetAmount),
      savedAmount: savedAmount ? parseFloat(savedAmount) : 0,
      targetDate,
      color: '#0f172a',
    };

    if (goalToEdit) {
      updateSavingsGoal(goalToEdit.id, payload);
      showToast('Savings goal updated', 'success');
    } else {
      addSavingsGoal(payload);
      showToast('New savings target created', 'success');
    }

    onClose();
  };

  const currSymbol = CURRENCIES[currency]?.symbol || '₹';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goalToEdit ? t('editGoal') : t('addGoal')}
      maxWidth="max-w-sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Goal Purpose *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Emergency Fund, Laptop, Vacation"
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
          />
          {errors.name && <p className="text-[11px] text-rose-500 mt-0.5">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Target ({currSymbol}) *
            </label>
            <input
              type="number"
              step="any"
              min="1"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="e.g. 100000"
              className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
            />
            {errors.targetAmount && (
              <p className="text-[11px] text-rose-500 mt-0.5">{errors.targetAmount}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Initial ({currSymbol})
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={savedAmount}
              onChange={(e) => setSavedAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
            />
            {errors.savedAmount && (
              <p className="text-[11px] text-rose-500 mt-0.5">{errors.savedAmount}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Target Completion Date
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
          />
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
            {goalToEdit ? t('saveChanges') : t('addGoal')}
          </button>
        </div>
      </form>
    </Modal>
  );
};
