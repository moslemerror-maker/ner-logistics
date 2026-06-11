import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Truck,
  CreditCard,
  Fuel,
  ShieldAlert,
  BarChart3,
  LogOut,
  TruckIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/bills', label: 'Bills', icon: FileText },
  { to: '/dispatch', label: 'Dispatch', icon: Truck },
  { to: '/neft-payments', label: 'NEFT Payments', icon: CreditCard },
  { to: '/pump-payments', label: 'Pump Payments', icon: Fuel },
  { to: '/damage', label: 'Damage & Insurance', icon: ShieldAlert },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-slate-900 text-white shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-700">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600">
          <TruckIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">NER Logistics</p>
          <p className="text-xs text-slate-400 leading-tight">North East Roadways</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-slate-700">
        <div className="mb-3 px-1">
          <p className="text-sm font-medium truncate">{user?.name}</p>
          <p className="text-xs text-slate-400 truncate">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
