import React, { useState } from 'react';
import {
  User,
  Mail,
  Sun,
  Moon,
  Trash2,
  RotateCcw,
  Download,
  Check,
  Globe,
  Coins,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';
import { CURRENCIES } from '../constants/currencies';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const {
    currency,
    setCurrency,
    clearAllTransactions,
    resetToDemoData,
    transactions,
    budgets,
    savingsGoals,
  } = useFinance();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || 'Arjun Sharma');
  const [email, setEmail] = useState(user?.email || 'arjun.sharma@example.com');
  const [avatar, setAvatar] = useState(
    user?.avatar ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  );

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleProfileSave = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('Name and email cannot be empty', 'error');
      return;
    }
    updateProfile({ name: name.trim(), email: email.trim(), avatar });
    showToast('Profile information saved', 'success');
  };

  const handleClearTransactions = () => {
    clearAllTransactions();
    showToast('All transactions cleared from local storage', 'info');
  };

  const handleResetDemoData = () => {
    resetToDemoData();
    showToast('All records restored to standard demo data', 'success');
  };

  const handleExportBackup = () => {
    const backupData = {
      user,
      transactions,
      budgets,
      savingsGoals,
      currency,
      theme,
      language,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `financetrack-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('Complete backup exported as JSON', 'success');
  };

  const avatarPresets = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          {t('settingsTitle')}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Account identity, currency formatting, language & data controls
        </p>
      </div>

      {/* 1. Profile Information */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-subtle space-y-5">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <User className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            {t('profileSection')}
          </h3>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
              Profile Photo
            </label>
            <div className="flex items-center space-x-3">
              <img
                src={avatar}
                alt="Avatar"
                className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <div className="flex items-center space-x-2">
                {avatarPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(preset)}
                    className={`w-8 h-8 rounded-full overflow-hidden border transition-all ${
                      avatar === preset
                        ? 'border-slate-900 dark:border-white ring-1 ring-slate-900 dark:ring-white scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={preset} alt="preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 shadow-subtle transition-colors"
          >
            {t('saveChanges')}
          </button>
        </form>
      </div>

      {/* 2. Preferences */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-subtle space-y-5">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Globe className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            {t('preferencesSection')}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Currency */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              {t('currency')}
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.values(CURRENCIES).map((curr) => (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() => {
                    setCurrency(curr.code);
                    showToast(`Currency changed to ${curr.code}`, 'success');
                  }}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    currency === curr.code
                      ? 'border-slate-900 dark:border-white bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  <span className="font-mono">
                    {curr.symbol} {curr.code}
                  </span>
                  {currency === curr.code && <Check className="w-3 h-3 text-emerald-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              {t('language')}
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setLanguage('en');
                  showToast('Language: English', 'success');
                }}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  language === 'en'
                    ? 'border-slate-900 dark:border-white bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                <span>English</span>
                {language === 'en' && <Check className="w-3 h-3 text-emerald-600" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setLanguage('hi');
                  showToast('भाषा: हिन्दी', 'success');
                }}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  language === 'hi'
                    ? 'border-slate-900 dark:border-white bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                <span>हिन्दी (Hindi)</span>
                {language === 'hi' && <Check className="w-3 h-3 text-emerald-600" />}
              </button>
            </div>
          </div>

          {/* Theme */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              {t('theme')}
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setTheme('light');
                  showToast('Light mode active', 'info');
                }}
                className={`flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  theme === 'light'
                    ? 'border-slate-900 dark:border-white bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('lightMode')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTheme('dark');
                  showToast('Dark mode active', 'info');
                }}
                className={`flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  theme === 'dark'
                    ? 'border-slate-900 dark:border-white bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>{t('darkMode')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Data Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-subtle space-y-4">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <RotateCcw className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            {t('dataSection')}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={handleExportBackup}
            className="flex items-center justify-center space-x-1.5 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('exportDataJson')}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center justify-center space-x-1.5 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('resetData')}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center justify-center space-x-1.5 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 text-xs font-medium transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('clearData')}</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearTransactions}
        title={t('clearData')}
        message={t('confirmClearData')}
        confirmText={t('clearData')}
        isDestructive={true}
      />

      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetDemoData}
        title={t('resetData')}
        message={t('confirmResetData')}
        confirmText={t('resetData')}
        isDestructive={false}
      />
    </div>
  );
};
