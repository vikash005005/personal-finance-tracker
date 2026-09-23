export const CATEGORIES = [
  { id: 'Salary', nameKey: 'catSalary', type: 'income', color: '#16a34a', icon: 'Briefcase' },
  { id: 'Freelancing', nameKey: 'catFreelancing', type: 'income', color: '#0d9488', icon: 'Laptop' },
  { id: 'Investments', nameKey: 'catInvestments', type: 'income', color: '#2563eb', icon: 'TrendingUp' },
  { id: 'Food', nameKey: 'catFood', type: 'expense', color: '#ea580c', icon: 'Utensils' },
  { id: 'Groceries', nameKey: 'catGroceries', type: 'expense', color: '#ca8a04', icon: 'ShoppingBag' },
  { id: 'Rent', nameKey: 'catRent', type: 'expense', color: '#475569', icon: 'Home' },
  { id: 'Bills', nameKey: 'catBills', type: 'expense', color: '#dc2626', icon: 'FileText' },
  { id: 'Travel', nameKey: 'catTravel', type: 'expense', color: '#7c3aed', icon: 'Navigation' },
  { id: 'Entertainment', nameKey: 'catEntertainment', type: 'expense', color: '#db2777', icon: 'Film' },
  { id: 'Health', nameKey: 'catHealth', type: 'expense', color: '#059669', icon: 'Activity' },
  { id: 'Other', nameKey: 'catOther', type: 'expense', color: '#64748b', icon: 'MoreHorizontal' },
];

export const PAYMENT_METHODS = ['UPI', 'Cash', 'Debit Card', 'Credit Card', 'Bank Transfer', 'Other'];

const today = new Date();
const formatDate = (daysAgo) => {
  const d = new Date(today);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const formatMonthDate = (monthsAgo, day) => {
  const d = new Date(today.getFullYear(), today.getMonth() - monthsAgo, day);
  return d.toISOString().split('T')[0];
};

export const INITIAL_TRANSACTIONS = [
  { id: 'tx-1', title: 'TCS Ltd / Monthly Salary (NEFT Credit)', amount: 85000, type: 'income', category: 'Salary', date: formatDate(1), description: 'Corporate payroll deposit for software engineering role', paymentMethod: 'Bank Transfer' },
  { id: 'tx-2', title: 'House Rent / Bank Transfer to Landlord', amount: 22000, type: 'expense', category: 'Rent', date: formatDate(2), description: 'Monthly 2BHK flat rent transfer', paymentMethod: 'Bank Transfer' },
  { id: 'tx-3', title: 'Freelance UI Retainer / Fintech Mobile App', amount: 25000, type: 'income', category: 'Freelancing', date: formatDate(3), description: 'Milestone 2 payout from Singapore client', paymentMethod: 'Bank Transfer' },
  { id: 'tx-4', title: 'Zerodha / Nifty 50 Index Mutual Fund SIP', amount: 15000, type: 'expense', category: 'Investments', date: formatDate(4), description: 'Automated monthly mutual fund investment via UPI Autopay', paymentMethod: 'UPI' },
  { id: 'tx-5', title: 'BESCOM / Electricity Bill (Auto-debit)', amount: 2850, type: 'expense', category: 'Bills', date: formatDate(5), description: 'Monthly domestic power bill via BBPS', paymentMethod: 'UPI' },
  { id: 'tx-6', title: 'Blinkit / Weekly Grocery Supplies', amount: 3420, type: 'expense', category: 'Groceries', date: formatDate(7), description: 'Vegetables, dairy, staples and kitchen essentials', paymentMethod: 'Debit Card' },
  { id: 'tx-7', title: 'Swiggy UPI / Weekend Dinner Order', amount: 1240, type: 'expense', category: 'Food', date: formatDate(9), description: 'Biryani and starters order from Meghana Foods', paymentMethod: 'UPI' },
  { id: 'tx-8', title: 'ACT Fibernet / High-Speed Broadband Bill', amount: 1199, type: 'expense', category: 'Bills', date: formatDate(12), description: '300 Mbps unlimited fiber internet recharge', paymentMethod: 'Credit Card' },
  { id: 'tx-9', title: 'Uber India / Office Commute & Metro', amount: 850, type: 'expense', category: 'Travel', date: formatDate(14), description: 'Cab rides and Namma Metro smartcard recharge', paymentMethod: 'UPI' },
  { id: 'tx-10', title: 'Apollo Pharmacy / Health & Family Medicines', amount: 950, type: 'expense', category: 'Health', date: formatDate(16), description: 'Routine vitamins and first-aid supplies', paymentMethod: 'Cash' },
  { id: 'tx-11', title: 'TCS Ltd / Monthly Salary (NEFT Credit)', amount: 85000, type: 'income', category: 'Salary', date: formatMonthDate(1, 1), description: 'Corporate payroll deposit', paymentMethod: 'Bank Transfer' },
  { id: 'tx-12', title: 'House Rent / Transfer to Landlord', amount: 22000, type: 'expense', category: 'Rent', date: formatMonthDate(1, 2), description: 'Monthly apartment rent', paymentMethod: 'Bank Transfer' },
  { id: 'tx-13', title: 'Freelance Design Retainer', amount: 20000, type: 'income', category: 'Freelancing', date: formatMonthDate(1, 6), description: 'Design system audit milestone', paymentMethod: 'Bank Transfer' },
  { id: 'tx-14', title: 'Supermarket & Groceries (DMart)', amount: 6800, type: 'expense', category: 'Groceries', date: formatMonthDate(1, 8), description: 'Monthly bulk grocery run', paymentMethod: 'Debit Card' },
  { id: 'tx-15', title: 'Dining & Food Outings', amount: 4200, type: 'expense', category: 'Food', date: formatMonthDate(1, 14), description: 'Restaurants and cafe visits', paymentMethod: 'Credit Card' },
  { id: 'tx-16', title: 'Utility Bills (Power & Water)', amount: 3100, type: 'expense', category: 'Bills', date: formatMonthDate(1, 19), description: 'Electricity and piped gas bills', paymentMethod: 'UPI' },
  { id: 'tx-17', title: 'TCS Ltd / Monthly Salary (NEFT Credit)', amount: 85000, type: 'income', category: 'Salary', date: formatMonthDate(2, 1), description: 'Corporate payroll deposit', paymentMethod: 'Bank Transfer' },
  { id: 'tx-18', title: 'House Rent / Transfer to Landlord', amount: 22000, type: 'expense', category: 'Rent', date: formatMonthDate(2, 2), description: 'Monthly flat rent', paymentMethod: 'Bank Transfer' },
  { id: 'tx-19', title: 'Groceries & Provisions', amount: 7100, type: 'expense', category: 'Groceries', date: formatMonthDate(2, 10), description: 'Monthly provisions and daily milk', paymentMethod: 'Cash' },
  { id: 'tx-20', title: 'Travel & Commute Fuel', amount: 3400, type: 'expense', category: 'Travel', date: formatMonthDate(2, 22), description: 'Petrol refill and highway toll recharge', paymentMethod: 'UPI' },
];

export const INITIAL_BUDGETS = [
  { id: 'b-1', category: 'Rent', amount: 25000 },
  { id: 'b-2', category: 'Groceries', amount: 8000 },
  { id: 'b-3', category: 'Food', amount: 6000 },
  { id: 'b-4', category: 'Bills', amount: 5000 },
  { id: 'b-5', category: 'Travel', amount: 4000 },
  { id: 'b-6', category: 'Health', amount: 3000 },
];

export const INITIAL_SAVINGS_GOALS = [
  { id: 'g-1', name: 'Emergency Fund (6 Months)', targetAmount: 250000, savedAmount: 165000, targetDate: '2026-12-31', category: 'Emergency', color: '#16a34a' },
  { id: 'g-2', name: 'MacBook Pro M3 Max Workstation', targetAmount: 140000, savedAmount: 85000, targetDate: '2026-11-30', category: 'Equipment', color: '#0f172a' },
  { id: 'g-3', name: 'Annual Family Vacation (Goa)', targetAmount: 50000, savedAmount: 32000, targetDate: '2026-10-25', category: 'Travel', color: '#ca8a04' },
];

export const INITIAL_RECURRING = [
  { id: 'rec-1', title: 'TCS Ltd Monthly Salary', amount: 85000, type: 'income', category: 'Salary', paymentMethod: 'Bank Transfer', frequency: 'monthly', startDate: formatMonthDate(3, 1), endDate: null, isActive: true, description: 'Corporate payroll NEFT credit' },
  { id: 'rec-2', title: 'House Rent Payment', amount: 22000, type: 'expense', category: 'Rent', paymentMethod: 'Bank Transfer', frequency: 'monthly', startDate: formatMonthDate(3, 2), endDate: null, isActive: true, description: 'Monthly 2BHK flat rent to landlord' },
  { id: 'rec-3', title: 'Zerodha SIP Investment', amount: 15000, type: 'expense', category: 'Investments', paymentMethod: 'UPI', frequency: 'monthly', startDate: formatMonthDate(3, 4), endDate: null, isActive: true, description: 'Nifty 50 Index Fund SIP via UPI Autopay' },
];

export const DEMO_USER = {
  name: 'Arjun Sharma',
  email: 'arjun.sharma@example.com',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
};
