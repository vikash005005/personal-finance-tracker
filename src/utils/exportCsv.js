export const exportTransactionsToCsv = (transactions, filename = 'transactions.csv') => {
  if (!transactions || !transactions.length) {
    return false;
  }

  const headers = ['ID', 'Date', 'Type', 'Category', 'Title', 'Amount', 'Description'];
  const rows = transactions.map((t) => [
    t.id,
    t.date,
    t.type,
    t.category,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    t.amount,
    `"${(t.description || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((e) => e.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
};
