import { Navigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

export default function RoleGuard({ allowedRoles, children }) {
  const { user } = useAuthStore()

  if (!user) return null

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
