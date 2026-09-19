import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_SAVINGS_GOALS,
  CATEGORIES,
} from '../constants/initialData';
import { CURRENCIES, formatCurrency } from '../constants/currencies';

const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
  // 1. Transactions State
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('finance_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_TRANSACTIONS;
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  // 2. Budgets State
  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem('finance_budgets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_BUDGETS;
      }
    }
    return INITIAL_BUDGETS;
  });

  // 3. Savings Goals State
  const [savingsGoals, setSavingsGoals] = useState(() => {
    const saved = localStorage.getItem('finance_savings_goals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_SAVINGS_GOALS;
      }
    }
    return INITIAL_SAVINGS_GOALS;
  });

  // 4. Currency State
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('finance_currency') || 'INR';
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('finance_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finance_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('finance_savings_goals', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem('finance_currency', currency);
  }, [currency]);

  // Actions
  const setCurrency = (code) => {
    if (CURRENCIES[code]) {
      setCurrencyState(code);
    }
  };

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
      prev.map((t) =>
        t.id === id
          ? { ...t, ...updatedData, amount: Number(updatedData.amount) || t.amount }
          : t
      )
    );
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const clearAllTransactions = () => {
    setTransactions([]);
  };

  const addBudget = (budget) => {
    const newBudget = {
      ...budget,
      id: 'b-' + Date.now(),
      amount: Number(budget.amount) || 0,
    };
    // Replace if category already exists, or append
    setBudgets((prev) => {
      const existing = prev.findIndex((b) => b.category === budget.category);
      if (existing !== -1) {
        const copy = [...prev];
        copy[existing] = newBudget;
        return copy;
      }
      return [...prev, newBudget];
    });
    return newBudget;
  };

  const updateBudget = (id, updatedData) => {
    setBudgets((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, ...updatedData, amount: Number(updatedData.amount) || b.amount }
          : b
      )
    );
  };

  const deleteBudget = (id) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  const addSavingsGoal = (goal) => {
    const newGoal = {
      ...goal,
      id: 'g-' + Date.now(),
      targetAmount: Number(goal.targetAmount) || 0,
      savedAmount: Number(goal.savedAmount) || 0,
      color: goal.color || '#6366f1',
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
    return newGoal;
  };

  const updateSavingsGoal = (id, updatedData) => {
    setSavingsGoals((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              ...updatedData,
              targetAmount: Number(updatedData.targetAmount) || g.targetAmount,
              savedAmount: Number(updatedData.savedAmount) ?? g.savedAmount,
            }
          : g
      )
    );
  };

  const deleteSavingsGoal = (id) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const addFundsToGoal = (id, amountToAdd) => {
    const val = Number(amountToAdd) || 0;
    if (val <= 0) return;

    let reachedTarget = false;

    setSavingsGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const newSaved = g.savedAmount + val;
          if (newSaved >= g.targetAmount && g.savedAmount < g.targetAmount) {
            reachedTarget = true;
          }
          return { ...g, savedAmount: newSaved };
        }
        return g;
      })
    );

    return { reachedTarget };
  };

  const resetToDemoData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
  };

  // Helper to format currency dynamically with currently selected currency
  const formatAmount = (amountInINR) => {
    return formatCurrency(amountInINR, currency);
  };

  // Aggregates
  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [transactions]);

  const totalExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [transactions]);

  const currentBalance = useMemo(() => {
    return totalIncome - totalExpenses;
  }, [totalIncome, totalExpenses]);

  const totalSavings = useMemo(() => {
    return savingsGoals.reduce((sum, g) => sum + (Number(g.savedAmount) || 0), 0);
  }, [savingsGoals]);

  const savingsRate = useMemo(() => {
    if (totalIncome <= 0) return 0;
    const rate = ((totalIncome - totalExpenses) / totalIncome) * 100;
    return rate > 0 ? rate : 0;
  }, [totalIncome, totalExpenses]);

  // Current Month Spending for a category
  const getCategorySpentCurrentMonth = (categoryName) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return transactions
      .filter((t) => {
        if (t.type !== 'expense' || t.category !== categoryName) return false;
        const txDate = new Date(t.date);
        return (
          txDate.getFullYear() === currentYear &&
          txDate.getMonth() === currentMonth
        );
      })
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  };

  // Dynamic Chart Data Providers
  // 1. Monthly Bar Chart (Income vs Expense)
  const monthlyChartData = useMemo(() => {
    const monthMap = {};
    // Last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en-US', { month: 'short' });
      monthMap[key] = { key, month: label, income: 0, expense: 0 };
    }

    transactions.forEach((tx) => {
      if (!tx.date) return;
      const key = tx.date.substring(0, 7); // YYYY-MM
      if (monthMap[key]) {
        if (tx.type === 'income') {
          monthMap[key].income += Number(tx.amount) || 0;
        } else if (tx.type === 'expense') {
          monthMap[key].expense += Number(tx.amount) || 0;
        }
      }
    });

    return Object.values(monthMap);
  }, [transactions]);

  // 2. Expense Category Distribution (Donut / Pie)
  const categoryChartData = useMemo(() => {
    const catMap = {};

    transactions
      .filter((t) => t.type === 'expense')
      .forEach((tx) => {
        const cat = tx.category || 'Other';
        catMap[cat] = (catMap[cat] || 0) + (Number(tx.amount) || 0);
      });

    return Object.entries(catMap)
      .map(([name, value]) => {
        const catMeta = CATEGORIES.find((c) => c.id === name);
        return {
          name,
          value,
          color: catMeta ? catMeta.color : '#94a3b8',
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // 3. Savings Trend
  const savingsTrendData = useMemo(() => {
    // Generate monthly accumulated savings trend based on net flow
    const months = [];
    const now = new Date();
    let accumulated = 0;

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en-US', { month: 'short' });

      // Monthly net
      const monthIncome = transactions
        .filter((t) => t.type === 'income' && t.date?.startsWith(key))
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      const monthExpense = transactions
        .filter((t) => t.type === 'expense' && t.date?.startsWith(key))
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      const net = monthIncome - monthExpense;
      accumulated = Math.max(0, accumulated + (net > 0 ? net : 0));

      months.push({
        month: label,
        savings: accumulated,
        netFlow: net,
      });
    }

    return months;
  }, [transactions]);

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgets,
        savingsGoals,
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
        resetToDemoData,
        totalIncome,
        totalExpenses,
        currentBalance,
        totalSavings,
        savingsRate,
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
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
