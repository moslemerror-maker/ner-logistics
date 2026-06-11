import { useQuery } from '@tanstack/react-query';
import { FileText, Truck, CreditCard, Fuel, ShieldAlert, Users, Building2, TrendingUp } from 'lucide-react';
import api from '@/lib/axios';
import { fmtNum } from '@/lib/fmt';

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

export default function ReportsPage() {
  const { data: s, isLoading } = useQuery<Summary>({
    queryKey: ['reports-summary'],
    queryFn: () => api.get('/api/reports/summary').then(r => r.data),
  });

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

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-500 text-sm mt-0.5">Business summary overview</p>
      </div>

      {isLoading ? (
        <div className="text-slate-400 text-sm animate-pulse">Loading summary…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
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
    </div>
  );
}
