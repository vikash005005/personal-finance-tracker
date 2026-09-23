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

// Helper: generate all dates an occurrence should fire between startDate and today
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
    if (next <= current) break; // safety guard
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

  // Sync to LocalStorage
  useEffect(() => { localStorage.setItem('finance_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('finance_budgets', JSON.stringify(budgets)); }, [budgets]);
  useEffect(() => { localStorage.setItem('finance_savings_goals', JSON.stringify(savingsGoals)); }, [savingsGoals]);
  useEffect(() => { localStorage.setItem('finance_currency', currency); }, [currency]);
  useEffect(() => { localStorage.setItem('finance_recurring_rules', JSON.stringify(recurringRules)); }, [recurringRules]);

  // Actions
  const setCurrency = (code) => { if (CURRENCIES[code]) setCurrencyState(code); };

  const addTransaction = (transaction) => {
    const newTx = {
      ...transaction,
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      amount: Number(transaction.amount) || 0,
    };
    setTransactions((prev) => [newTx, ...prev]);
    return newTx;
  };

  const updateTransaction = (id, updatedData) => {
    setTransactions((prev) =>
      prev.map((t) => t.id === id ? { ...t, ...updatedData, amount: Number(updatedData.amount) || t.amount } : t)
    );
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const clearAllTransactions = () => { setTransactions([]); };

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

  // Process recurring transactions (idempotent - uses deterministic IDs)
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

  // Auto-process on mount + whenever recurring rules change
  useEffect(() => {
    processRecurringTransactions();
  }, [processRecurringTransactions]);

  const resetToDemoData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
    setRecurringRules(INITIAL_RECURRING);
  };

  const formatAmount = (amountInINR) => formatCurrency(amountInINR, currency);

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

    // Budget usage: total budget categories
    const totalBudgeted = budgets.reduce((s, b) => s + (Number(b.amount) || 0), 0);
    const totalBudgetSpent = budgets.reduce((s, b) => {
      return s + transactions
        .filter((t) => t.type === 'expense' && t.category === b.category && t.date?.startsWith(ymKey))
        .reduce((ss, t) => ss + (Number(t.amount) || 0), 0);
    }, 0);
    const budgetUsage = totalBudgeted > 0 ? Math.min(100, (totalBudgetSpent / totalBudgeted) * 100) : 0;

    // Goal progress average
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

  // Dynamic Chart Data
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

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgets,
        savingsGoals,
        recurringRules,
        currency,
        setCurrency,
        formatAmount,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        clearAllTransactions,
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
