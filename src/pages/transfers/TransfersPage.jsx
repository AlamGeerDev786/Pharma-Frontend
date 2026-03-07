import { useState, useEffect, useMemo } from 'react'
import Card, { CardHeader, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import {
  Plus,
  Search,
  Eye,
  X,
  Trash2,
  ArrowRightLeft,
  Check,
  XCircle,
  Truck,
  Loader2,
  FileText,
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import useTransferStore from '../../store/transferStore'

// ── Helpers ───────────────────────────────────────────────────────────

const statusVariant = (status) => {
  switch (status) {
    case 'PENDING':
      return 'warning'
    case 'APPROVED':
      return 'primary'
    case 'IN_TRANSIT':
      return 'primary'
    case 'COMPLETED':
      return 'success'
    case 'REJECTED':
      return 'danger'
    default:
      return 'default'
  }
}

const statusLabel = (status) => {
  switch (status) {
    case 'IN_TRANSIT':
      return 'In Transit'
    default:
      return status
        ? status.charAt(0) + status.slice(1).toLowerCase()
        : status
  }
}

const EMPTY_ITEM = {
  medicineName: '',
  batchNumber: '',
  quantity: '',
  costPrice: '',
}

// ── Component ─────────────────────────────────────────────────────────

export default function TransfersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [viewingTransfer, setViewingTransfer] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  const { user, branches } = useAuthStore()
  const isOrgAdmin = user?.role === 'ORG_ADMIN'

  const {
    transfers,
    loading,
    fetchTransfers,
    createTransfer,
    approveTransfer,
    completeTransfer,
    rejectTransfer,
  } = useTransferStore()

  // ── Fetch on mount ────────────────────────────────────────────────
  useEffect(() => {
    fetchTransfers()
  }, [])

  // ── Create form state ─────────────────────────────────────────────
  const [fromBranch, setFromBranch] = useState('')
  const [toBranch, setToBranch] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState([{ ...EMPTY_ITEM }])

  // ── Filtered transfers ────────────────────────────────────────────
  const filteredTransfers = useMemo(() => {
    if (!searchQuery) return transfers
    const q = searchQuery.toLowerCase()
    return transfers.filter(
      (t) =>
        (t.id && String(t.id).includes(q)) ||
        (t.fromBranch?.name && t.fromBranch.name.toLowerCase().includes(q)) ||
        (t.toBranch?.name && t.toBranch.name.toLowerCase().includes(q)) ||
        (t.status && t.status.toLowerCase().includes(q))
    )
  }, [transfers, searchQuery])

  // ── Item handlers ─────────────────────────────────────────────────
  const addItem = () => {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }])
  }

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const updateItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  const itemSubtotal = (item) => {
    const qty = parseFloat(item.quantity) || 0
    const price = parseFloat(item.costPrice) || 0
    return qty * price
  }

  const totalCost = useMemo(() => {
    return items.reduce((sum, item) => sum + itemSubtotal(item), 0)
  }, [items])

  // ── Modal handlers ────────────────────────────────────────────────
  const openCreateModal = () => {
    setFromBranch('')
    setToBranch('')
    setNotes('')
    setItems([{ ...EMPTY_ITEM }])
    setSaveError(null)
    setShowCreateModal(true)
  }

  const closeCreateModal = () => {
    setShowCreateModal(false)
    setSaveError(null)
  }

  const handleSaveTransfer = async () => {
    if (!fromBranch) {
      setSaveError('Please select a source branch.')
      return
    }
    if (!toBranch) {
      setSaveError('Please select a destination branch.')
      return
    }
    if (fromBranch === toBranch) {
      setSaveError('Source and destination branches must be different.')
      return
    }

    const hasValidItem = items.some(
      (item) => item.medicineName && item.quantity && item.costPrice
    )
    if (!hasValidItem) {
      setSaveError(
        'Please add at least one item with medicine name, quantity, and cost price.'
      )
      return
    }

    setSaving(true)
    setSaveError(null)

    try {
      await createTransfer({
        fromBranchId: fromBranch,
        toBranchId: toBranch,
        notes: notes || undefined,
        items: items
          .filter((item) => item.medicineName)
          .map((item) => ({
            medicineName: item.medicineName,
            batchNumber: item.batchNumber || undefined,
            quantity: Number(item.quantity),
            costPrice: Number(item.costPrice),
          })),
      })
      closeCreateModal()
    } catch (err) {
      setSaveError(
        err.response?.data?.error ||
          'Failed to create transfer request. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  // ── Action handlers ───────────────────────────────────────────────
  const handleApprove = async (id) => {
    setActionLoading(id)
    try {
      await approveTransfer(id)
    } catch {
      // silently fail
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id) => {
    setActionLoading(id)
    try {
      await rejectTransfer(id)
    } catch {
      // silently fail
    } finally {
      setActionLoading(null)
    }
  }

  const handleComplete = async (id) => {
    setActionLoading(id)
    try {
      await completeTransfer(id)
    } catch {
      // silently fail
    } finally {
      setActionLoading(null)
    }
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ──── Top Bar ──── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Transfers</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage stock transfers between branches
          </p>
        </div>
        <Button variant="primary" size="md" onClick={openCreateModal}>
          <Plus className="w-4 h-4" />
          New Transfer
        </Button>
      </div>

      {/* ──── Stats Row ──── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Transfers',
            value: transfers.length,
            color: 'bg-primary-50 text-primary',
          },
          {
            label: 'Pending',
            value: transfers.filter((t) => t.status === 'PENDING').length,
            color: 'bg-warning-50 text-warning-600',
          },
          {
            label: 'In Transit',
            value: transfers.filter((t) => t.status === 'IN_TRANSIT' || t.status === 'APPROVED').length,
            color: 'bg-primary-100 text-primary-800',
          },
          {
            label: 'Completed',
            value: transfers.filter((t) => t.status === 'COMPLETED').length,
            color: 'bg-accent-50 text-accent-600',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={cn('text-2xl font-bold mt-1', stat.color)}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* ──── Transfers Table ──── */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              All Transfers
            </h2>
            <div className="w-full sm:w-72">
              <Input
                icon={Search}
                placeholder="Search by ID, branch, or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="ml-3 text-gray-500">Loading transfers...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-6 font-medium text-gray-500">
                      ID / Date
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">
                      From Branch
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">
                      To Branch
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">
                      Items
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">
                      Status
                    </th>
                    <th className="text-center py-3 px-6 font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransfers.map((transfer) => (
                    <tr
                      key={transfer.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-3.5 px-6">
                        <p className="font-medium text-primary">
                          TRF-{transfer.id}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(transfer.createdAt)}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-gray-900">
                        {transfer.fromBranch?.name || '---'}
                      </td>
                      <td className="py-3.5 px-4 text-gray-900">
                        {transfer.toBranch?.name || '---'}
                      </td>
                      <td className="py-3.5 px-4 text-center text-gray-600">
                        {transfer.items?.length || 0}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge variant={statusVariant(transfer.status)}>
                          {statusLabel(transfer.status)}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center justify-center gap-1">
                          {/* View */}
                          <button
                            onClick={() => setViewingTransfer(transfer)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-primary hover:bg-primary-50 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Approve / Reject (ORG_ADMIN only, PENDING only) */}
                          {isOrgAdmin && transfer.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(transfer.id)}
                                disabled={actionLoading === transfer.id}
                                className="p-1.5 rounded-md text-gray-400 hover:text-accent-600 hover:bg-accent-50 transition-colors disabled:opacity-50"
                                title="Approve"
                              >
                                {actionLoading === transfer.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleReject(transfer.id)}
                                disabled={actionLoading === transfer.id}
                                className="p-1.5 rounded-md text-gray-400 hover:text-danger hover:bg-danger-50 transition-colors disabled:opacity-50"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* Complete (APPROVED transfers) */}
                          {transfer.status === 'APPROVED' && (
                            <button
                              onClick={() => handleComplete(transfer.id)}
                              disabled={actionLoading === transfer.id}
                              className="p-1.5 rounded-md text-gray-400 hover:text-accent-600 hover:bg-accent-50 transition-colors disabled:opacity-50"
                              title="Complete Transfer"
                            >
                              {actionLoading === transfer.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Truck className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredTransfers.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-gray-400"
                      >
                        <ArrowRightLeft className="w-8 h-8 mx-auto mb-2" />
                        <p className="font-medium">No transfers found</p>
                        <p className="text-sm mt-1">
                          Create a new transfer to move stock between branches
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ──── View Transfer Detail Modal ──── */}
      {viewingTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setViewingTransfer(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setViewingTransfer(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="bg-primary px-6 py-5 rounded-t-2xl text-white">
              <h2 className="text-xl font-bold">
                TRF-{viewingTransfer.id}
              </h2>
              <p className="text-primary-100 text-sm mt-1">
                Stock Transfer Details
              </p>
            </div>

            {/* Details */}
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">From Branch</p>
                  <p className="font-semibold text-gray-900">
                    {viewingTransfer.fromBranch?.name || '---'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">To Branch</p>
                  <p className="font-semibold text-gray-900">
                    {viewingTransfer.toBranch?.name || '---'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(viewingTransfer.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <Badge variant={statusVariant(viewingTransfer.status)}>
                    {statusLabel(viewingTransfer.status)}
                  </Badge>
                </div>
                {viewingTransfer.createdBy && (
                  <div>
                    <p className="text-gray-500">Requested By</p>
                    <p className="font-semibold text-gray-900">
                      {viewingTransfer.createdBy?.name || '---'}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500">Total Items</p>
                  <p className="font-semibold text-gray-900">
                    {viewingTransfer.items?.length || 0}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {viewingTransfer.notes && (
                <>
                  <hr className="border-gray-200" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Notes</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                      {viewingTransfer.notes}
                    </p>
                  </div>
                </>
              )}

              {/* Items */}
              {viewingTransfer.items && viewingTransfer.items.length > 0 && (
                <>
                  <hr className="border-gray-200" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Transfer Items
                    </h3>
                    <div className="space-y-2">
                      {viewingTransfer.items.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.medicine?.name ||
                                item.medicineName ||
                                `Item ${idx + 1}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity}
                              {item.batchNumber
                                ? ` | Batch: ${item.batchNumber}`
                                : ''}
                            </p>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(
                              (Number(item.quantity) || 0) *
                                (Number(item.costPrice) || 0)
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Total */}
              <hr className="border-gray-200" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">
                  Total Value
                </span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(
                    viewingTransfer.items?.reduce(
                      (sum, item) =>
                        sum +
                        (Number(item.quantity) || 0) *
                          (Number(item.costPrice) || 0),
                      0
                    ) || viewingTransfer.totalValue || 0
                  )}
                </span>
              </div>

              {/* Status History */}
              {viewingTransfer.statusHistory &&
                viewingTransfer.statusHistory.length > 0 && (
                  <>
                    <hr className="border-gray-200" />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Status History
                      </h3>
                      <div className="space-y-2">
                        {viewingTransfer.statusHistory.map((entry, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  'w-2 h-2 rounded-full',
                                  entry.status === 'COMPLETED'
                                    ? 'bg-accent-500'
                                    : entry.status === 'REJECTED'
                                    ? 'bg-danger'
                                    : entry.status === 'APPROVED'
                                    ? 'bg-primary'
                                    : 'bg-warning-500'
                                )}
                              />
                              <span className="text-gray-700">
                                {statusLabel(entry.status)}
                              </span>
                              {entry.user?.name && (
                                <span className="text-gray-400">
                                  by {entry.user.name}
                                </span>
                              )}
                            </div>
                            <span className="text-gray-400 text-xs">
                              {formatDate(entry.createdAt)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex gap-2">
              {/* Inline actions in detail view */}
              {isOrgAdmin && viewingTransfer.status === 'PENDING' && (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      handleApprove(viewingTransfer.id)
                      setViewingTransfer(null)
                    }}
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      handleReject(viewingTransfer.id)
                      setViewingTransfer(null)
                    }}
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </Button>
                </>
              )}
              {viewingTransfer.status === 'APPROVED' && (
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    handleComplete(viewingTransfer.id)
                    setViewingTransfer(null)
                  }}
                >
                  <Truck className="w-4 h-4" />
                  Complete Transfer
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                className={
                  isOrgAdmin && viewingTransfer.status === 'PENDING'
                    ? ''
                    : viewingTransfer.status === 'APPROVED'
                    ? ''
                    : 'w-full'
                }
                onClick={() => setViewingTransfer(null)}
              >
                <X className="w-4 h-4" />
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ──── Create Transfer Modal ──── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeCreateModal}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-lg font-semibold text-gray-900">
                New Stock Transfer
              </h2>
              <button
                onClick={closeCreateModal}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <div className="px-6 py-5 space-y-6">
              {/* Error banner */}
              {saveError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  {saveError}
                </div>
              )}

              {/* Branch selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    From Branch (Source)
                  </label>
                  <select
                    value={fromBranch}
                    onChange={(e) => setFromBranch(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  >
                    <option value="">Select source branch</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    To Branch (Destination)
                  </label>
                  <select
                    value={toBranch}
                    onChange={(e) => setToBranch(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  >
                    <option value="">Select destination branch</option>
                    {branches
                      .filter((b) => b.id !== fromBranch)
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this transfer..."
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
                />
              </div>

              {/* Items Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Transfer Items
                  </h3>
                  <Button variant="ghost" size="sm" onClick={addItem}>
                    <Plus className="w-4 h-4" />
                    Add Item
                  </Button>
                </div>

                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left py-2.5 px-3 font-medium text-gray-500">
                          Medicine Name
                        </th>
                        <th className="text-left py-2.5 px-3 font-medium text-gray-500">
                          Batch #
                        </th>
                        <th className="text-left py-2.5 px-3 font-medium text-gray-500 w-24">
                          Qty
                        </th>
                        <th className="text-left py-2.5 px-3 font-medium text-gray-500 w-28">
                          Cost Price
                        </th>
                        <th className="text-right py-2.5 px-3 font-medium text-gray-500 w-28">
                          Subtotal
                        </th>
                        <th className="py-2.5 px-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-100 last:border-b-0"
                        >
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              placeholder="Medicine name"
                              value={item.medicineName}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  'medicineName',
                                  e.target.value
                                )
                              }
                              className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              placeholder="BT-XXXX"
                              value={item.batchNumber}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  'batchNumber',
                                  e.target.value
                                )
                              }
                              className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="1"
                              placeholder="0"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(index, 'quantity', e.target.value)
                              }
                              className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              value={item.costPrice}
                              onChange={(e) =>
                                updateItem(index, 'costPrice', e.target.value)
                              }
                              className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-gray-900">
                            {formatCurrency(itemSubtotal(item))}
                          </td>
                          <td className="py-2 px-3">
                            {items.length > 1 && (
                              <button
                                onClick={() => removeItem(index)}
                                className="p-1 rounded-md text-gray-400 hover:text-danger hover:bg-danger-50 transition-colors"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total */}
                <div className="flex items-center justify-end mt-4 pr-1">
                  <div className="bg-primary-50 rounded-lg px-6 py-3 border border-primary-100">
                    <span className="text-sm font-medium text-gray-600 mr-3">
                      Total Value:
                    </span>
                    <span className="text-xl font-bold text-primary">
                      {formatCurrency(totalCost)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl sticky bottom-0">
              <Button
                variant="secondary"
                size="md"
                onClick={closeCreateModal}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleSaveTransfer}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="w-4 h-4" />
                    Create Transfer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
