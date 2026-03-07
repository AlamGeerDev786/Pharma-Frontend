import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  Download,
  FileText,
  Calendar,
  TrendingUp,
  Package,
  AlertTriangle,
  ShoppingBag,
  Loader2,
} from 'lucide-react'
import Card, { CardHeader, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { cn, formatCurrency } from '@/lib/utils'
import { canEdit } from '@/lib/permissions'
import useAuthStore from '../../store/authStore'
import useReportStore from '../../store/reportStore'

// ─── Tab Configuration ──────────────────────────────────────────────────────

const tabs = [
  { id: 'daily', label: 'Daily Sales', icon: Calendar },
  { id: 'monthly', label: 'Monthly Sales', icon: TrendingUp },
  { id: 'profit', label: 'Profit', icon: TrendingUp },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'expiry', label: 'Expiry', icon: AlertTriangle },
  { id: 'purchase', label: 'Purchase', icon: ShoppingBag },
]

// ─── No Data Placeholder ────────────────────────────────────────────────────

function NoData({ message = 'No data available' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <Package className="w-12 h-12 mb-3" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}

// ─── Custom Tooltips ────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3">
        <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            <span className="font-medium">{entry.name}: </span>
            {typeof entry.value === 'number' && entry.name !== 'transactions'
              ? formatCurrency(entry.value)
              : entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// ─── Helper: fetch data for a given tab ─────────────────────────────────────

function fetchDataForTab(tab, { dateFrom, dateTo, fetchSalesSummary, fetchTopSelling, fetchInventoryHealth, fetchExpiryReport, fetchProfitReport }) {
  const params = { dateFrom, dateTo }
  switch (tab) {
    case 'daily':
    case 'monthly':
      return fetchSalesSummary(params)
    case 'profit':
      return fetchProfitReport(params)
    case 'inventory':
      return fetchInventoryHealth()
    case 'expiry':
      return fetchExpiryReport()
    case 'purchase':
      return fetchSalesSummary(params)
    default:
      return Promise.resolve()
  }
}

// ─── Reports Page ───────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('daily')
  const [dateFrom, setDateFrom] = useState('2026-02-18')
  const [dateTo, setDateTo] = useState('2026-02-24')

  const { user } = useAuthStore()
  const isReadOnly = !canEdit(user?.role, '/dashboard/reports')

  const {
    salesSummary,
    topSelling,
    inventoryHealth,
    expiryReport,
    profitReport,
    loading,
    fetchSalesSummary,
    fetchTopSelling,
    fetchInventoryHealth,
    fetchExpiryReport,
    fetchProfitReport,
  } = useReportStore()

  // Fetch data on mount and when tab changes
  useEffect(() => {
    fetchDataForTab(activeTab, {
      dateFrom,
      dateTo,
      fetchSalesSummary,
      fetchTopSelling,
      fetchInventoryHealth,
      fetchExpiryReport,
      fetchProfitReport,
    })
  }, [activeTab])

  // Handle "Apply" button click
  const handleApply = () => {
    fetchDataForTab(activeTab, {
      dateFrom,
      dateTo,
      fetchSalesSummary,
      fetchTopSelling,
      fetchInventoryHealth,
      fetchExpiryReport,
      fetchProfitReport,
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          Analyze your pharmacy performance with detailed reports and analytics.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Date Range Picker & Export */}
      <Card>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="w-44">
              <Input
                label="From"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                icon={Calendar}
              />
            </div>
            <div className="w-44">
              <Input
                label="To"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                icon={Calendar}
              />
            </div>
            <Button variant="primary" size="md" onClick={handleApply} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
            </Button>
            {!isReadOnly && (
              <div className="flex gap-2 ml-auto">
                <Button variant="secondary" size="md">
                  <FileText className="w-4 h-4" />
                  Export PDF
                </Button>
                <Button variant="secondary" size="md">
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-sm text-gray-500">Loading report data...</span>
        </div>
      )}

      {/* Tab Content */}
      {!loading && activeTab === 'daily' && <DailySalesReport data={salesSummary?.daily || []} />}
      {!loading && activeTab === 'monthly' && <MonthlySalesReport data={salesSummary?.monthly || []} />}
      {!loading && activeTab === 'profit' && <ProfitReport data={profitReport} />}
      {!loading && activeTab === 'inventory' && <InventoryReport data={inventoryHealth} />}
      {!loading && activeTab === 'expiry' && <ExpiryReport data={expiryReport} />}
      {!loading && activeTab === 'purchase' && <PurchaseReport data={salesSummary} />}
    </div>
  )
}

// ─── Daily Sales Report ─────────────────────────────────────────────────────

function DailySalesReport({ data }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <NoData message="No daily sales data available for the selected period." />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Daily Sales - Last 7 Days</h2>
          <p className="text-sm text-gray-500 mt-0.5">Revenue breakdown by day</p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="totalSales"
                  name="Total Sales"
                  fill="#2563EB"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Daily Sales Details</h2>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left font-medium text-gray-500 px-6 py-3">Date</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-3">Transactions Count</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-3">Total Sales</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-3">Average Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map((row, idx) => (
                  <tr key={row.date || idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-gray-900">{row.date}</td>
                    <td className="px-6 py-3.5 text-gray-600">{row.transactions}</td>
                    <td className="px-6 py-3.5 font-medium text-gray-900">{formatCurrency(row.totalSales)}</td>
                    <td className="px-6 py-3.5 text-gray-600">{formatCurrency(row.avgOrder)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50/50">
                  <td className="px-6 py-3.5 font-semibold text-gray-900">Total</td>
                  <td className="px-6 py-3.5 font-semibold text-gray-900">
                    {data.reduce((s, r) => s + (r.transactions || 0), 0)}
                  </td>
                  <td className="px-6 py-3.5 font-semibold text-gray-900">
                    {formatCurrency(data.reduce((s, r) => s + (r.totalSales || 0), 0))}
                  </td>
                  <td className="px-6 py-3.5 font-semibold text-gray-900">
                    {formatCurrency(
                      data.reduce((s, r) => s + (r.totalSales || 0), 0) /
                        (data.reduce((s, r) => s + (r.transactions || 0), 0) || 1)
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Monthly Sales Report ───────────────────────────────────────────────────

function MonthlySalesReport({ data }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <NoData message="No monthly sales data available for the selected period." />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Monthly Revenue - Last 6 Months</h2>
          <p className="text-sm text-gray-500 mt-0.5">Revenue trend over time</p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  dot={{ r: 5, fill: '#2563EB', stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#2563EB', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Monthly Sales Details</h2>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left font-medium text-gray-500 px-6 py-3">Month</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-3">Transactions</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-3">Revenue</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-3">Growth %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map((row, idx) => (
                  <tr key={row.month || idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-gray-900">{row.month}</td>
                    <td className="px-6 py-3.5 text-gray-600">{(row.transactions || 0).toLocaleString()}</td>
                    <td className="px-6 py-3.5 font-medium text-gray-900">{formatCurrency(row.revenue)}</td>
                    <td className="px-6 py-3.5">
                      {row.growth !== undefined && row.growth !== null ? (
                        <Badge variant={row.growth >= 0 ? 'success' : 'danger'}>
                          {row.growth >= 0 ? '+' : ''}{row.growth}%
                        </Badge>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Profit Report ──────────────────────────────────────────────────────────

function ProfitReport({ data }) {
  const profitData = Array.isArray(data) ? data : (data?.data || [])

  if (profitData.length === 0) {
    return (
      <Card>
        <CardContent>
          <NoData message="No profit data available for the selected period." />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Profit Trend - Revenue vs Cost</h2>
          <p className="text-sm text-gray-500 mt-0.5">Profit analysis over the last 6 months</p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={profitData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis
                  dataKey="period"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#2563EB"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="cost"
                  name="Cost"
                  stroke="#EF4444"
                  strokeWidth={2}
                  fill="url(#costGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Profit Breakdown</h2>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left font-medium text-gray-500 px-6 py-3">Period</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-3">Revenue</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-3">Cost</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-3">Profit</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-3">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {profitData.map((row, idx) => (
                  <tr key={row.period || idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-gray-900">{row.period}</td>
                    <td className="px-6 py-3.5 text-gray-600">{formatCurrency(row.revenue)}</td>
                    <td className="px-6 py-3.5 text-gray-600">{formatCurrency(row.cost)}</td>
                    <td className="px-6 py-3.5 font-medium text-accent-600">{formatCurrency(row.profit)}</td>
                    <td className="px-6 py-3.5">
                      {row.margin !== undefined ? (
                        <Badge variant={row.margin >= 35 ? 'success' : 'warning'}>{row.margin}%</Badge>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50/50">
                  <td className="px-6 py-3.5 font-semibold text-gray-900">Total</td>
                  <td className="px-6 py-3.5 font-semibold text-gray-900">
                    {formatCurrency(profitData.reduce((s, r) => s + (r.revenue || 0), 0))}
                  </td>
                  <td className="px-6 py-3.5 font-semibold text-gray-900">
                    {formatCurrency(profitData.reduce((s, r) => s + (r.cost || 0), 0))}
                  </td>
                  <td className="px-6 py-3.5 font-semibold text-accent-600">
                    {formatCurrency(profitData.reduce((s, r) => s + (r.profit || 0), 0))}
                  </td>
                  <td className="px-6 py-3.5 font-semibold text-gray-900">
                    {(() => {
                      const totalRevenue = profitData.reduce((s, r) => s + (r.revenue || 0), 0)
                      const totalProfit = profitData.reduce((s, r) => s + (r.profit || 0), 0)
                      return totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0.0'
                    })()}
                    %
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Inventory Report ───────────────────────────────────────────────────────

function InventoryReport({ data }) {
  const inventoryData = Array.isArray(data) ? data : (data?.categories || data?.data || [])

  if (inventoryData.length === 0) {
    return (
      <Card>
        <CardContent>
          <NoData message="No inventory data available." />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Stock Levels by Category</h2>
          <p className="text-sm text-gray-500 mt-0.5">Current inventory distribution across categories</p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={inventoryData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 80, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  width={70}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="inStock" name="In Stock" fill="#10B981" stackId="stack" barSize={22} />
                <Bar dataKey="lowStock" name="Low Stock" fill="#F59E0B" stackId="stack" barSize={22} />
                <Bar
                  dataKey="outOfStock"
                  name="Out of Stock"
                  fill="#EF4444"
                  stackId="stack"
                  barSize={22}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Inventory Summary by Category</h2>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left font-medium text-gray-500 px-6 py-3">Category</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-3">Total Items</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-3">In Stock</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-3">Low Stock</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-3">Out of Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {inventoryData.map((row, idx) => (
                  <tr key={row.category || idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-gray-900">{row.category}</td>
                    <td className="px-6 py-3.5 text-gray-600">{row.totalItems}</td>
                    <td className="px-6 py-3.5">
                      <Badge variant="success">{row.inStock}</Badge>
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge variant="warning">{row.lowStock}</Badge>
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge variant="danger">{row.outOfStock}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50/50">
                  <td className="px-6 py-3.5 font-semibold text-gray-900">Total</td>
                  <td className="px-6 py-3.5 font-semibold text-gray-900">
                    {inventoryData.reduce((s, r) => s + (r.totalItems || 0), 0)}
                  </td>
                  <td className="px-6 py-3.5 font-semibold text-gray-900">
                    {inventoryData.reduce((s, r) => s + (r.inStock || 0), 0)}
                  </td>
                  <td className="px-6 py-3.5 font-semibold text-gray-900">
                    {inventoryData.reduce((s, r) => s + (r.lowStock || 0), 0)}
                  </td>
                  <td className="px-6 py-3.5 font-semibold text-gray-900">
                    {inventoryData.reduce((s, r) => s + (r.outOfStock || 0), 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Expiry Report ──────────────────────────────────────────────────────────

function ExpiryReport({ data }) {
  const summaryData = data?.summary || []
  const detailsData = data?.details || []

  // Default color mapping for expiry categories
  const defaultColors = {
    Expired: '#EF4444',
    'Within 30 Days': '#F59E0B',
    'Within 90 Days': '#2563EB',
    Safe: '#10B981',
  }

  // Assign colors to summary data if not provided by API
  const coloredSummary = summaryData.map((item) => ({
    ...item,
    color: item.color || defaultColors[item.name] || '#6B7280',
  }))

  if (coloredSummary.length === 0 && detailsData.length === 0) {
    return (
      <Card>
        <CardContent>
          <NoData message="No expiry data available." />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {coloredSummary.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Expiry Distribution</h2>
            <p className="text-sm text-gray-500 mt-0.5">Overview of medicine expiry status</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="h-72 w-full lg:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={coloredSummary}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {coloredSummary.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value} items`, name]}
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full lg:w-1/2 space-y-3">
                {coloredSummary.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm text-gray-600">{entry.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{entry.value} items</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Total Medicines</span>
                  <span className="text-sm font-bold text-gray-900">
                    {coloredSummary.reduce((s, r) => s + (r.value || 0), 0)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {detailsData.length > 0 ? (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Expiry Details</h2>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left font-medium text-gray-500 px-6 py-3">Medicine</th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">Batch #</th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">Expiry Date</th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">Days Left</th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">Stock</th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {detailsData.map((row, idx) => (
                    <tr key={row.batch || idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-gray-900">{row.medicine}</td>
                      <td className="px-6 py-3.5 text-gray-600 font-mono text-xs">{row.batch}</td>
                      <td className="px-6 py-3.5 text-gray-600">{row.expiry}</td>
                      <td className="px-6 py-3.5">
                        <span
                          className={cn(
                            'font-medium',
                            row.daysLeft <= 0
                              ? 'text-danger'
                              : row.daysLeft <= 30
                                ? 'text-warning'
                                : row.daysLeft <= 90
                                  ? 'text-primary'
                                  : 'text-accent-600'
                          )}
                        >
                          {row.daysLeft <= 0 ? `${Math.abs(row.daysLeft)} days ago` : `${row.daysLeft} days`}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-gray-600">{row.stock}</td>
                      <td className="px-6 py-3.5">
                        <Badge
                          variant={
                            row.status === 'Expired'
                              ? 'danger'
                              : row.status === 'Expiring Soon'
                                ? 'warning'
                                : row.status === 'Warning'
                                  ? 'primary'
                                  : 'success'
                          }
                        >
                          {row.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <NoData message="No expiry detail records found." />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── Purchase Report ────────────────────────────────────────────────────────

function PurchaseReport({ data }) {
  const purchaseChartData = data?.purchases || data?.purchaseMonthly || []
  const purchaseTableData = data?.purchaseBySupplier || data?.suppliers || []

  if (purchaseChartData.length === 0 && purchaseTableData.length === 0) {
    return (
      <Card>
        <CardContent>
          <NoData message="No purchase data available for the selected period." />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {purchaseChartData.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Monthly Purchases</h2>
            <p className="text-sm text-gray-500 mt-0.5">Purchase amount trend over the last 6 months</p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={purchaseChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    tickFormatter={(val) => `$${val / 1000}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="amount"
                    name="Purchase Amount"
                    fill="#10B981"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {purchaseTableData.length > 0 ? (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Purchase Summary by Supplier</h2>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left font-medium text-gray-500 px-6 py-3">Supplier</th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">Total Orders</th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">Total Amount</th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">Avg Order Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {purchaseTableData.map((row, idx) => (
                    <tr key={row.supplier || idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-gray-900">{row.supplier}</td>
                      <td className="px-6 py-3.5 text-gray-600">{row.totalOrders}</td>
                      <td className="px-6 py-3.5 font-medium text-gray-900">{formatCurrency(row.totalAmount)}</td>
                      <td className="px-6 py-3.5 text-gray-600">{formatCurrency(row.avgOrderValue)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-gray-50/50">
                    <td className="px-6 py-3.5 font-semibold text-gray-900">Total</td>
                    <td className="px-6 py-3.5 font-semibold text-gray-900">
                      {purchaseTableData.reduce((s, r) => s + (r.totalOrders || 0), 0)}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-gray-900">
                      {formatCurrency(purchaseTableData.reduce((s, r) => s + (r.totalAmount || 0), 0))}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-gray-900">
                      {formatCurrency(
                        purchaseTableData.reduce((s, r) => s + (r.totalAmount || 0), 0) /
                          (purchaseTableData.reduce((s, r) => s + (r.totalOrders || 0), 0) || 1)
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <NoData message="No supplier purchase data available." />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
