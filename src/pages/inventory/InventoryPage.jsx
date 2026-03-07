import { useState, useEffect, useMemo } from 'react'
import {
  Package,
  AlertTriangle,
  XCircle,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
} from 'lucide-react'
import Card, { CardHeader, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { cn, formatDate } from '@/lib/utils'
import { canEdit } from '@/lib/permissions'
import useAuthStore from '../../store/authStore'
import useMedicineStore from '../../store/medicineStore'
import useDashboardStore from '../../store/dashboardStore'

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'low-stock', label: 'Low Stock' },
  { key: 'expiring', label: 'Expiring Soon' },
  { key: 'out-of-stock', label: 'Out of Stock' },
]

const STATUS_CONFIG = {
  'in-stock': { label: 'In Stock', variant: 'success' },
  'low-stock': { label: 'Low Stock', variant: 'warning' },
  'out-of-stock': { label: 'Out of Stock', variant: 'danger' },
  expiring: { label: 'Expiring', variant: 'danger' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeStatus(medicine) {
  if (medicine.totalStock === 0) return 'out-of-stock'
  if (medicine.totalStock <= medicine.reorderLevel) return 'low-stock'

  // Check if any batch expires within 30 days
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const hasExpiringBatch = (medicine.batches || []).some((batch) => {
    const expiryDate = new Date(batch.expiryDate)
    return expiryDate <= thirtyDaysFromNow && expiryDate >= now
  })

  if (hasExpiringBatch) return 'expiring'
  return 'in-stock'
}

function getEarliestBatch(batches) {
  if (!batches || batches.length === 0) return { batchNo: '-', expiryDate: null }
  const sorted = [...batches].sort(
    (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)
  )
  return sorted[0]
}

function getFilterParams(activeFilter, searchQuery) {
  const params = { limit: 20 }
  if (activeFilter === 'low-stock') params.stockStatus = 'low'
  else if (activeFilter === 'out-of-stock') params.stockStatus = 'out'
  else if (activeFilter === 'expiring') params.stockStatus = 'expiring'
  if (searchQuery.trim()) params.search = searchQuery.trim()
  return params
}

// ─── Inventory Page ──────────────────────────────────────────────────────────

export default function InventoryPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const { user } = useAuthStore()
  const isReadOnly = !canEdit(user?.role, '/dashboard/inventory')

  const { medicines, pagination, loading, fetchMedicines } = useMedicineStore()
  const { alerts, stats, fetchAlerts, fetchStats } = useDashboardStore()

  // Initial data fetch
  useEffect(() => {
    fetchMedicines({ limit: 20 })
    fetchAlerts()
    fetchStats()
  }, [])

  // Re-fetch when filter or search changes
  useEffect(() => {
    const params = getFilterParams(activeFilter, searchQuery)
    params.page = 1
    setCurrentPage(1)
    fetchMedicines(params)
  }, [activeFilter, searchQuery])

  // Transform medicines for table display
  const tableData = useMemo(() => {
    return medicines.map((med) => {
      const status = computeStatus(med)
      const earliestBatch = getEarliestBatch(med.batches)
      return {
        id: med.id,
        name: med.name,
        category: med.category?.name || '-',
        batch: earliestBatch.batchNo || '-',
        stock: med.totalStock ?? 0,
        reorderLevel: med.reorderLevel ?? 0,
        expiry: earliestBatch.expiryDate || null,
        status,
      }
    })
  }, [medicines])

  // Derive stats
  const totalProducts = stats?.totalMedicines || 0
  const lowStockCount = stats?.lowStock || 0
  const outOfStockCount = stats?.outOfStock || 0
  const inStockCount = totalProducts - lowStockCount - outOfStockCount

  // Derive alerts
  const lowStockAlerts = useMemo(() => {
    return (alerts || []).filter(
      (a) => a.type === 'low-stock' || a.type === 'out-of-stock'
    )
  }, [alerts])

  const expiryAlerts = useMemo(() => {
    return (alerts || []).filter(
      (a) => a.type === 'expired' || a.type === 'expiring'
    )
  }, [alerts])

  // Pagination
  const totalItems = pagination?.total || 0
  const totalPages = pagination?.totalPages || 1
  const pageSize = pagination?.limit || 20

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    const params = getFilterParams(activeFilter, searchQuery)
    params.page = page
    fetchMedicines(params)
  }

  const getPageNumbers = () => {
    const pages = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('...')
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (currentPage < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  const showFrom = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const showTo = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Inventory Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor stock levels, track expiry dates, and manage reorders.
          </p>
        </div>
        {!isReadOnly && (
          <Button variant="secondary" size="md">
            <Download className="w-4 h-4" />
            Export
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-gray-400 mr-1" />
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
              activeFilter === tab.key
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-xl font-bold text-gray-900">
                {totalProducts.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-gray-500">In Stock</p>
              <p className="text-xl font-bold text-gray-900">
                {inStockCount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-warning-100 px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Low Stock</p>
              <p className="text-xl font-bold text-warning-600">
                {lowStockCount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-danger-50 px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-danger-50 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-danger" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Out of Stock</p>
              <p className="text-xl font-bold text-danger">
                {outOfStockCount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Stock Overview
            </h2>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search medicines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="ml-3 text-sm text-gray-500">
                Loading inventory...
              </span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left font-medium text-gray-500 px-6 py-3">
                      Medicine Name
                    </th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">
                      Category
                    </th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">
                      Batch #
                    </th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">
                      Stock Qty
                    </th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">
                      Reorder Level
                    </th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">
                      Expiry Date
                    </th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tableData.length > 0 ? (
                    tableData.map((item) => {
                      const statusCfg = STATUS_CONFIG[item.status]
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-6 py-3.5 font-medium text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-6 py-3.5 text-gray-600">
                            {item.category}
                          </td>
                          <td className="px-6 py-3.5 text-gray-500 font-mono text-xs">
                            {item.batch}
                          </td>
                          <td className="px-6 py-3.5">
                            <span
                              className={cn(
                                'font-semibold',
                                item.stock === 0
                                  ? 'text-danger'
                                  : item.stock <= item.reorderLevel
                                    ? 'text-warning-600'
                                    : 'text-gray-900'
                              )}
                            >
                              {item.stock.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-gray-500">
                            {item.reorderLevel}
                          </td>
                          <td className="px-6 py-3.5 text-gray-500">
                            {item.expiry ? formatDate(item.expiry) : '-'}
                          </td>
                          <td className="px-6 py-3.5">
                            <Badge variant={statusCfg.variant}>
                              {statusCfg.label}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-gray-400"
                      >
                        No medicines found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing{' '}
                <span className="font-medium text-gray-900">
                  {totalItems === 0 ? '0' : `${showFrom}-${showTo}`}
                </span>{' '}
                of{' '}
                <span className="font-medium text-gray-900">
                  {totalItems.toLocaleString()}
                </span>{' '}
                items
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className={cn(
                    'inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-white border border-gray-200 rounded-lg',
                    currentPage <= 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </button>
                {getPageNumbers().map((page, idx) =>
                  page === '...' ? (
                    <span key={`ellipsis-${idx}`} className="text-gray-400 px-1">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={cn(
                        'inline-flex items-center justify-center w-8 h-8 text-sm font-medium rounded-lg',
                        page === currentPage
                          ? 'text-white bg-primary'
                          : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50'
                      )}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className={cn(
                    'inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-white border border-gray-200 rounded-lg',
                    currentPage >= totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Alerts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <h2 className="text-lg font-semibold text-gray-900">
                Low Stock Alerts
              </h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockAlerts.length > 0 ? (
                lowStockAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-3 bg-warning-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {alert.medicineName || alert.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Current:{' '}
                        <span className="font-semibold text-warning-600">
                          {alert.currentStock}
                        </span>{' '}
                        / Reorder Level: {alert.reorderLevel}
                      </p>
                    </div>
                    {!isReadOnly && (
                      <Button variant="outline" size="sm">
                        Reorder
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">
                  No low stock alerts at this time.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expiry Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-danger" />
              <h2 className="text-lg font-semibold text-gray-900">
                Expiry Alerts
              </h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiryAlerts.length > 0 ? (
                expiryAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-3 bg-danger-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {alert.medicineName || alert.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Batch: {alert.batchNo || alert.batch || '-'} | Expires:{' '}
                        <span className="font-semibold text-danger">
                          {formatDate(alert.expiryDate)}
                        </span>{' '}
                        {alert.daysLeft != null && `(${alert.daysLeft} days left)`}
                      </p>
                    </div>
                    {!isReadOnly && (
                      <Button variant="danger" size="sm">
                        Remove
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">
                  No expiry alerts at this time.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
