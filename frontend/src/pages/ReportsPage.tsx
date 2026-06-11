import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Truck, CreditCard, Fuel, ShieldAlert, Users, Building2, TrendingUp, Download } from 'lucide-react';
import api from '@/lib/axios';
import { fmtNum } from '@/lib/fmt';
import Button from '@/components/ui/Button';
import { InputField, SelectField } from '@/components/ui/Fields';

interface Summary {
  billCount: number; totalBilled: string | null;
  neftTotal: string | null; pumpTotal: string | null; damageCost: string | null;
  clientCount: number; officerCount: number; dispatchCount: number; pendingClaims: number;
  billsByStatus: { status: string; _count: { id: number } }[];
}

const statusColor: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  SENT: 'bg-blue-100 text-blue-700',
  PAID: 'bg-green-100 text-green-700',
};

const REPORT_TYPES = [
  { value: 'accumulated', label: 'Accumulated (All Sheets)' },
  { value: 'bills', label: 'Bills' },
  { value: 'dispatch', label: 'Dispatch' },
  { value: 'neft', label: 'NEFT Payments' },
  { value: 'pump', label: 'Pump Payments' },
  { value: 'damage', label: 'Damage & Insurance' },
];

const FINANCIAL_YEARS = (() => {
  const years = [];
  const curr = new Date().getFullYear();
  for (let y = curr; y >= curr - 5; y--) years.push(`${y}-${y + 1}`);
  return years;
})();

export default function ReportsPage() {
  const { data: s, isLoading } = useQuery<Summary>({
    queryKey: ['reports-summary'],
    queryFn: () => api.get('/api/reports/summary').then(r => r.data),
  });

  const [dlType, setDlType] = useState('accumulated');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [billStatus, setBillStatus] = useState('');
  const [claimStatus, setClaimStatus] = useState('');
  const [financialYear, setFinancialYear] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [dlError, setDlError] = useState('');

  async function handleDownload() {
    setDlError('');
    setDownloading(true);
    try {
      const params: Record<string, string> = { type: dlType };
      if (from) params.from = from;
      if (to) params.to = to;
      if (billStatus && (dlType === 'bills' || dlType === 'accumulated')) params.status = billStatus;
      if (claimStatus && (dlType === 'damage' || dlType === 'accumulated')) params.claimStatus = claimStatus;
      if (financialYear && (dlType === 'bills' || dlType === 'accumulated')) params.financialYear = financialYear;

      const res = await api.get('/api/reports/download', { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      const cd = res.headers['content-disposition'] || '';
      const nameMatch = cd.match(/filename="?([^"]+)"?/);
      a.href = url;
      a.download = nameMatch ? nameMatch[1] : `NER_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setDlError('Failed to generate report. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  const cards = [
    { label: 'Total Bills', value: s?.billCount ?? '—', icon: FileText, color: 'text-blue-600 bg-blue-50' },
    { label: 'Total Billed (₹)', value: fmtNum(s?.totalBilled), icon: TrendingUp, color: 'text-green-600 bg-green-50' },
    { label: 'NEFT Payments (₹)', value: fmtNum(s?.neftTotal), icon: CreditCard, color: 'text-purple-600 bg-purple-50' },
    { label: 'Pump Payments (₹)', value: fmtNum(s?.pumpTotal), icon: Fuel, color: 'text-orange-600 bg-orange-50' },
    { label: 'Damage Cost (₹)', value: fmtNum(s?.damageCost), icon: ShieldAlert, color: 'text-red-600 bg-red-50' },
    { label: 'Dispatches', value: s?.dispatchCount ?? '—', icon: Truck, color: 'text-sky-600 bg-sky-50' },
    { label: 'Clients', value: s?.clientCount ?? '—', icon: Building2, color: 'text-teal-600 bg-teal-50' },
    { label: 'Officers', value: s?.officerCount ?? '—', icon: Users, color: 'text-violet-600 bg-violet-50' },
    { label: 'Pending Claims', value: s?.pendingClaims ?? '—', icon: ShieldAlert, color: 'text-yellow-600 bg-yellow-50' },
  ];

  const showBillFilters = dlType === 'bills' || dlType === 'accumulated';
  const showDamageFilters = dlType === 'damage' || dlType === 'accumulated';

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-500 text-sm mt-0.5">Business summary and Excel downloads</p>
      </div>

      {/* ── Summary cards ── */}
      {isLoading ? (
        <div className="text-slate-400 text-sm animate-pulse">Loading summary…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {cards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {s?.billsByStatus && s.billsByStatus.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">Bills by Status</h2>
              <div className="flex flex-wrap gap-3">
                {s.billsByStatus.map(b => (
                  <div key={b.status} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${statusColor[b.status] ?? 'bg-slate-100 text-slate-600'}`}>
                    <span>{b.status}</span>
                    <span className="bg-white/60 rounded-full px-1.5 py-0.5 text-xs">{b._count.id}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Excel Download ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-green-50">
            <Download className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Download Excel Report</h2>
            <p className="text-xs text-slate-500">Generate and download reports with optional filters</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SelectField
            label="Report Type"
            value={dlType}
            onChange={e => setDlType(e.target.value)}
          >
            {REPORT_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </SelectField>

          <InputField label="From Date" type="date" value={from} onChange={e => setFrom(e.target.value)} />
          <InputField label="To Date" type="date" value={to} onChange={e => setTo(e.target.value)} />

          {showBillFilters && (
            <>
              <SelectField label="Bill Status" value={billStatus} onChange={e => setBillStatus(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent</option>
                <option value="PAID">Paid</option>
              </SelectField>
              <SelectField label="Financial Year" value={financialYear} onChange={e => setFinancialYear(e.target.value)}>
                <option value="">All Years</option>
                {FINANCIAL_YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </SelectField>
            </>
          )}

          {showDamageFilters && (
            <SelectField label="Claim Status" value={claimStatus} onChange={e => setClaimStatus(e.target.value)}>
              <option value="">All Claim Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="FILED">Filed</option>
              <option value="SETTLED">Settled</option>
              <option value="REJECTED">Rejected</option>
            </SelectField>
          )}
        </div>

        {dlError && (
          <p className="mt-3 text-sm text-red-600">{dlError}</p>
        )}

        <div className="mt-5 flex items-center gap-3">
          <Button onClick={handleDownload} disabled={downloading}>
            <Download className="w-4 h-4" />
            {downloading ? 'Generating…' : 'Download Excel'}
          </Button>
          <p className="text-xs text-slate-400">
            {dlType === 'accumulated'
              ? 'Downloads a multi-sheet workbook: Summary + Bills + Bill Items + Dispatch + NEFT + Pump + Damage'
              : `Downloads ${REPORT_TYPES.find(t => t.value === dlType)?.label} as a single-sheet Excel file`}
          </p>
        </div>
      </div>
    </div>
  );
}
