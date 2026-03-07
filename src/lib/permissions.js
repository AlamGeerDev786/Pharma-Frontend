// Role-based permissions configuration
// Single source of truth for all frontend access control

export const ROLE_PERMISSIONS = {
  ORG_ADMIN: [
    '/dashboard',
    '/dashboard/medicines',
    '/dashboard/inventory',
    '/dashboard/pos',
    '/dashboard/sales',
    '/dashboard/purchases',
    '/dashboard/suppliers',
    '/dashboard/reports',
    '/dashboard/settings',
    '/dashboard/branches',
    '/dashboard/transfers',
  ],
  ADMIN: [
    '/dashboard',
    '/dashboard/medicines',
    '/dashboard/inventory',
    '/dashboard/pos',
    '/dashboard/sales',
    '/dashboard/purchases',
    '/dashboard/suppliers',
    '/dashboard/reports',
    '/dashboard/settings',
  ],
  PHARMACIST: [
    '/dashboard',
    '/dashboard/medicines',
    '/dashboard/inventory',
    '/dashboard/purchases',
    '/dashboard/suppliers',
    '/dashboard/sales',
    '/dashboard/reports',
  ],
  CASHIER: [
    '/dashboard',
    '/dashboard/pos',
    '/dashboard/sales',
    '/dashboard/medicines',
    '/dashboard/inventory',
  ],
}

// Pages where a role has full CRUD (create/edit/delete) access
const EDIT_PERMISSIONS = {
  ORG_ADMIN: [
    '/dashboard/medicines',
    '/dashboard/inventory',
    '/dashboard/pos',
    '/dashboard/sales',
    '/dashboard/purchases',
    '/dashboard/suppliers',
    '/dashboard/reports',
    '/dashboard/settings',
    '/dashboard/branches',
    '/dashboard/transfers',
  ],
  ADMIN: [
    '/dashboard/medicines',
    '/dashboard/inventory',
    '/dashboard/pos',
    '/dashboard/sales',
    '/dashboard/purchases',
    '/dashboard/suppliers',
    '/dashboard/reports',
    '/dashboard/settings',
  ],
  PHARMACIST: [
    '/dashboard/medicines',
    '/dashboard/inventory',
    '/dashboard/purchases',
    '/dashboard/suppliers',
  ],
  CASHIER: [
    '/dashboard/pos',
    '/dashboard/sales',
  ],
}

/**
 * Check if a role has access to a specific path.
 * Uses prefix matching: '/dashboard/medicines/add' is allowed
 * if '/dashboard/medicines' is in the permitted list.
 */
export function hasAccess(role, path) {
  const allowedPaths = ROLE_PERMISSIONS[role]
  if (!allowedPaths) return false

  // Dashboard index is always allowed
  if (path === '/dashboard') return true

  return allowedPaths.some((allowed) => {
    if (allowed === '/dashboard') return path === '/dashboard'
    return path === allowed || path.startsWith(allowed + '/')
  })
}

/**
 * Check if a role can edit/create/delete on a specific page.
 * Returns false for read-only access (e.g., Cashier viewing medicines).
 */
export function canEdit(role, path) {
  const editPaths = EDIT_PERMISSIONS[role]
  if (!editPaths) return false

  return editPaths.some((allowed) => {
    return path === allowed || path.startsWith(allowed + '/')
  })
}
