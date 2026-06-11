import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import UsersPage from '@/pages/UsersPage';
import ClientsPage from '@/pages/ClientsPage';
import OfficersPage from '@/pages/OfficersPage';
import BillsPage from '@/pages/BillsPage';
import DispatchPage from '@/pages/DispatchPage';
import NeftPaymentsPage from '@/pages/NeftPaymentsPage';
import PumpPaymentsPage from '@/pages/PumpPaymentsPage';
import DamagePage from '@/pages/DamagePage';
import ReportsPage from '@/pages/ReportsPage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/officers" element={<OfficersPage />} />
            <Route path="/bills" element={<BillsPage />} />
            <Route path="/dispatch" element={<DispatchPage />} />
            <Route path="/neft-payments" element={<NeftPaymentsPage />} />
            <Route path="/pump-payments" element={<PumpPaymentsPage />} />
            <Route path="/damage" element={<DamagePage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/users" element={<UsersPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}
