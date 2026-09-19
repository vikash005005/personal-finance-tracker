import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  BarChart3,
  Settings,
  LogOut,
  X,
  CreditCard,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const mainNav = [
    { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('transactions'), href: '/transactions', icon: Receipt },
    { name: t('budget'), href: '/budget', icon: PieChart },
    { name: t('savingsGoals'), href: '/savings-goals', icon: Target },
    { name: t('reports'), href: '/reports', icon: BarChart3 },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Brand */}
        <div className="flex items-center justify-between h-14 px-5 border-b border-slate-100 dark:border-slate-800">
          <NavLink to="/dashboard" className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-md bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              FinanceTrack
            </span>
          </NavLink>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          <div>
            <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Overview
            </div>
            <nav className="space-y-1">
              {mainNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={({ isActive }) =>
                      `flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div>
            <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Preferences
            </div>
            <nav className="space-y-1">
              <NavLink
                to="/settings"
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`
                }
              >
                <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>{t('settings')}</span>
              </NavLink>
            </nav>
          </div>
        </div>

        {/* User Card & Logout at bottom */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-850">
            <div className="flex items-center space-x-2.5 min-w-0">
              <img
                src={
                  user?.avatar ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                }
                alt={user?.name || 'User'}
                className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {user?.name || 'Arjun Sharma'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.email || 'arjun.sharma@example.com'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title={t('logout')}
              aria-label="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
