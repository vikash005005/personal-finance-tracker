import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_SAVINGS_GOALS,
  INITIAL_RECURRING,
  CATEGORIES,
} from '../constants/initialData';
import { CURRENCIES, formatCurrency } from '../constants/currencies';

const FinanceContext = createContext();

const DEFAULT_DASHBOARD_CONFIG = {
  balance: true,
  income: true,
  expenses: true,
  savings: true,
  cashflowChart: true,
  categoryChart: true,
  savingsTrend: true,
  recentTransactions: true,
  budgetOverview: true,
  savingsGoals: true,
  financialHealth: true,
  smartAlerts: true,
};

// Helper: generate occurrence dates for recurring rules
function getOccurrenceDates(rule, upToDate) {
  const dates = [];
  const start = new Date(rule.startDate);
  const end = rule.endDate ? new Date(rule.endDate) : upToDate;
  const effectiveEnd = end < upToDate ? end : upToDate;

  let current = new Date(start);

  while (current <= effectiveEnd) {
    dates.push(current.toISOString().split('T')[0]);
    const next = new Date(current);
    switch (rule.frequency) {
      case 'daily':   next.setDate(next.getDate() + 1); break;
      case 'weekly':  next.setDate(next.getDate() + 7); break;
      case 'monthly': next.setMonth(next.getMonth() + 1); break;
      case 'yearly':  next.setFullYear(next.getFullYear() + 1); break;
      default: break;
    }
    if (next <= current) break;
    current = next;
  }
  return dates;
}

export const FinanceProvider = ({ children }) => {
  // 1. Transactions State
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('finance_transactions');
    if (saved) { try { return JSON.parse(saved); } catch { return INITIAL_TRANSACTIONS; } }
    return INITIAL_TRANSACTIONS;
  });

  // 2. Budgets State
  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem('finance_budgets');
    if (saved) { try { return JSON.parse(saved); } catch { return INITIAL_BUDGETS; } }
    return INITIAL_BUDGETS;
  });

  // 3. Savings Goals State
  const [savingsGoals, setSavingsGoals] = useState(() => {
    const saved = localStorage.getItem('finance_savings_goals');
    if (saved) { try { return JSON.parse(saved); } catch { return INITIAL_SAVINGS_GOALS; } }
    return INITIAL_SAVINGS_GOALS;
  });

  // 4. Currency State
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('finance_currency') || 'INR';
  });

  // 5. Recurring Rules State
  const [recurringRules, setRecurringRules] = useState(() => {
    const saved = localStorage.getItem('finance_recurring_rules');
    if (saved) { try { return JSON.parse(saved); } catch { return INITIAL_RECURRING; } }
    return INITIAL_RECURRING;
  });

  // 6. Dashboard Customization State
  const [dashboardConfig, setDashboardConfig] = useState(() => {
    const saved = localStorage.getItem('finance_dashboard_config');
    if (saved) {
      try {
        return { ...DEFAULT_DASHBOARD_CONFIG, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_DASHBOARD_CONFIG;
      }
    }
    return DEFAULT_DASHBOARD_CONFIG;
  });

  // 7. Expense Splits State
  const [expenseSplits, setExpenseSplits] = useState(() => {
    const saved = localStorage.getItem('finance_expense_splits');
    if (saved) { try { return JSON.parse(saved); } catch { return []; } }
    return [];
  });

  // 8. Smart Alerts State (Read & Dismissed IDs)
  const [readAlertIds, setReadAlertIds] = useState(() => {
    const saved = localStorage.getItem('finance_read_alerts');
    if (saved) { try { return JSON.parse(saved); } catch { return []; } }
    return [];
  });

  const [dismissedAlertIds, setDismissedAlertIds] = useState(() => {
    const saved = localStorage.getItem('finance_dismissed_alerts');
    if (saved) { try { return JSON.parse(saved); } catch { return []; } }
    return [];
  });

  // Sync to LocalStorage
  useEffect(() => { localStorage.setItem('finance_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('finance_budgets', JSON.stringify(budgets)); }, [budgets]);
  useEffect(() => { localStorage.setItem('finance_savings_goals', JSON.stringify(savingsGoals)); }, [savingsGoals]);
  useEffect(() => { localStorage.setItem('finance_currency', currency); }, [currency]);
  useEffect(() => { localStorage.setItem('finance_recurring_rules', JSON.stringify(recurringRules)); }, [recurringRules]);
  useEffect(() => { localStorage.setItem('finance_dashboard_config', JSON.stringify(dashboardConfig)); }, [dashboardConfig]);
  useEffect(() => { localStorage.setItem('finance_expense_splits', JSON.stringify(expenseSplits)); }, [expenseSplits]);
  useEffect(() => { localStorage.setItem('finance_read_alerts', JSON.stringify(readAlertIds)); }, [readAlertIds]);
  useEffect(() => { localStorage.setItem('finance_dismissed_alerts', JSON.stringify(dismissedAlertIds)); }, [dismissedAlertIds]);

  // Actions
  const setCurrency = (code) => { if (CURRENCIES[code]) setCurrencyState(code); };

  const addTransaction = (transaction) => {
    const newTx = {
      ...transaction,
      id: transaction.id || ('tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5)),
      amount: Number(transaction.amount) || 0,
      paymentMethod: transaction.paymentMethod || 'Other',
      receiptUrl: transaction.receiptUrl || null,
    };
    setTransactions((prev) => [newTx, ...prev]);
    return newTx;
  };

  const updateTransaction = (id, updatedData) => {
    setTransactions((prev) =>
      prev.map((t) => t.id === id ? {
        ...t,
        ...updatedData,
        amount: Number(updatedData.amount) || t.amount,
        paymentMethod: updatedData.paymentMethod || t.paymentMethod || 'Other',
        receiptUrl: updatedData.receiptUrl !== undefined ? updatedData.receiptUrl : t.receiptUrl,
      } : t)
    );
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const clearAllTransactions = () => { setTransactions([]); };

  // CSV Import (with validation and duplicate check)
  const importTransactions = (newTransactions) => {
    if (!Array.isArray(newTransactions) || newTransactions.length === 0) {
      return { imported: 0, skipped: 0 };
    }

    let importedCount = 0;
    let skippedCount = 0;

    setTransactions((prevTx) => {
      // Build a set of existing keys for deduplication
      const existingKeySet = new Set(
        prevTx.map((t) => `${(t.title || '').trim().toLowerCase()}_${Number(t.amount)}_${t.date}_${t.type}`)
      );

      const toAdd = [];
      newTransactions.forEach((tx) => {
        const key = `${(tx.title || '').trim().toLowerCase()}_${Number(tx.amount)}_${tx.date}_${tx.type}`;
        if (!existingKeySet.has(key)) {
          toAdd.push({
            id: 'tx-imp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            title: tx.title.trim(),
            amount: Number(tx.amount) || 0,
            type: tx.type === 'income' ? 'income' : 'expense',
            category: tx.category || (tx.type === 'income' ? 'Salary' : 'Other'),
            date: tx.date,
            description: tx.description || '',
            paymentMethod: tx.paymentMethod || 'Other',
            receiptUrl: null,
          });
          existingKeySet.add(key);
          importedCount++;
        } else {
          skippedCount++;
        }
      });

      if (toAdd.length === 0) return prevTx;
      return [...toAdd, ...prevTx].sort((a, b) => new Date(b.date) - new Date(a.date));
    });

    return { imported: importedCount, skipped: skippedCount };
  };

  const addBudget = (budget) => {
    const newBudget = { ...budget, id: 'b-' + Date.now(), amount: Number(budget.amount) || 0 };
    setBudgets((prev) => {
      const existing = prev.findIndex((b) => b.category === budget.category);
      if (existing !== -1) { const copy = [...prev]; copy[existing] = newBudget; return copy; }
      return [...prev, newBudget];
    });
    return newBudget;
  };

  const updateBudget = (id, updatedData) => {
    setBudgets((prev) => prev.map((b) => b.id === id ? { ...b, ...updatedData, amount: Number(updatedData.amount) || b.amount } : b));
  };

  const deleteBudget = (id) => { setBudgets((prev) => prev.filter((b) => b.id !== id)); };

  const addSavingsGoal = (goal) => {
    const newGoal = { ...goal, id: 'g-' + Date.now(), targetAmount: Number(goal.targetAmount) || 0, savedAmount: Number(goal.savedAmount) || 0, color: goal.color || '#6366f1' };
    setSavingsGoals((prev) => [...prev, newGoal]);
    return newGoal;
  };

  const updateSavingsGoal = (id, updatedData) => {
    setSavingsGoals((prev) => prev.map((g) => g.id === id ? { ...g, ...updatedData, targetAmount: Number(updatedData.targetAmount) || g.targetAmount, savedAmount: Number(updatedData.savedAmount) ?? g.savedAmount } : g));
  };

  const deleteSavingsGoal = (id) => { setSavingsGoals((prev) => prev.filter((g) => g.id !== id)); };

  const addFundsToGoal = (id, amountToAdd) => {
    const val = Number(amountToAdd) || 0;
    if (val <= 0) return;
    let reachedTarget = false;
    setSavingsGoals((prev) => prev.map((g) => {
      if (g.id === id) {
        const newSaved = g.savedAmount + val;
        if (newSaved >= g.targetAmount && g.savedAmount < g.targetAmount) reachedTarget = true;
        return { ...g, savedAmount: newSaved };
      }
      return g;
    }));
    return { reachedTarget };
  };

  // Recurring Rule Actions
  const addRecurringRule = (rule) => {
    const newRule = {
      ...rule,
      id: 'rec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      amount: Number(rule.amount) || 0,
      isActive: true,
    };
    setRecurringRules((prev) => [newRule, ...prev]);
    return newRule;
  };

  const updateRecurringRule = (id, updatedData) => {
    setRecurringRules((prev) => prev.map((r) => r.id === id ? { ...r, ...updatedData, amount: Number(updatedData.amount) || r.amount } : r));
  };

  const deleteRecurringRule = (id) => {
    setRecurringRules((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleRecurringRule = (id) => {
    setRecurringRules((prev) => prev.map((r) => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  // Process recurring transactions
  const processRecurringTransactions = useCallback(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    setTransactions((prevTx) => {
      const existingIds = new Set(prevTx.map((t) => t.id));
      const toAdd = [];

      recurringRules.forEach((rule) => {
        if (!rule.isActive) return;
        const occurrenceDates = getOccurrenceDates(rule, today);
        occurrenceDates.forEach((dateStr) => {
          const deterministicId = `rec-tx-${rule.id}-${dateStr}`;
          if (!existingIds.has(deterministicId)) {
            toAdd.push({
              id: deterministicId,
              title: rule.title,
              amount: Number(rule.amount) || 0,
              type: rule.type,
              category: rule.category,
              date: dateStr,
              description: rule.description || '',
              paymentMethod: rule.paymentMethod || 'Other',
              receiptUrl: null,
              recurringRuleId: rule.id,
            });
            existingIds.add(deterministicId);
          }
        });
      });

      if (toAdd.length === 0) return prevTx;
      return [...toAdd, ...prevTx].sort((a, b) => new Date(b.date) - new Date(a.date));
    });
  }, [recurringRules]);

  useEffect(() => {
    processRecurringTransactions();
  }, [processRecurringTransactions]);

  // Dashboard Customization Actions
  const updateDashboardConfig = (key, value) => {
    setDashboardConfig((prev) => ({ ...prev, [key]: value }));
  };

  const resetDashboardConfig = () => {
    setDashboardConfig(DEFAULT_DASHBOARD_CONFIG);
  };

  // Expense Split Actions
  const addExpenseSplit = (splitRecord, recordAsTx = true, recordFull = false) => {
    const newSplit = {
      ...splitRecord,
      id: 'split-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setExpenseSplits((prev) => [newSplit, ...prev]);

    if (recordAsTx) {
      const myShare = splitRecord.participants.find((p) => p.isUser)?.share || 0;
      const txAmount = recordFull ? splitRecord.totalAmount : myShare;
      const otherNames = splitRecord.participants.filter((p) => !p.isUser).map((p) => p.name).join(', ');

      addTransaction({
        title: splitRecord.title || 'Shared Expense',
        amount: txAmount,
        type: 'expense',
        category: splitRecord.category || 'Food',
        date: splitRecord.date || new Date().toISOString().split('T')[0],
        paymentMethod: splitRecord.paymentMethod || 'UPI',
        description: `Split with ${otherNames}. Total: ${splitRecord.totalAmount}, Your share: ${myShare}`,
        receiptUrl: null,
      });
    }

    return newSplit;
  };

  const deleteExpenseSplit = (id) => {
    setExpenseSplits((prev) => prev.filter((s) => s.id !== id));
  };

  // Helper for current month spending by category
  const getCategorySpentCurrentMonth = (categoryName) => {
    const now = new Date();
    return transactions
      .filter((t) => {
        if (t.type !== 'expense' || t.category !== categoryName) return false;
        const txDate = new Date(t.date);
        return txDate.getFullYear() === now.getFullYear() && txDate.getMonth() === now.getMonth();
      })
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  };

  // Aggregates
  const totalIncome = useMemo(() => transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + (Number(t.amount) || 0), 0), [transactions]);
  const totalExpenses = useMemo(() => transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + (Number(t.amount) || 0), 0), [transactions]);
  const currentBalance = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]);
  const totalSavings = useMemo(() => savingsGoals.reduce((sum, g) => sum + (Number(g.savedAmount) || 0), 0), [savingsGoals]);
  const savingsRate = useMemo(() => {
    if (totalIncome <= 0) return 0;
    const rate = ((totalIncome - totalExpenses) / totalIncome) * 100;
    return rate > 0 ? rate : 0;
  }, [totalIncome, totalExpenses]);

  // SMART ALERTS (Calculated from REAL financial data)
  const smartAlerts = useMemo(() => {
    const alerts = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const ymKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

    // 1. Budget Alerts (Warning at >= 80%, Exceeded at > 100%)
    budgets.forEach((b) => {
      const spent = transactions
        .filter((t) => {
          if (t.type !== 'expense' || t.category !== b.category) return false;
          const d = new Date(t.date);
          return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
        })
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      const usage = b.amount > 0 ? (spent / b.amount) * 100 : 0;

      if (spent > b.amount) {
        alerts.push({
          id: `alert-budget-exceeded-${b.category}-${ymKey}`,
          type: 'danger',
          titleKey: 'alertBudgetExceeded',
          message: `Your ${b.category} spending has exceeded this month's budget (${Math.round(usage)}% used).`,
          date: 'Active',
          timestamp: Date.now(),
        });
      } else if (usage >= 80) {
        alerts.push({
          id: `alert-budget-warning-${b.category}-${ymKey}`,
          type: 'warning',
          titleKey: 'alertBudgetWarning',
          message: `You have used ${Math.round(usage)}% of your ${b.category} budget.`,
          date: 'Active',
          timestamp: Date.now(),
        });
      }
    });

    // 2. Savings Goal Milestones (>= 75% or 100%)
    savingsGoals.forEach((g) => {
      const pct = g.targetAmount > 0 ? (g.savedAmount / g.targetAmount) * 100 : 0;
      if (pct >= 75) {
        alerts.push({
          id: `alert-goal-${g.id}`,
          type: 'success',
          titleKey: 'alertSavingsGoal',
          message: `You are ${Math.round(pct)}% of the way toward your "${g.name}" goal.`,
          date: 'Milestone',
          timestamp: Date.now(),
        });
      }
    });

    // 3. High Spending Alert (Current month expenses vs previous 2 months average)
    const lastMonthKey = `${currentMonth === 0 ? currentYear - 1 : currentYear}-${String(currentMonth === 0 ? 12 : currentMonth).padStart(2, '0')}`;
    const curMonthExpenses = transactions
      .filter((t) => t.type === 'expense' && t.date?.startsWith(ymKey))
      .reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const lastMonthExpenses = transactions
      .filter((t) => t.type === 'expense' && t.date?.startsWith(lastMonthKey))
      .reduce((s, t) => s + (Number(t.amount) || 0), 0);

    if (lastMonthExpenses > 0 && curMonthExpenses > lastMonthExpenses * 1.15) {
      alerts.push({
        id: `alert-high-spending-${ymKey}`,
        type: 'warning',
        titleKey: 'alertHighSpending',
        message: `Your spending this month is significantly higher than your previous month's spending.`,
        date: 'Recent',
        timestamp: Date.now(),
      });
    }

    // 4. Low Savings Alert (Savings rate dropped compared to prior month)
    const curMonthIncome = transactions.filter((t) => t.type === 'income' && t.date?.startsWith(ymKey)).reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const lastMonthIncome = transactions.filter((t) => t.type === 'income' && t.date?.startsWith(lastMonthKey)).reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const curRate = curMonthIncome > 0 ? ((curMonthIncome - curMonthExpenses) / curMonthIncome) * 100 : 0;
    const lastRate = lastMonthIncome > 0 ? ((lastMonthIncome - lastMonthExpenses) / lastMonthIncome) * 100 : 0;

    if (lastRate > 20 && curRate < lastRate - 10) {
      alerts.push({
        id: `alert-low-savings-${ymKey}`,
        type: 'info',
        titleKey: 'alertLowSavings',
        message: `Your savings rate (${Math.round(curRate)}%) has decreased compared with last month (${Math.round(lastRate)}%).`,
        date: 'Trend',
        timestamp: Date.now(),
      });
    }

    // 5. Recurring Payment Due in the next 3 days
    recurringRules.forEach((rule) => {
      if (!rule.isActive) return;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let cur = new Date(rule.startDate);
      const end = rule.endDate ? new Date(rule.endDate) : null;
      while (cur < today) {
        const next = new Date(cur);
        switch (rule.frequency) {
          case 'daily':   next.setDate(next.getDate() + 1); break;
          case 'weekly':  next.setDate(next.getDate() + 7); break;
          case 'monthly': next.setMonth(next.getMonth() + 1); break;
          case 'yearly':  next.setFullYear(next.getFullYear() + 1); break;
          default: break;
        }
        if (next <= cur) break;
        cur = next;
      }
      if (end && cur > end) return;
      const diffDays = Math.ceil((cur - today) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 3) {
        alerts.push({
          id: `alert-recurring-due-${rule.id}-${cur.toISOString().split('T')[0]}`,
          type: 'info',
          titleKey: 'alertRecurringDue',
          message: `${rule.title} (${formatCurrency(rule.amount, currency)}) is scheduled for ${diffDays === 0 ? 'today' : `in ${diffDays} day(s)`}.`,
          date: 'Upcoming',
          timestamp: Date.now(),
        });
      }
    });

    // Filter out dismissed alerts and attach isRead state
    return alerts
      .filter((a) => !dismissedAlertIds.includes(a.id))
      .map((a) => ({
        ...a,
        isRead: readAlertIds.includes(a.id),
      }));
  }, [budgets, savingsGoals, transactions, recurringRules, currency, dismissedAlertIds, readAlertIds]);

  const unreadAlertCount = useMemo(() => {
    return smartAlerts.filter((a) => !a.isRead).length;
  }, [smartAlerts]);

  const markAlertAsRead = (id) => {
    setReadAlertIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const markAllAlertsAsRead = () => {
    const allIds = smartAlerts.map((a) => a.id);
    setReadAlertIds((prev) => Array.from(new Set([...prev, ...allIds])));
  };

  const dismissAlert = (id) => {
    setDismissedAlertIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const clearAllAlerts = () => {
    const allIds = smartAlerts.map((a) => a.id);
    setDismissedAlertIds((prev) => Array.from(new Set([...prev, ...allIds])));
  };

  // Financial Health Metrics (current month)
  const financialHealth = useMemo(() => {
    const now = new Date();
    const ymKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const monthIncome = transactions
      .filter((t) => t.type === 'income' && t.date?.startsWith(ymKey))
      .reduce((s, t) => s + (Number(t.amount) || 0), 0);

    const monthExpense = transactions
      .filter((t) => t.type === 'expense' && t.date?.startsWith(ymKey))
      .reduce((s, t) => s + (Number(t.amount) || 0), 0);

    const monthCashFlow = monthIncome - monthExpense;

    const savingsRateMonth = monthIncome > 0
      ? Math.max(0, ((monthIncome - monthExpense) / monthIncome) * 100)
      : 0;

    const expenseRatio = monthIncome > 0
      ? Math.min(100, (monthExpense / monthIncome) * 100)
      : 0;

    const totalBudgeted = budgets.reduce((s, b) => s + (Number(b.amount) || 0), 0);
    const totalBudgetSpent = budgets.reduce((s, b) => {
      return s + transactions
        .filter((t) => t.type === 'expense' && t.category === b.category && t.date?.startsWith(ymKey))
        .reduce((ss, t) => ss + (Number(t.amount) || 0), 0);
    }, 0);
    const budgetUsage = totalBudgeted > 0 ? Math.min(100, (totalBudgetSpent / totalBudgeted) * 100) : 0;

    const goalProgress = savingsGoals.length > 0
      ? savingsGoals.reduce((s, g) => {
          const pct = g.targetAmount > 0 ? Math.min(100, (g.savedAmount / g.targetAmount) * 100) : 0;
          return s + pct;
        }, 0) / savingsGoals.length
      : 0;

    return {
      monthIncome,
      monthExpense,
      monthCashFlow,
      savingsRate: savingsRateMonth,
      expenseRatio,
      budgetUsage,
      goalProgress,
    };
  }, [transactions, budgets, savingsGoals]);

  // Chart Data
  const monthlyChartData = useMemo(() => {
    const monthMap = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap[key] = { key, month: d.toLocaleString('en-US', { month: 'short' }), income: 0, expense: 0 };
    }
    transactions.forEach((tx) => {
      if (!tx.date) return;
      const key = tx.date.substring(0, 7);
      if (monthMap[key]) {
        if (tx.type === 'income') monthMap[key].income += Number(tx.amount) || 0;
        else if (tx.type === 'expense') monthMap[key].expense += Number(tx.amount) || 0;
      }
    });
    return Object.values(monthMap);
  }, [transactions]);

  const categoryChartData = useMemo(() => {
    const catMap = {};
    transactions.filter((t) => t.type === 'expense').forEach((tx) => {
      const cat = tx.category || 'Other';
      catMap[cat] = (catMap[cat] || 0) + (Number(tx.amount) || 0);
    });
    return Object.entries(catMap).map(([name, value]) => {
      const catMeta = CATEGORIES.find((c) => c.id === name);
      return { name, value, color: catMeta ? catMeta.color : '#94a3b8' };
    }).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const savingsTrendData = useMemo(() => {
    const months = [];
    const now = new Date();
    let accumulated = 0;
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const mIncome = transactions.filter((t) => t.type === 'income' && t.date?.startsWith(key)).reduce((s, t) => s + (Number(t.amount) || 0), 0);
      const mExpense = transactions.filter((t) => t.type === 'expense' && t.date?.startsWith(key)).reduce((s, t) => s + (Number(t.amount) || 0), 0);
      const net = mIncome - mExpense;
      accumulated = Math.max(0, accumulated + (net > 0 ? net : 0));
      months.push({ month: d.toLocaleString('en-US', { month: 'short' }), savings: accumulated, netFlow: net });
    }
    return months;
  }, [transactions]);

  const resetToDemoData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
    setRecurringRules(INITIAL_RECURRING);
    setDashboardConfig(DEFAULT_DASHBOARD_CONFIG);
    setExpenseSplits([]);
    setReadAlertIds([]);
    setDismissedAlertIds([]);
  };

  const formatAmount = (amountInINR) => formatCurrency(amountInINR, currency);

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgets,
        savingsGoals,
        recurringRules,
        dashboardConfig,
        updateDashboardConfig,
        resetDashboardConfig,
        expenseSplits,
        addExpenseSplit,
        deleteExpenseSplit,
        smartAlerts,
        unreadAlertCount,
        markAlertAsRead,
        markAllAlertsAsRead,
        dismissAlert,
        clearAllAlerts,
        currency,
        setCurrency,
        formatAmount,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        clearAllTransactions,
        importTransactions,
        addBudget,
        updateBudget,
        deleteBudget,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        addFundsToGoal,
        addRecurringRule,
        updateRecurringRule,
        deleteRecurringRule,
        toggleRecurringRule,
        processRecurringTransactions,
        resetToDemoData,
        totalIncome,
        totalExpenses,
        currentBalance,
        totalSavings,
        savingsRate,
        financialHealth,
        getCategorySpentCurrentMonth,
        monthlyChartData,
        categoryChartData,
        savingsTrendData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
};
