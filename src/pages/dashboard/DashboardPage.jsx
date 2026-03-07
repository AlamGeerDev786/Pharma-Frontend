import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  XCircle,
  Clock,
  ChevronDown,
  ArrowUpRight,
  Loader2,
} from 'lucide-react'
import Card, { CardHeader, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import StatCard from '@/components/shared/StatCard'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import useDashboardStore from '../../store/dashboardStore'

const CATEGORY_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#9CA3AF']

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

function RevenueTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-lg font-bold text-gray-900">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    )
  }
  return null
}

// ─── Dashboard Page ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [revenuePeriod, setRevenuePeriod] = useState('weekly')
  const [periodOpen, setPeriodOpen] = useState(false)

  const { stats, revenue, recentSales, alerts, loading, fetchAll, fetchRevenue } = useDashboardStore()

  useEffect(() => {
    fetchAll(revenuePeriod)
  }, [])

  const handlePeriodChange = (period) => {
    setRevenuePeriod(period)
    setPeriodOpen(false)
    fetchRevenue(period)
  }

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // Build category data from stats for pie chart
  const categoryData = stats?.categorySales || []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here is what is happening with your pharmacy today.
        </p>
      </div>

      {/* Row 1 - Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Sales Today"
          value={formatCurrency(stats?.todaySales || 0)}
          icon={DollarSign}
          color="blue"
          trend={`${stats?.salesCount || 0} transactions`}
          trendUp
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats?.monthRevenue || 0)}
          icon={TrendingUp}
          color="green"
          trend={`${stats?.totalMedicines || 0} medicines`}
          trendUp
        />
        <StatCard
          title="Low Stock Items"
          value={String(stats?.lowStock || 0)}
          icon={AlertTriangle}
          color="amber"
          trend="Need restock"
          trendUp={false}
        />
        <StatCard
          title="Expired Medicines"
          value={String(stats?.expiredCount || 0)}
          icon={XCircle}
          color="red"
          trend={`${stats?.expiringCount || 0} expiring soon`}
          trendUp={false}
        />
      </div>

      {/* Row 2 - Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Revenue Overview
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {revenuePeriod === 'weekly'
                    ? 'Last 7 days'
                    : 'This month by week'}
                </p>
              </div>
              {/* Period Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setPeriodOpen(!periodOpen)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {revenuePeriod === 'weekly' ? 'Weekly' : 'Monthly'}
                  <ChevronDown className="w-4 h-4" />
                </button>
                {periodOpen && (
                  <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => handlePeriodChange('weekly')}
                      className={cn(
                        'block w-full text-left px-4 py-2 text-sm rounded-t-lg transition-colors',
                        revenuePeriod === 'weekly'
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      Weekly
                    </button>
                    <button
                      onClick={() => handlePeriodChange('monthly')}
                      className={cn(
                        'block w-full text-left px-4 py-2 text-sm rounded-b-lg transition-colors',
                        revenuePeriod === 'monthly'
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      Monthly
                    </button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {revenue.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={revenue}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="revenueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#2563EB" stopOpacity={0.3} />
                        <stop
                          offset="95%"
                          stopColor="#2563EB"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E5E7EB"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      tickFormatter={(val) => `$${val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val}`}
                    />
                    <Tooltip content={<RevenueTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#2563EB"
                      strokeWidth={2.5}
                      fill="url(#revenueGradient)"
                      activeDot={{
                        r: 6,
                        fill: '#2563EB',
                        stroke: '#fff',
                        strokeWidth: 2,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-gray-400">
                  No revenue data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sales by Category - Pie Chart */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Sales by Category
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Distribution this month
            </p>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value}%`, 'Share']}
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid #E5E7EB',
                          boxShadow:
                            '0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="mt-3 space-y-2">
                  {categoryData.map((entry, index) => (
                    <div
                      key={entry.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                        />
                        <span className="text-gray-600">{entry.name}</span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {entry.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-52 text-sm text-gray-400">
                No category data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3 - Recent Sales & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Sales Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Sales
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Latest transactions
                </p>
              </div>
              <Link to="/dashboard/sales" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-700 transition-colors">
                View All
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left font-medium text-gray-500 px-6 py-3">
                      Invoice #
                    </th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">
                      Customer
                    </th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">
                      Items
                    </th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">
                      Total
                    </th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">
                      Date
                    </th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentSales.length > 0 ? recentSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-3.5 font-medium text-gray-900">
                        {sale.invoiceNo}
                      </td>
                      <td className="px-6 py-3.5 text-gray-600">
                        {sale.customer?.name || 'Walk-in'}
                      </td>
                      <td className="px-6 py-3.5 text-gray-600">
                        {sale.items?.length || sale._count?.items || 0}
                      </td>
                      <td className="px-6 py-3.5 font-medium text-gray-900">
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="px-6 py-3.5 text-gray-500">
                        {formatDate(sale.createdAt)}
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge
                          variant={
                            sale.status === 'COMPLETED' ? 'success' : sale.status === 'REFUNDED' ? 'danger' : 'warning'
                          }
                        >
                          {sale.status === 'COMPLETED'
                            ? 'Completed'
                            : sale.status === 'REFUNDED'
                            ? 'Refunded'
                            : 'Pending'}
                        </Badge>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                        No sales yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Alerts Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Alerts</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {alerts.length} active alerts
                </p>
              </div>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-danger-50 text-xs font-bold text-danger">
                {alerts.length}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.length > 0 ? alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'flex gap-3 p-3 rounded-lg',
                    alert.type === 'low-stock' || alert.type === 'out-of-stock'
                      ? 'bg-warning-50'
                      : 'bg-danger-50'
                  )}
                >
                  <div
                    className={cn(
                      'flex-shrink-0 mt-0.5',
                      alert.type === 'low-stock' || alert.type === 'out-of-stock'
                        ? 'text-warning'
                        : 'text-danger'
                    )}
                  >
                    {alert.type === 'low-stock' || alert.type === 'out-of-stock' ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {alert.message}
                    </p>
                    {alert.medicine && (
                      <p className="text-xs text-gray-500 mt-1">{alert.medicine}</p>
                    )}
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-400 text-center py-4">No alerts</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
