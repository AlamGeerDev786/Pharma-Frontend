import { cn } from '@/lib/utils'

const variants = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-primary-100 text-primary-800',
  success: 'bg-accent-50 text-accent-600',
  danger: 'bg-danger-50 text-danger-600',
  warning: 'bg-warning-50 text-warning-600',
}

export default function Badge({ children, variant = 'default', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
