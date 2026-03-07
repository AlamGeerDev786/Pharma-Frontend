import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from '@/pages/landing/LandingPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import AuthGuard from '@/components/shared/AuthGuard'
import RoleGuard from '@/components/shared/RoleGuard'
import DashboardLayout from '@/components/layout/DashboardLayout'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import MedicinesPage from '@/pages/medicines/MedicinesPage'
import AddMedicinePage from '@/pages/medicines/AddMedicinePage'
import InventoryPage from '@/pages/inventory/InventoryPage'
import SalesPage from '@/pages/sales/SalesPage'
import POSPage from '@/pages/sales/POSPage'
import PurchasesPage from '@/pages/purchases/PurchasesPage'
import SuppliersPage from '@/pages/suppliers/SuppliersPage'
import BranchesPage from '@/pages/branches/BranchesPage'
import TransfersPage from '@/pages/transfers/TransfersPage'
import ReportsPage from '@/pages/reports/ReportsPage'
import SettingsPage from '@/pages/settings/SettingsPage'

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Dashboard Routes (Protected) */}
        <Route path="/dashboard" element={<AuthGuard><DashboardLayout /></AuthGuard>}>
          {/* All roles */}
          <Route index element={<DashboardPage />} />

          {/* Medicines: ORG_ADMIN + ADMIN + PHARMACIST (full), CASHIER (view-only list) */}
          <Route path="medicines" element={<RoleGuard allowedRoles={['ORG_ADMIN', 'ADMIN', 'PHARMACIST', 'CASHIER']}><MedicinesPage /></RoleGuard>} />
          <Route path="medicines/add" element={<RoleGuard allowedRoles={['ORG_ADMIN', 'ADMIN', 'PHARMACIST']}><AddMedicinePage /></RoleGuard>} />
          <Route path="medicines/edit/:id" element={<RoleGuard allowedRoles={['ORG_ADMIN', 'ADMIN', 'PHARMACIST']}><AddMedicinePage /></RoleGuard>} />

          {/* Inventory: ORG_ADMIN + ADMIN + PHARMACIST (full), CASHIER (view-only) */}
          <Route path="inventory" element={<RoleGuard allowedRoles={['ORG_ADMIN', 'ADMIN', 'PHARMACIST', 'CASHIER']}><InventoryPage /></RoleGuard>} />

          {/* Purchases & Suppliers: ORG_ADMIN + ADMIN + PHARMACIST only */}
          <Route path="purchases" element={<RoleGuard allowedRoles={['ORG_ADMIN', 'ADMIN', 'PHARMACIST']}><PurchasesPage /></RoleGuard>} />
          <Route path="suppliers" element={<RoleGuard allowedRoles={['ORG_ADMIN', 'ADMIN', 'PHARMACIST']}><SuppliersPage /></RoleGuard>} />

          {/* POS: ORG_ADMIN + ADMIN + CASHIER only */}
          <Route path="pos" element={<RoleGuard allowedRoles={['ORG_ADMIN', 'ADMIN', 'CASHIER']}><POSPage /></RoleGuard>} />

          {/* Sales History: ORG_ADMIN + ADMIN + CASHIER (full), PHARMACIST (view-only) */}
          <Route path="sales" element={<RoleGuard allowedRoles={['ORG_ADMIN', 'ADMIN', 'CASHIER', 'PHARMACIST']}><SalesPage /></RoleGuard>} />

          {/* Branch Management: ORG_ADMIN only */}
          <Route path="branches" element={<RoleGuard allowedRoles={['ORG_ADMIN']}><BranchesPage /></RoleGuard>} />

          {/* Stock Transfers: ORG_ADMIN + ADMIN */}
          <Route path="transfers" element={<RoleGuard allowedRoles={['ORG_ADMIN', 'ADMIN']}><TransfersPage /></RoleGuard>} />

          {/* Reports: ORG_ADMIN + ADMIN (full), PHARMACIST (view-only) */}
          <Route path="reports" element={<RoleGuard allowedRoles={['ORG_ADMIN', 'ADMIN', 'PHARMACIST']}><ReportsPage /></RoleGuard>} />

          {/* Settings: ORG_ADMIN + ADMIN only */}
          <Route path="settings" element={<RoleGuard allowedRoles={['ORG_ADMIN', 'ADMIN']}><SettingsPage /></RoleGuard>} />
        </Route>
      </Routes>
    </Router>
  )
}
