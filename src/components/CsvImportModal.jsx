import React, { useState, useRef } from 'react';
import { Modal } from './Modal';
import {
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  X,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

// Simple robust CSV line parser handling quotes
function parseCsvLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

export const CsvImportModal = ({ isOpen, onClose }) => {
  const { importTransactions, formatAmount } = useFinance();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [parseError, setParseError] = useState('');

  if (!isOpen) return null;

  const handleReset = () => {
    setSelectedFile(null);
    setParsedData(null);
    setParseError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      showToast('Please upload a valid .csv file', 'error');
      return;
    }

    setSelectedFile(file);
    setParseError('');

    const reader = new FileReader();
    reader.onerror = () => setParseError('Failed to read CSV file');
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

        if (lines.length < 2) {
          setParseError('The file does not contain enough data rows.');
          return;
        }

        const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/[\s_-]+/g, ''));

        // Identify required column indices
        const titleIdx = headers.findIndex((h) => h.includes('title') || h.includes('desc') || h.includes('merchant'));
        const typeIdx = headers.findIndex((h) => h.includes('type'));
        const amountIdx = headers.findIndex((h) => h.includes('amount') || h.includes('val'));
        const dateIdx = headers.findIndex((h) => h.includes('date'));
        const catIdx = headers.findIndex((h) => h.includes('cat'));
        const methodIdx = headers.findIndex((h) => h.includes('pay') || h.includes('method') || h.includes('mode'));
        const descIdx = headers.findIndex((h) => (h.includes('note') || h.includes('detail')) && h !== headers[titleIdx]);

        if (titleIdx === -1 || amountIdx === -1) {
          setParseError(t('invalidCsvMissingCols'));
          return;
        }

        const validRows = [];
        const invalidRows = [];

        for (let i = 1; i < lines.length; i++) {
          const cells = parseCsvLine(lines[i]);
          if (cells.length < 2 || cells.every((c) => !c)) continue;

          const title = cells[titleIdx] || '';
          const rawAmount = (cells[amountIdx] || '').replace(/[^\d.-]/g, '');
          const amount = parseFloat(rawAmount);

          // Type
          let type = 'expense';
          if (typeIdx !== -1 && cells[typeIdx]) {
            const rawType = cells[typeIdx].toLowerCase();
            if (rawType.includes('inc') || rawType.includes('credit') || rawType.includes('+')) {
              type = 'income';
            }
          }

          // Date validation
          let dateStr = new Date().toISOString().split('T')[0];
          if (dateIdx !== -1 && cells[dateIdx]) {
            const parsedDate = new Date(cells[dateIdx]);
            if (!isNaN(parsedDate.getTime())) {
              dateStr = parsedDate.toISOString().split('T')[0];
            } else {
              invalidRows.push({ rowNumber: i + 1, raw: lines[i], reason: `Invalid date format: "${cells[dateIdx]}"` });
              continue;
            }
          }

          // Amount validation
          if (!title.trim()) {
            invalidRows.push({ rowNumber: i + 1, raw: lines[i], reason: 'Missing title / description' });
            continue;
          }
          if (isNaN(amount) || amount <= 0) {
            invalidRows.push({ rowNumber: i + 1, raw: lines[i], reason: `Invalid positive amount: "${cells[amountIdx]}"` });
            continue;
          }

          validRows.push({
            title: title.trim(),
            type,
            amount,
            category: (catIdx !== -1 && cells[catIdx]) ? cells[catIdx].trim() : (type === 'income' ? 'Salary' : 'Other'),
            date: dateStr,
            description: (descIdx !== -1 && cells[descIdx]) ? cells[descIdx].trim() : '',
            paymentMethod: (methodIdx !== -1 && cells[methodIdx]) ? cells[methodIdx].trim() : 'Other',
          });
        }

        setParsedData({
          fileName: file.name,
          totalRows: lines.length - 1,
          validRows,
          invalidRows,
        });
      } catch (err) {
        setParseError('Error parsing CSV file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!parsedData || parsedData.validRows.length === 0) {
      showToast(t('noValidTxToImport'), 'warning');
      return;
    }

    const { imported, skipped } = importTransactions(parsedData.validRows);
    showToast(
      `${imported} ${t('importSuccessToast')}${skipped > 0 ? ` (${skipped} duplicate(s) skipped)` : ''}`,
      'success'
    );
    handleReset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
      title={t('importCsv')}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 text-xs">
        {/* Step 1: Upload box if not parsed */}
        {!parsedData ? (
          <div className="space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors text-center bg-slate-50/50 dark:bg-slate-850/50"
            >
              <FileSpreadsheet className="w-10 h-10 text-slate-400 mb-2" />
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                {t('dropCsvHere')}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                {t('expectedColumnsHint')}
              </p>
            </div>

            {parseError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-700 dark:text-rose-300 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{parseError}</span>
              </div>
            )}
          </div>
        ) : (
          /* Step 2: Preview & Validation Results */
          <div className="space-y-4">
            {/* Header info strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-slate-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {parsedData.fileName}
                </span>
              </div>
              <div className="flex items-center space-x-3 font-mono text-[11px]">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {parsedData.validRows.length} {t('transactionsReady')}
                </span>
                {parsedData.invalidRows.length > 0 && (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">
                    {parsedData.invalidRows.length} {t('warningsFound')}
                  </span>
                )}
              </div>
            </div>

            {/* Warnings list if any */}
            {parsedData.invalidRows.length > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 rounded-lg space-y-1 max-h-28 overflow-y-auto">
                <p className="font-semibold text-amber-800 dark:text-amber-200 text-[11px] flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Skipped invalid rows:</span>
                </p>
                {parsedData.invalidRows.map((inv, idx) => (
                  <p key={idx} className="text-[10px] text-amber-700 dark:text-amber-300 font-mono">
                    Line {inv.rowNumber}: {inv.reason}
                  </p>
                ))}
              </div>
            )}

            {/* Preview table of valid rows */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-50 dark:bg-slate-850 sticky top-0 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Title</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Payment</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {parsedData.validRows.slice(0, 10).map((row, idx) => {
                    const isIncome = row.type === 'income';
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                        <td className="px-3 py-1.5 text-slate-500">{row.date}</td>
                        <td className="px-3 py-1.5 font-sans font-medium text-slate-900 dark:text-white truncate max-w-[150px]">
                          {row.title}
                        </td>
                        <td className="px-3 py-1.5 font-sans text-slate-600 dark:text-slate-400">
                          {row.category}
                        </td>
                        <td className="px-3 py-1.5 font-sans text-slate-500">{row.paymentMethod}</td>
                        <td className="px-3 py-1.5 text-right font-bold tabular-nums">
                          <span className={isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}>
                            {isIncome ? '+' : '-'}{formatAmount(row.amount)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {parsedData.validRows.length > 10 && (
                <div className="p-2 text-center text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-850/40 border-t border-slate-100 dark:border-slate-800">
                  Showing 10 of {parsedData.validRows.length} transactions
                </div>
              )}
            </div>

            <p className="text-[10px] text-slate-400">
              {t('duplicateRowsSkipped')}
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {parsedData ? (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center space-x-1 text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Select another file</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                handleReset();
                onClose();
              }}
              className="px-3.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
            >
              {t('cancelImport')}
            </button>

            {parsedData && (
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={parsedData.validRows.length === 0}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 shadow-subtle disabled:opacity-50 transition-colors"
              >
                {t('confirmImport')} ({parsedData.validRows.length})
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
