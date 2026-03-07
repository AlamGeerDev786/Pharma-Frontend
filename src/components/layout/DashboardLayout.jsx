import { useState, useMemo } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { hasAccess } from '../../lib/permissions'
import {
  LayoutDashboard,
  Pill,
  Package,
  ShoppingCart,
  Receipt,
  ClipboardList,
  Truck,
  BarChart3,
  Settings,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ChevronDown,
  User,
  Menu,
  Building2,
  ArrowLeftRight,
  ChevronsUpDown,
  Check,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', end: true },
  { label: 'Medicines', icon: Pill, path: '/dashboard/medicines' },
  { label: 'Inventory', icon: Package, path: '/dashboard/inventory' },
  { label: 'POS / Sales', icon: ShoppingCart, path: '/dashboard/pos' },
  { label: 'Sales History', icon: Receipt, path: '/dashboard/sales' },
  { label: 'Purchases', icon: ClipboardList, path: '/dashboard/purchases' },
  { label: 'Suppliers', icon: Truck, path: '/dashboard/suppliers' },
  { label: 'Branches', icon: Building2, path: '/dashboard/branches' },
  { label: 'Stock Transfers', icon: ArrowLeftRight, path: '/dashboard/transfers' },
  { label: 'Reports', icon: BarChart3, path: '/dashboard/reports' },
  { label: 'Settings', icon: Settings, path: '/dashboard/settings' },
]

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/dashboard/medicines': 'Medicines',
  '/dashboard/medicines/add': 'Add Medicine',
  '/dashboard/inventory': 'Inventory',
  '/dashboard/pos': 'POS / Sales',
  '/dashboard/sales': 'Sales History',
  '/dashboard/purchases': 'Purchases',
  '/dashboard/suppliers': 'Suppliers',
  '/dashboard/branches': 'Branch Management',
  '/dashboard/transfers': 'Stock Transfers',
  '/dashboard/reports': 'Reports',
  '/dashboard/settings': 'Settings',
}

const roleLabels = {
  ORG_ADMIN: 'Organization Admin',
  ADMIN: 'Branch Admin',
  PHARMACIST: 'Pharmacist',
  CASHIER: 'Cashier',
}

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [branchSelectorOpen, setBranchSelectorOpen] = useState(false)
  const location = useLocation()
  const { user, organization, branches, currentBranchId, switchBranch, logout } = useAuthStore()

  const isOrgAdmin = user?.role === 'ORG_ADMIN'
  const currentBranch = branches.find((b) => b.id === currentBranchId)

  const userInitials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'
  const userRole = roleLabels[user?.role] || user?.role

  const filteredNavItems = useMemo(() => {
    if (!user?.role) return navItems
    return navItems.filter((item) => hasAccess(user.role, item.path))
  }, [user?.role])

  const currentPageTitle = () => {
    if (pageTitles[location.pathname]) {
      return pageTitles[location.pathname]
    }
    const segments = location.pathname.split('/')
    while (segments.length > 2) {
      segments.pop()
      const partial = segments.join('/')
      if (pageTitles[partial]) {
        return pageTitles[partial]
      }
    }
    return 'Dashboard'
  }

  const handleBranchSwitch = (branchId) => {
    switchBranch(branchId)
    setBranchSelectorOpen(false)
    // Reload current page data by triggering a re-render
    window.location.reload()
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-white
          transition-all duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${sidebarCollapsed ? 'w-16' : 'w-64'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Sidebar Header - Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Pill className="h-5 w-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <span className="text-lg font-bold tracking-tight whitespace-nowrap">
                PharmaCare
              </span>
              {organization && (
                <p className="truncate text-xs text-gray-400">{organization.name}</p>
              )}
            </div>
          )}
        </div>

        {/* Branch Selector (ORG_ADMIN only) */}
        {isOrgAdmin && branches.length > 1 && !sidebarCollapsed && (
          <div className="border-b border-white/10 px-3 py-3">
            <div className="relative">
              <button
                onClick={() => setBranchSelectorOpen(!branchSelectorOpen)}
                className="flex w-full items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm transition-colors hover:bg-white/15"
              >
                <Building2 className="h-4 w-4 shrink-0 text-accent-light" />
                <span className="min-w-0 flex-1 truncate text-left text-white">
                  {currentBranch?.name?.replace(organization?.name + ' - ', '') || 'Select Branch'}
                </span>
                <ChevronsUpDown className="h-4 w-4 shrink-0 text-gray-400" />
              </button>

              {branchSelectorOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setBranchSelectorOpen(false)}
                  />
                  <div className="absolute left-0 right-0 z-40 mt-1 max-h-48 overflow-y-auto rounded-lg border border-white/20 bg-sidebar shadow-xl">
                    {branches.map((branch) => (
                      <button
                        key={branch.id}
                        onClick={() => handleBranchSwitch(branch.id)}
                        className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-white/10 ${
                          branch.id === currentBranchId ? 'bg-white/10 text-accent-light' : 'text-gray-300'
                        }`}
                      >
                        <span className="min-w-0 flex-1 truncate text-left">
                          {branch.name?.replace(organization?.name + ' - ', '') || branch.name}
                        </span>
                        {branch.id === currentBranchId && (
                          <Check className="h-4 w-4 shrink-0 text-accent-light" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Branch icon button when collapsed (ORG_ADMIN) */}
        {isOrgAdmin && branches.length > 1 && sidebarCollapsed && (
          <div className="border-b border-white/10 px-3 py-3">
            <div className="group relative flex justify-center">
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="rounded-lg bg-white/10 p-2 text-accent-light transition-colors hover:bg-white/15"
                title="Switch Branch"
              >
                <Building2 className="h-4 w-4" />
              </button>
              <span className="pointer-events-none absolute left-full ml-3 rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 whitespace-nowrap">
                Switch Branch
              </span>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.end}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                      ${
                        isActive
                          ? 'bg-sidebar-active text-white shadow-lg shadow-sidebar-active/25'
                          : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'
                      }
                      ${sidebarCollapsed ? 'justify-center' : ''}`
                    }
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                    {sidebarCollapsed && (
                      <span className="pointer-events-none absolute left-full ml-3 rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                        {item.label}
                      </span>
                    )}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Sidebar Footer - User Info */}
        <div className="border-t border-white/10 p-3">
          <div
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-sidebar-hover ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
          >
            {/* Avatar */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
              {userInitials}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{user?.name || 'User'}</p>
                <span className="inline-block rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent-light">
                  {userRole}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Collapse/Expand Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden h-10 items-center justify-center border-t border-white/10 text-gray-400 transition-colors hover:bg-sidebar-hover hover:text-white lg:flex"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Navbar */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-4 shadow-sm lg:px-6">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Page Title */}
          <h1 className="text-lg font-semibold text-gray-900 lg:text-xl">
            {currentPageTitle()}
          </h1>

          {/* Current Branch indicator in header (ORG_ADMIN) */}
          {isOrgAdmin && currentBranch && (
            <span className="hidden items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent-700 sm:flex">
              <Building2 className="h-3.5 w-3.5" />
              {currentBranch.name?.replace(organization?.name + ' - ', '') || currentBranch.name}
            </span>
          )}

          {/* Search Bar */}
          <div className="mx-4 hidden max-w-md flex-1 md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search medicines, suppliers, invoices..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-4 pl-10 text-sm text-gray-700 placeholder-gray-400 transition-colors focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>
          </div>

          {/* Right Section - Spacer to push items right */}
          <div className="flex-1 md:hidden" />

          <div className="flex items-center gap-2">
            {/* Search button for mobile */}
            <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden">
              <Search className="h-5 w-5" />
            </button>

            {/* Notification Bell */}
            <button className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                3
              </span>
            </button>

            {/* Divider */}
            <div className="mx-1 h-8 w-px bg-gray-200" />

            {/* User Avatar Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-gray-100"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                  {userInitials}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium text-gray-700">{user?.name || 'User'}</p>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-gray-400 sm:block" />
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500">{user?.email || ''}</p>
                    </div>
                    <div className="p-1.5">
                      {(user?.role === 'ADMIN' || user?.role === 'ORG_ADMIN') && (
                        <NavLink
                          to="/dashboard/settings"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                        >
                          <User className="h-4 w-4 text-gray-400" />
                          Profile Settings
                        </NavLink>
                      )}
                      <button
                        onClick={() => { setUserDropdownOpen(false); logout(); }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-danger transition-colors hover:bg-danger-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 scrollbar-thin lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
