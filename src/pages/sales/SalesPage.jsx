import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Card, { CardHeader, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import StatCard from '@/components/shared/StatCard'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import {
  Search,
  Download,
  Plus,
  Eye,
  Printer,
  X,
  Calendar,
  Receipt,
  Loader2,
} from 'lucide-react'
import { canEdit } from '@/lib/permissions'
import useAuthStore from '../../store/authStore'
import useSaleStore from '../../store/saleStore'
import useDashboardStore from '../../store/dashboardStore'

// ── Helpers ───────────────────────────────────────────────────────────
const statusVariant = (status) => {
  switch (status) {
    case 'COMPLETED': return 'success'
    case 'REFUNDED': return 'danger'
    case 'PENDING': return 'warning'
    default: return 'default'
  }
}

const paymentVariant = (method) => {
  switch (method) {
    case 'CASH': return 'default'
    case 'CARD': return 'primary'
    case 'MOBILE': return 'warning'
    default: return 'default'
  }
}

const ITEMS_PER_PAGE = 5

// ── Component ─────────────────────────────────────────────────────────
export default function SalesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [viewingInvoice, setViewingInvoice] = useState(null)

  const { user } = useAuthStore()
  const isReadOnly = !canEdit(user?.role, '/dashboard/sales')

  const { sales, pagination, loading, fetchSales } = useSaleStore()
  const { stats, fetchStats } = useDashboardStore()

  // ── Fetch on mount ────────────────────────────────────────────────
  useEffect(() => {
    fetchSales({ limit: ITEMS_PER_PAGE })
    fetchStats()
  }, [])

  // ── Fetch when filters change ─────────────────────────────────────
  const doFetch = useCallback(
    (overrides = {}) => {
      const params = {
        search: searchQuery || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        ...overrides,
      }
      fetchSales(params)
    },
    [searchQuery, dateFrom, dateTo, currentPage, fetchSales]
  )

  useEffect(() => {
    doFetch()
  }, [searchQuery, dateFrom, dateTo, currentPage])

  // ── Handlers ──────────────────────────────────────────────────────
  const handleSearch = (value) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handleDateFromChange = (value) => {
    setDateFrom(value)
    setCurrentPage(1)
  }

  const handleDateToChange = (value) => {
    setDateTo(value)
    setCurrentPage(1)
  }

  // ── Pagination info ───────────────────────────────────────────────
  const totalPages = pagination?.pages || 1
  const totalResults = pagination?.total || 0
  const pageNumber = pagination?.page || currentPage

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ──── Top Bar ──── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales History</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all sales transactions</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Date range */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => handleDateFromChange(e.target.value)}
                className="pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>
            <span className="text-gray-400 text-sm">to</span>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => handleDateToChange(e.target.value)}
                className="pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>
          </div>

          {!isReadOnly && (
            <>
              <Button variant="secondary" size="sm">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Link to="/dashboard/pos">
                <Button variant="primary" size="sm">
                  <Plus className="w-4 h-4" />
                  New Sale
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ──── Stats Row ──── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Sales"
          value={formatCurrency(stats?.todaySales ?? 0)}
          icon={Receipt}
          color="blue"
          trend="12%"
          trendUp
        />
        <StatCard
          title="This Week"
          value={formatCurrency(stats?.weekRevenue ?? 0)}
          icon={Receipt}
          color="green"
          trend="8.3%"
          trendUp
        />
        <StatCard
          title="This Month"
          value={formatCurrency(stats?.monthRevenue ?? 0)}
          icon={Receipt}
          color="blue"
          trend="15.2%"
          trendUp
        />
        <StatCard
          title="Total Transactions"
          value={stats?.salesCount ?? 0}
          icon={Receipt}
          color="amber"
        />
      </div>

      {/* ──── Sales Table ──── */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900">All Transactions</h2>
            <div className="w-full sm:w-72">
              <Input
                icon={Search}
                placeholder="Search by invoice or customer..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-6 font-medium text-gray-500">Invoice #</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Customer</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Items</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Payment</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Total</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-center py-3 px-6 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-3 px-6 font-medium text-primary">{sale.invoiceNo}</td>
                      <td className="py-3 px-4 text-gray-600">{formatDate(sale.createdAt)}</td>
                      <td className="py-3 px-4 text-gray-900">
                        {sale.customer?.name || 'Walk-in'}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-600">
                        {sale.items?.length || 0}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={paymentVariant(sale.paymentMethod)}>
                          {sale.paymentMethod}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={statusVariant(sale.status)}>{sale.status}</Badge>
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setViewingInvoice(sale)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-primary hover:bg-primary-50 transition-colors"
                            title="View Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            title="Print Invoice"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {sales.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-400">
                        <Search className="w-8 h-8 mx-auto mb-2" />
                        <p className="font-medium">No sales found</p>
                        <p className="text-sm mt-1">Try adjusting your search or date filters</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing {(pageNumber - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(pageNumber * ITEMS_PER_PAGE, totalResults)} of{' '}
                {totalResults} results
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      'w-8 h-8 rounded-md text-sm font-medium transition-colors',
                      currentPage === page
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    {page}
                  </button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ──── Invoice Preview Modal ──── */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setViewingInvoice(null)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setViewingInvoice(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Pharmacy Header */}
            <div className="bg-primary px-6 py-5 rounded-t-2xl text-white">
              <h2 className="text-xl font-bold">PharmaCare Plus</h2>
              <p className="text-primary-100 text-sm mt-1">
                123 Medical Drive, Healthcare City, HC 45678
              </p>
              <p className="text-primary-100 text-sm">Phone: (555) 123-4567</p>
            </div>

            {/* Invoice Details */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Invoice Number</p>
                  <p className="font-semibold text-gray-900">{viewingInvoice.invoiceNo}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(viewingInvoice.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Cashier</p>
                  <p className="font-semibold text-gray-900">{viewingInvoice.user?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Customer</p>
                  <p className="font-semibold text-gray-900">
                    {viewingInvoice.customer?.name || 'Walk-in'}
                  </p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="px-6 py-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-500">Item</th>
                    <th className="text-center py-2 font-medium text-gray-500">Qty</th>
                    <th className="text-right py-2 font-medium text-gray-500">Price</th>
                    <th className="text-right py-2 font-medium text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingInvoice.items?.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-50">
                      <td className="py-2 text-gray-900">{item.medicine?.name || item.name}</td>
                      <td className="py-2 text-center text-gray-600">{item.quantity}</td>
                      <td className="py-2 text-right text-gray-600">{formatCurrency(item.price)}</td>
                      <td className="py-2 text-right font-medium text-gray-900">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(viewingInvoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax (5%)</span>
                <span>{formatCurrency(viewingInvoice.tax)}</span>
              </div>
              {viewingInvoice.discount > 0 && (
                <div className="flex justify-between text-sm text-danger">
                  <span>Discount</span>
                  <span>-{formatCurrency(viewingInvoice.discount)}</span>
                </div>
              )}
              <hr className="border-gray-200" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(viewingInvoice.total)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm text-gray-500">Payment Method</span>
                <Badge variant={paymentVariant(viewingInvoice.paymentMethod)}>
                  {viewingInvoice.paymentMethod}
                </Badge>
              </div>
              <div className="pt-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => setViewingInvoice(null)}
                >
                  <X className="w-4 h-4" />
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
