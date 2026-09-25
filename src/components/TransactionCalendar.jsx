import React, { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useFinance } from "../context/FinanceContext";

function formatMoney(n) {
  if (n >= 10000000) return (n / 10000000).toFixed(1) + "Cr";
  if (n >= 100000) return (n / 100000).toFixed(1) + "L";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toFixed(0);
}

export const TransactionCalendar = ({ onSelectDate, selectedDate }) => {
  const { transactions } = useFinance();
  const today = new Date();
  const [viewDate, setViewDate] = useState(() => {
    if (selectedDate) {
      const parts = selectedDate.split("-");
      if (parts.length === 3) {
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
      }
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  // Sync viewDate if selectedDate changes across months
  useEffect(() => {
    if (selectedDate) {
      const parts = selectedDate.split("-");
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        if (y !== viewDate.getFullYear() || m !== viewDate.getMonth()) {
          setViewDate(new Date(y, m, 1));
        }
      }
    }
  }, [selectedDate]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToday = () => {
    const todayDate = new Date(today.getFullYear(), today.getMonth(), 1);
    setViewDate(todayDate);
    const todayStr = today.toISOString().split("T")[0];
    if (onSelectDate) onSelectDate(todayStr);
  };

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

  // Compute monthly totals for the current calendar view
  const monthTotals = useMemo(() => {
    let inc = 0;
    let exp = 0;
    Object.values(dayMap).forEach((d) => {
      inc += d.income;
      exp += d.expense;
    });
    return { income: inc, expense: exp, net: inc - exp };
  }, [dayMap]);

  const monthLabel = viewDate.toLocaleString("en-US", { month: "long", year: "numeric" });
  const todayStr = today.toISOString().split("T")[0];
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const cells = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-subtle">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white min-w-[140px] text-center tracking-tight">
            {monthLabel}
          </h3>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Month Cashflow Overview & Today Action */}
        <div className="flex items-center justify-between sm:justify-end space-x-3 text-xs">
          <div className="flex items-center space-x-2.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              +{formatMoney(monthTotals.income)}
            </span>
            <span>•</span>
            <span className="text-rose-600 dark:text-rose-400 font-medium">
              -{formatMoney(monthTotals.expense)}
            </span>
          </div>

          <button
            onClick={goToday}
            className="text-[11px] font-medium px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/50">
        {weekdays.map((d) => (
          <div
            key={d}
            className="px-1 py-2 text-center text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 bg-slate-50/20 dark:bg-slate-900">
        {cells.map((day, idx) => {
          if (day === null) {
            return (
              <div
                key={`empty-${idx}`}
                className="min-h-[68px] sm:min-h-[76px] border-r border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-950/20"
              />
            );
          }
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const data = dayMap[dateStr];
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const isLast = idx % 7 === 6;

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate && onSelectDate(dateStr)}
              className={`min-h-[68px] sm:min-h-[76px] p-1.5 text-left flex flex-col justify-between border-b transition-all relative ${
                isLast ? "" : "border-r"
              } border-slate-100 dark:border-slate-800 ${
                isSelected
                  ? "bg-slate-100/90 dark:bg-slate-800 ring-2 ring-inset ring-slate-900 dark:ring-slate-100 z-10 shadow-sm"
                  : "hover:bg-slate-50/90 dark:hover:bg-slate-850/60 bg-white dark:bg-slate-900"
              }`}
            >
              {/* Top: Day Number and Activity Dot */}
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-[11px] font-semibold w-5 h-5 flex items-center justify-center rounded-full leading-none transition-colors ${
                    isToday
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold"
                      : isSelected
                      ? "bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-bold"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {day}
                </span>

                {data && data.count > 0 && (
                  <span
                    className={`text-[9px] font-mono px-1 py-0.2 rounded font-medium ${
                      isSelected
                        ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {data.count}
                  </span>
                )}
              </div>

              {/* Bottom: Inflow / Outflow amounts */}
              <div className="mt-1 space-y-0.5 w-full overflow-hidden">
                {data && data.income > 0 && (
                  <div
                    className="text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400 truncate leading-tight"
                    title={`Income: +${data.income}`}
                  >
                    +{formatMoney(data.income)}
                  </div>
                )}
                {data && data.expense > 0 && (
                  <div
                    className="text-[10px] font-mono font-medium text-rose-600 dark:text-rose-400 truncate leading-tight"
                    title={`Expense: -${data.expense}`}
                  >
                    -{formatMoney(data.expense)}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

