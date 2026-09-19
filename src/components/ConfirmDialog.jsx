import React from 'react';
import { Modal } from './Modal';
import { AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  isDestructive = true,
}) => {
  const { t } = useLanguage();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || t('confirm')} maxWidth="max-w-sm">
      <div className="flex items-start space-x-3">
        <div
          className={`p-1.5 rounded-md flex-shrink-0 ${
            isDestructive
              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-0.5">
          {message}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          {cancelText || t('cancel')}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-3.5 py-1.5 text-xs font-semibold text-white rounded-lg shadow-subtle transition-colors ${
            isDestructive
              ? 'bg-rose-600 hover:bg-rose-700'
              : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900'
          }`}
        >
          {confirmText || (isDestructive ? t('delete') : t('confirm'))}
        </button>
      </div>
    </Modal>
  );
};
