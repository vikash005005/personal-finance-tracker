import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Modal } from './Modal';
import { CURRENCIES } from '../constants/currencies';
import { useLanguage } from '../context/LanguageContext';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';
import { Coins, CheckCircle2 } from 'lucide-react';

export const AddSavingsModal = ({ isOpen, onClose, goal }) => {
  const { t } = useLanguage();
  const { addFundsToGoal, formatAmount, currency } = useFinance();
  const { showToast } = useToast();

  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  if (!goal) return null;

  const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
  const currSymbol = CURRENCIES[currency]?.symbol || '₹';
  const presets = [1000, 2500, 5000, 10000];

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      setError('Please enter a valid deposit amount');
      return;
    }

    const res = addFundsToGoal(goal.id, val);
    showToast(`Deposited ${formatAmount(val)} to "${goal.name}"`, 'success');

    if (res?.reachedTarget) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
      showToast(`Target achieved! Congratulations on completing "${goal.name}".`, 'success', 5000);
    }

    setAmount('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('addFundsToGoal')}
      maxWidth="max-w-sm"
    >
      <div className="mb-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs font-mono tabular-nums">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-sans">Goal Target</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {formatAmount(goal.targetAmount)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-sans">Currently Saved</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {formatAmount(goal.savedAmount)}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-750">
          <span className="text-slate-500 font-sans">Remaining</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {formatAmount(remaining)}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Deposit Amount ({currSymbol}) *
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
              placeholder="e.g. 5000"
              className="w-full pl-7 pr-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
            />
          </div>
          {error && <p className="text-[11px] text-rose-500 mt-0.5">{error}</p>}
        </div>

        {/* Presets */}
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block mb-1">
            Quick Presets
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset.toString())}
                className="py-1 px-1.5 text-xs font-mono bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 rounded border border-slate-200 dark:border-slate-700 transition-colors text-slate-700 dark:text-slate-300"
              >
                +{currSymbol}{preset >= 1000 ? `${preset / 1000}k` : preset}
              </button>
            ))}
          </div>
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
            className="inline-flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold text-white dark:text-slate-900 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white rounded-lg shadow-subtle transition-colors"
          >
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span>Confirm Deposit</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
