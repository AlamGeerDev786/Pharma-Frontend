import { cn } from '@/lib/utils'

const colorMap = {
  blue: { bg: 'bg-primary-50', icon: 'text-primary', border: 'border-primary-100' },
  green: { bg: 'bg-accent-50', icon: 'text-accent', border: 'border-accent-100' },
  red: { bg: 'bg-danger-50', icon: 'text-danger', border: 'border-danger-100' },
  amber: { bg: 'bg-warning-50', icon: 'text-warning', border: 'border-warning-100' },
}

export default function StatCard({ title, value, icon: Icon, color = 'blue', trend, trendUp }) {
  const colors = colorMap[color]
  return (
    <div className={cn('bg-white rounded-xl border p-6 shadow-sm', colors.border)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={cn('mt-1 text-sm font-medium', trendUp ? 'text-accent' : 'text-danger')}>
              {trendUp ? '+' : ''}{trend}
            </p>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', colors.bg)}>
          <Icon className={cn('w-6 h-6', colors.icon)} />
        </div>
      </div>
    </div>
  )
}
