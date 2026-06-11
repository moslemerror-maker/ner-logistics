import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import PlaceholderPage from '@/pages/PlaceholderPage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/bills" element={<PlaceholderPage title="Bills" />} />
            <Route path="/dispatch" element={<PlaceholderPage title="Dispatch" />} />
            <Route path="/neft-payments" element={<PlaceholderPage title="NEFT Payments" />} />
            <Route path="/pump-payments" element={<PlaceholderPage title="Pump Payments" />} />
            <Route path="/damage" element={<PlaceholderPage title="Damage & Insurance" />} />
            <Route path="/reports" element={<PlaceholderPage title="Reports" />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}
