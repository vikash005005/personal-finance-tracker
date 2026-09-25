import React, { useState, useEffect, useRef } from 'react';
import { Modal } from './Modal';
import { CATEGORIES, PAYMENT_METHODS } from '../constants/initialData';
import { CURRENCIES } from '../constants/currencies';
import { useLanguage } from '../context/LanguageContext';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';
import { compressImageFile } from '../utils/imageCompressor';
import { FileImage, Upload, Trash2, RotateCw } from 'lucide-react';

export const TransactionModal = ({
  isOpen,
  onClose,
  transactionToEdit = null,
  defaultDate = null,
}) => {
  const { t } = useLanguage();
  const { addTransaction, updateTransaction, addRecurringRule, currency } = useFinance();
  const { showToast } = useToast();

  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [receiptFileName, setReceiptFileName] = useState('');
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [recurringFreq, setRecurringFreq] = useState('none');
  const [recurringStartDate, setRecurringStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [recurringEndDate, setRecurringEndDate] = useState('');
  const [errors, setErrors] = useState({});

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type || 'expense');
      setTitle(transactionToEdit.title || '');
      setAmount(transactionToEdit.amount || '');
      setCategory(transactionToEdit.category || 'Food');
      setDate(transactionToEdit.date || new Date().toISOString().split('T')[0]);
      setDescription(transactionToEdit.description || '');
      setPaymentMethod(transactionToEdit.paymentMethod || 'UPI');
      setReceiptUrl(transactionToEdit.receiptUrl || transactionToEdit.receipt || '');
      setReceiptFileName('');
      setRecurringFreq('none');
      setRecurringStartDate(transactionToEdit.date || new Date().toISOString().split('T')[0]);
      setRecurringEndDate('');
    } else {
      setType('expense');
      setTitle('');
      setAmount('');
      setCategory('Food');
      setDate(defaultDate || new Date().toISOString().split('T')[0]);
      setDescription('');
      setPaymentMethod('UPI');
      setReceiptUrl('');
      setReceiptFileName('');
      setRecurringFreq('none');
      setRecurringStartDate(defaultDate || new Date().toISOString().split('T')[0]);
      setRecurringEndDate('');
    }
    setErrors({});
  }, [transactionToEdit, isOpen, defaultDate]);

  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'income' && category !== 'Salary' && category !== 'Freelancing' && category !== 'Investments') {
      setCategory('Salary');
    } else if (newType === 'expense' && (category === 'Salary' || category === 'Freelancing' || category === 'Investments')) {
      setCategory('Food');
    }
  };

  const handleReceiptUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingReceipt(true);
    try {
      const res = await compressImageFile(file);
      setReceiptUrl(res.dataUrl);
      setReceiptFileName(res.fileName);
      showToast(t('receiptAttached'), 'success');
    } catch (err) {
      if (err.message === 'INVALID_TYPE') {
        showToast(t('receiptFormatError'), 'error');
      } else if (err.message === 'FILE_TOO_LARGE') {
        showToast(t('receiptTooLarge'), 'error');
      } else {
        showToast(t('receiptStorageError'), 'error');
      }
    } finally {
      setIsUploadingReceipt(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveReceipt = () => {
    setReceiptUrl('');
    setReceiptFileName('');
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
      paymentMethod,
      receiptUrl: receiptUrl || null,
      time: transactionToEdit?.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (transactionToEdit) {
      updateTransaction(transactionToEdit.id, payload);
      showToast('Record updated successfully', 'success');
    } else {
      addTransaction(payload);
      if (recurringFreq !== 'none') {
        addRecurringRule({
          title: title.trim(),
          amount: parseFloat(amount),
          type,
          category,
          paymentMethod,
          frequency: recurringFreq,
          startDate: recurringStartDate || date,
          endDate: recurringEndDate || null,
          isActive: true,
          description: description.trim(),
        });
      }
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

        {/* Date & Payment Method */}
        <div className="grid grid-cols-2 gap-3">
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

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>{pm}</option>
              ))}
            </select>
          </div>
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

        {/* Receipt Attachment Section */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={handleReceiptUpload}
            className="hidden"
          />
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {t('receipt')}
            </label>
            <span className="text-[10px] text-slate-400">JPG, PNG, WEBP (max 5MB)</span>
          </div>

          {receiptUrl ? (
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2.5 min-w-0">
                <img
                  src={receiptUrl}
                  alt="Receipt thumbnail"
                  className="w-9 h-9 object-cover rounded border border-slate-200 dark:border-slate-700 flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                    {receiptFileName || t('receiptAttached')}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                    Attached & ready
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingReceipt}
                  className="inline-flex items-center space-x-1 px-2 py-1 text-[11px] font-medium rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <RotateCw className="w-3 h-3 text-slate-400" />
                  <span>{t('replaceReceipt')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemoveReceipt}
                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title={t('removeReceipt')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingReceipt}
              className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 border border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploadingReceipt ? t('loading') : t('uploadReceipt')}</span>
            </button>
          )}
        </div>

        {/* Recurring Transaction Section */}
        {!transactionToEdit && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {t('recurringTransactions')}
              </label>
              <select
                value={recurringFreq}
                onChange={(e) => setRecurringFreq(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
              >
                <option value="none">No (One-time)</option>
                <option value="daily">{t('recDaily')}</option>
                <option value="weekly">{t('recWeekly')}</option>
                <option value="monthly">{t('recMonthly')}</option>
                <option value="yearly">{t('recYearly')}</option>
              </select>
            </div>

            {recurringFreq !== 'none' && (
              <div className="grid grid-cols-2 gap-3 p-2.5 bg-slate-50 dark:bg-slate-850/60 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    {t('recStartDate')}
                  </label>
                  <input
                    type="date"
                    value={recurringStartDate}
                    onChange={(e) => setRecurringStartDate(e.target.value)}
                    className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    {t('recEndDate')}
                  </label>
                  <input
                    type="date"
                    value={recurringEndDate}
                    onChange={(e) => setRecurringEndDate(e.target.value)}
                    className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>
        )}

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
