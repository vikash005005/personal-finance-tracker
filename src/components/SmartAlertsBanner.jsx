import React from 'react';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  Calendar,
  X,
  Check,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';

export const SmartAlertsBanner = () => {
  const { smartAlerts, dismissAlert, markAlertAsRead, clearAllAlerts } = useFinance();
  const { t } = useLanguage();

  if (!smartAlerts || smartAlerts.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-subtle flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {t('allCaughtUp')}
            </h4>
            <p className="text-[11px] text-slate-400">
              {t('noAlertsDesc')}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
          Real-time
        </span>
      </div>
    );
  }

  const getAlertIcon = (type) => {
    switch (type) {
      case 'danger':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getAlertBadgeClass = (type) => {
    switch (type) {
      case 'danger':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'warning':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'success':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-subtle space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            {t('smartAlerts')} ({smartAlerts.length})
          </h3>
        </div>
        <button
          onClick={clearAllAlerts}
          className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          {t('clearNotifications')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {smartAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg border text-xs flex items-start justify-between space-x-2.5 transition-colors ${
              alert.isRead
                ? 'bg-slate-50 dark:bg-slate-850/50 border-slate-100 dark:border-slate-800'
                : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 shadow-xs'
            }`}
          >
            <div className="flex items-start space-x-2 min-w-0">
              <div className="mt-0.5 flex-shrink-0">{getAlertIcon(alert.type)}</div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5 mb-0.5">
                  <span
                    className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold border ${getAlertBadgeClass(
                      alert.type
                    )}`}
                  >
                    {t(alert.titleKey) || alert.titleKey}
                  </span>
                  {!alert.isRead && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
                  {alert.message}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1 flex-shrink-0">
              {!alert.isRead && (
                <button
                  onClick={() => markAlertAsRead(alert.id)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  title={t('markAllRead')}
                >
                  <Check className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={() => dismissAlert(alert.id)}
                className="p-1 rounded text-slate-400 hover:text-rose-600"
                title={t('dismissAlert')}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
