const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
});

const MONTH_YEAR_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
});

export function formatCurrency(value: number): string {
  return CURRENCY_FORMATTER.format(value);
}

export function formatMonthYear(isoDate: string): string {
  return MONTH_YEAR_FORMATTER.format(new Date(isoDate));
}

export function getInitials(nameOrEmail: string): string {
  const source = nameOrEmail.includes('@')
    ? nameOrEmail.split('@')[0]
    : nameOrEmail;
  const parts = source.trim().split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
