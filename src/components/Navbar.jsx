import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sun,
  Moon,
  Globe,
  Bell,
  Search,
  Menu,
  LogOut,
  Settings as SettingsIcon,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { CURRENCIES } from '../constants/currencies';

export const Navbar = ({ onOpenSidebar, pageTitle }) => {
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const { currency, setCurrency } = useFinance();
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const langRef = useRef(null);
  const currRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
      if (langRef.current && !langRef.current.contains(e.target)) setShowLangMenu(false);
      if (currRef.current && !currRef.current.contains(e.target)) setShowCurrencyMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/transactions?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const notificationsList = [
    {
      id: 1,
      title: 'Salary Credited',
      desc: 'TCS Ltd deposited ₹85,000 via NEFT.',
      time: 'Yesterday',
    },
    {
      id: 2,
      title: 'Mutual Fund SIP',
      desc: 'Zerodha Coin executed monthly SIP of ₹15,000.',
      time: '3 days ago',
    },
    {
      id: 3,
      title: 'Budget Alert (Groceries)',
      desc: 'Spent 42% of monthly ₹8,000 grocery allocation.',
      time: '4 days ago',
    },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 md:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      {/* Left: Hamburger & Breadcrumb */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenSidebar}
          className="p-1.5 -ml-1.5 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="hidden sm:inline font-medium">FinanceTrack</span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-600">/</span>
          <h1 className="text-xs font-semibold text-slate-900 dark:text-white capitalize">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Middle: Clean Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-xs mx-6">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search records (Ctrl+K)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-12 py-1.5 text-xs bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-md border border-slate-200 dark:border-slate-800 focus:border-slate-400 dark:focus:border-slate-600 focus:outline-none transition-colors"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pointer-events-none font-mono">
            /
          </kbd>
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-1 sm:space-x-1.5">
        {/* Currency Switcher */}
        <div className="relative" ref={currRef}>
          <button
            onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
            className="flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800"
            title="Change Currency"
          >
            <span className="font-mono">{CURRENCIES[currency]?.symbol}</span>
            <span>{currency}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showCurrencyMenu && (
            <div className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-50 text-xs">
              {Object.values(CURRENCIES).map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => {
                    setCurrency(curr.code);
                    setShowCurrencyMenu(false);
                  }}
                  className="flex items-center justify-between w-full px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <span>
                    <span className="font-mono mr-1.5">{curr.symbol}</span>
                    {curr.code}
                  </span>
                  {currency === curr.code && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Language Switcher */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800"
            title="Change Language"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span className="uppercase text-[11px] font-semibold">{language}</span>
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-1.5 w-32 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-50 text-xs">
              <button
                onClick={() => {
                  setLanguage('en');
                  setShowLangMenu(false);
                }}
                className="flex items-center justify-between w-full px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <span>English</span>
                {language === 'en' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              </button>
              <button
                onClick={() => {
                  setLanguage('hi');
                  setShowLangMenu(false);
                }}
                className="flex items-center justify-between w-full px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <span>हिन्दी (Hindi)</span>
                {language === 'hi' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800"
          title={isDark ? t('lightMode') : t('darkMode')}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setUnreadCount(0);
            }}
            className="relative p-1.5 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800"
            title={t('notifications')}
            aria-label="Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-600 rounded-full" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-1.5 w-72 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 p-2.5 z-50">
              <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                  {t('notifications')}
                </span>
                <span className="text-[10px] text-slate-400">Activity</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-1 max-h-56 overflow-y-auto">
                {notificationsList.map((notif) => (
                  <div key={notif.id} className="py-2 px-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {notif.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {notif.desc}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{notif.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div className="relative pl-1" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-1.5 p-0.5 rounded-full hover:ring-1 hover:ring-slate-400 transition-all"
          >
            <img
              src={
                user?.avatar ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
              }
              alt={user?.name || 'User'}
              className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 text-xs">
              <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-slate-900 dark:text-white truncate">
                  {user?.name || 'Arjun Sharma'}
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {user?.email || 'arjun.sharma@example.com'}
                </p>
              </div>

              <div className="pt-1 space-y-0.5">
                <button
                  onClick={() => {
                    navigate('/settings');
                    setShowProfileMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-2.5 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('settings')}</span>
                </button>

                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="flex items-center space-x-2 w-full px-2.5 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>{t('logout')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
