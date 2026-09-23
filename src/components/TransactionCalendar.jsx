import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useFinance } from "../context/FinanceContext";

function formatMoney(n) {
  if (n >= 100000) return (n / 100000).toFixed(1) + "L";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toFixed(0);
}

export const TransactionCalendar = ({ onSelectDate, selectedDate }) => {
  const { transactions, formatAmount } = useFinance();
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToday = () => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));

  // Build a map: "YYYY-MM-DD" -> { income, expense, count }
  const dayMap = useMemo(() => {
    const map = {};
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    transactions.forEach((tx) => {
      if (!tx.date || !tx.date.startsWith(prefix)) return;
      if (!map[tx.date]) map[tx.date] = { income: 0, expense: 0, count: 0 };
      map[tx.date].count++;
      if (tx.type === "income") map[tx.date].income += Number(tx.amount) || 0;
      else map[tx.date].expense += Number(tx.amount) || 0;
    });
    return map;
  }, [transactions, year, month]);

  const monthLabel = viewDate.toLocaleString("en-US", { month: "long", year: "numeric" });
  const todayStr = today.toISOString().split("T")[0];
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const cells = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-subtle">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <button onClick={prevMonth} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white min-w-[140px] text-center">{monthLabel}</h3>
          <button onClick={nextMonth} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={goToday}
          className="text-[11px] font-medium px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Today
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800">
        {weekdays.map((d) => (
          <div key={d} className="px-1 py-2 text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="min-h-[70px] border-r border-b border-slate-50 dark:border-slate-800/50" />;
          }
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const data = dayMap[dateStr];
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const isLast = idx % 7 === 6;

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate && onSelectDate(isSelected ? null : dateStr)}
              className={`min-h-[70px] p-1.5 text-left flex flex-col border-b transition-colors ${
                isLast ? "" : "border-r"
              } border-slate-100 dark:border-slate-800 ${
                isSelected
                  ? "bg-slate-100 dark:bg-slate-800"
                  : "hover:bg-slate-50 dark:hover:bg-slate-850"
              }`}
            >
              <span
                className={`text-[11px] font-semibold w-5 h-5 flex items-center justify-center rounded-full mb-0.5 ${
                  isToday
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                    : "text-slate-700 dark:text-slate-300"
                }`}
              >
                {day}
              </span>
              {data && (
                <div className="space-y-0.5">
                  {data.income > 0 && (
                    <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 leading-tight">
                      +{formatMoney(data.income)}
                    </div>
                  )}
                  {data.expense > 0 && (
                    <div className="text-[10px] font-mono text-rose-500 dark:text-rose-400 leading-tight">
                      -{formatMoney(data.expense)}
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
