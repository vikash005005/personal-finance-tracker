# FinanceTrack - Personal Finance Management Web Application

A modern, responsive, and feature-complete **Personal Finance Tracker** built with **React.js, Vite, Tailwind CSS, React Router, and Recharts**.

## 🚀 Key Features

* **Landing Page**: Modern hero section, key feature highlights, interactive stats preview, and direct demo login.
* **Demo Authentication**: LocalStorage persistent login/register with 1-click demo access and profile customization.
* **Real-time Dashboard**:
  * 4 Dynamic Summary Cards: Total Income, Total Expenses, Current Balance, Total Savings with trend indicators.
  * Recharts visual analytics: Monthly Income vs Expense Bar Chart, Expense Category Donut Chart, and Savings Trend Area Chart.
  * Recent transactions with status badges and quick "View All" navigation.
  * Monthly budget health progress bars.
* **Complete Transaction Management**:
  * Add, edit, and delete transactions with category, type, date, amount, and notes.
  * Multi-dimensional filtering: Search by keyword, Type (Income / Expense), Category, and Date Range.
  * Sorting by newest/oldest and amount high/low.
  * Export transaction history directly to CSV.
  * Responsive table on desktop and compact card view on mobile devices.
* **Monthly Budget Tracking**:
  * Set category budgets (Food, Shopping, Travel, Bills, etc.).
  * Real-time calculation of current month spending from recorded transactions.
  * Three-tier color warning states: Normal (<80%), Approaching Limit (80-100%), and Exceeded (>100%).
* **Savings Milestones**:
  * Track financial goals (e.g., New Laptop, Emergency Fund, Vacation).
  * Target amount, saved balance, and target date.
  * Interactive "Add Money" / "Deposit" modal with quick preset increments.
  * Celebratory canvas-confetti fireworks upon achieving 100% of a target.
* **Reports & Deep Analytics**:
  * Time range filters: This Week, This Month, Last Month, Last 6 Months, This Year.
  * Net cash flow, savings rate ratio, and financial health score recommendations.
  * Interactive charts and category distribution breakdowns.
* **Settings & Preferences**:
  * Profile customization (Name, Email, Avatar picker).
  * Multi-Currency Support: INR (₹), USD ($), EUR (€), and GBP (£).
  * Bilingual Support: Seamless switching between English and Hindi (हिन्दी).
  * Dark Mode / Light Mode with automatic persistence.
  * Data management: JSON backup export, Reset to original demo data, and Clear all transactions with confirmation modals.

## 🛠️ Tech Stack

* **React 19**
* **Vite**
* **React Router v7**
* **Tailwind CSS v3**
* **Recharts**
* **Lucide React** (Modern icons)
* **Canvas-Confetti**
* **HTML5 LocalStorage**

## 💻 Getting Started

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```
