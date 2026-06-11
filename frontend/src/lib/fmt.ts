export const fmtNum = (v?: string | number | null) =>
  v != null && v !== '' ? parseFloat(String(v)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';

export const fmtDate = (v?: string | Date | null) =>
  v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const fmtDateInput = (v?: string | Date | null) =>
  v ? new Date(v).toISOString().slice(0, 10) : '';
