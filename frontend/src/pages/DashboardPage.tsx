import { FileText, Truck, CreditCard, Fuel, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const stats = [
  { label: 'Total Bills', value: '—', icon: FileText, color: 'bg-blue-50 text-blue-600' },
  { label: 'Dispatches', value: '—', icon: Truck, color: 'bg-green-50 text-green-600' },
  { label: 'NEFT Payments', value: '—', icon: CreditCard, color: 'bg-purple-50 text-purple-600' },
  { label: 'Pump Payments', value: '—', icon: Fuel, color: 'bg-orange-50 text-orange-600' },
  { label: 'Damage Records', value: '—', icon: ShieldAlert, color: 'bg-red-50 text-red-600' },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${color} mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
