import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

export const LoginPage = () => {
  const { login, demoLogin } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('arjun.sharma@example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError(t('fillAllFields'));
      return;
    }

    login(email, password);
    showToast('Logged in successfully', 'success');
    navigate('/dashboard');
  };

  const handleDemo = () => {
    demoLogin();
    showToast('Logged in as Demo User (Arjun Sharma)', 'success');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="w-full max-w-sm space-y-5">
        {/* Brand */}
        <div className="text-center space-y-1.5">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-7 h-7 rounded-md bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="text-base font-bold tracking-tight">FinanceTrack</span>
          </Link>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-2">
            {t('welcomeBack')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to access your personal finance workspace
          </p>
        </div>

        {/* Card */}
        <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle space-y-4">
          {error && (
            <div className="p-2.5 text-xs rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  required
                  placeholder="name@example.com"
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  required
                  placeholder="••••••••"
                  className="w-full pl-8 pr-8 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-500 w-3.5 h-3.5"
                />
                <span>{t('rememberMe')}</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 shadow-subtle transition-colors"
            >
              {t('login')}
            </button>
          </form>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-2 text-[10px] text-slate-400 uppercase">
              Or
            </span>
          </div>

          <button
            type="button"
            onClick={handleDemo}
            className="w-full py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200 transition-colors shadow-subtle"
          >
            1-Click Demo Login
          </button>

          <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            {t('dontHaveAccount')}{' '}
            <Link to="/register" className="font-semibold text-slate-900 dark:text-white underline">
              {t('createAccount')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
