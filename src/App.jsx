import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import { ToastProvider } from './context/ToastContext';

import { AppLayout } from './layouts/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { BudgetPage } from './pages/BudgetPage';
import { SavingsGoalsPage } from './pages/SavingsGoalsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { RecurringPage } from './pages/RecurringPage';
import { ExpenseSplitPage } from './pages/ExpenseSplitPage';

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <FinanceProvider>
            <ToastProvider>
              <Router>
                <Routes>
                  {/* Public Pages */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Authenticated Dashboard Pages */}
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/transactions" element={<TransactionsPage />} />
                    <Route path="/expense-split" element={<ExpenseSplitPage />} />
                    <Route path="/recurring" element={<RecurringPage />} />
                    <Route path="/budget" element={<BudgetPage />} />
                    <Route path="/savings-goals" element={<SavingsGoalsPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Router>
            </ToastProvider>
          </FinanceProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
