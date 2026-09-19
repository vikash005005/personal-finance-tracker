export const formatDateDisplay = (dateString, locale = 'en-US') => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
};

export const formatPercent = (value, decimals = 1) => {
  return `${Number(value).toFixed(decimals)}%`;
};

export const getMonthName = (monthIndex, locale = 'en-US') => {
  const date = new Date(2026, monthIndex, 1);
  return date.toLocaleString(locale, { month: 'short' });
};
