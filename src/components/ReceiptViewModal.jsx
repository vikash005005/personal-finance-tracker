import React from 'react';
import { Modal } from './Modal';
import { Download, FileImage, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const ReceiptViewModal = ({ isOpen, onClose, transaction }) => {
  const { t } = useLanguage();

  if (!isOpen || !transaction) return null;

  const receiptUrl = transaction.receiptUrl || transaction.receipt;

  const handleDownload = () => {
    if (!receiptUrl) return;
    const a = document.createElement('a');
    a.href = receiptUrl;
    a.download = `receipt-${transaction.id || 'record'}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('receiptModalTitle')}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Receipt Header details */}
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
          <div>
            <p className="font-semibold text-slate-900 dark:text-white truncate">
              {transaction.title}
            </p>
            <p className="text-[11px] text-slate-400">
              {transaction.date} • {transaction.category} • {transaction.paymentMethod || 'Other'}
            </p>
          </div>
          {receiptUrl && (
            <button
              onClick={handleDownload}
              className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Download image"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          )}
        </div>

        {/* Image Preview Box */}
        <div className="flex items-center justify-center p-2 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[60vh]">
          {receiptUrl ? (
            <img
              src={receiptUrl}
              alt={`Receipt for ${transaction.title}`}
              className="max-h-[55vh] w-auto object-contain rounded shadow-xs"
            />
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              <FileImage className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p>{t('noReceipt')}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition-colors"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </Modal>
  );
};
