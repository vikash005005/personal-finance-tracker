import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Receipt,
  PieChart,
  Target,
  ArrowRight,
  ShieldCheck,
  Check,
  Globe,
  Sun,
  Moon,
  TrendingUp,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';

export const LandingPage = () => {
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { isAuthenticated, demoLogin } = useAuth();
  const { formatAmount } = useFinance();
  const navigate = useNavigate();

  const handleDemoAccess = () => {
    demoLogin();
    navigate('/dashboard');
  };

  const productFeatures = [
    {
      title: 'Real-Time Transaction Ledger',
      desc: 'Track UPI payments, bank transfers, credit debits, and income credits with zero delay and instant category tagging.',
      icon: Receipt,
    },
    {
      title: 'Categorical Spend Allowances',
      desc: 'Establish monthly thresholds for rent, groceries, dining, and utilities. Monitor live usage before overspending happens.',
      icon: PieChart,
    },
    {
      title: 'Dedicated Capital Milestones',
      desc: 'Set goals for emergency funds, tech workstations, or family holidays with clear target dates and deposit progress.',
      icon: Target,
    },
    {
      title: '100% Local Browser Privacy',
      desc: 'No remote servers or telemetry. All financial records are stored securely in your browser HTML5 LocalStorage.',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-slate-900 selection:text-white dark:selection:bg-slate-100 dark:selection:text-slate-900">
      {/* Navigation Bar */}
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-md bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight">FinanceTrack</span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Language switch */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="px-2 py-1 rounded text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              {language === 'en' ? 'हिन्दी' : 'English'}
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            <div className="h-4 w-px bg-slate-200 dark:border-slate-800 mx-1" />

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 transition-colors shadow-subtle"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 transition-colors shadow-subtle"
                >
                  {t('getStarted')}
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 pb-14 sm:pt-24 sm:pb-20 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs font-medium text-slate-600 dark:text-slate-400">
            <span>Product-grade personal finance management</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Take Control of Your Money with Clarity and Precision.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A quiet, deliberate financial dashboard for tracking everyday Indian cashflow, category budgets, and savings milestones. No clutter, no third-party servers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-subtle transition-colors"
            >
              <span>{t('getStarted')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleDemoAccess}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-subtle transition-colors"
            >
              <span>Open Demo Ledger (1-Click)</span>
            </button>
          </div>

          {/* Authentic Live Product Showcase Preview */}
          <div className="pt-10 max-w-3xl mx-auto">
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-5 shadow-subtle text-left space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Live Balance Overview
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Current Month Activity</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono tabular-nums">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-sans">Net Cash Reserve</span>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">₹96,860</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-sans">Monthly Inflow</span>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">+₹1,10,000</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-sans">Monthly Outflow</span>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100">-₹46,559</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-sans">
                <span className="text-slate-600 dark:text-slate-300">
                  Ready to test with pre-loaded TCS salary, Swiggy, and Blinkit records.
                </span>
                <button
                  onClick={handleDemoAccess}
                  className="font-semibold text-slate-900 dark:text-white hover:underline text-xs"
                >
                  Launch App →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Feature Pillars */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-left mb-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Designed for Real Daily Use
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Engineered with strict client-side principles, instant feedback, and clean accounting workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {productFeatures.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-subtle"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 bg-white dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">FinanceTrack</span>
            <span>•</span>
            <span>© 2026. Handcrafted React + Vite Personal Finance Application.</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/login" className="hover:text-slate-900 dark:hover:text-white">
              {t('login')}
            </Link>
            <Link to="/register" className="hover:text-slate-900 dark:hover:text-white">
              {t('register')}
            </Link>
            <button onClick={handleDemoAccess} className="hover:text-slate-900 dark:hover:text-white">
              Demo Access
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
