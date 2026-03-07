import { useState, useMemo, useEffect, useCallback } from 'react'
import Card, { CardHeader, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import StatCard from '@/components/shared/StatCard'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  Plus,
  Search,
  Eye,
  Printer,
  Trash2,
  X,
  ShoppingBag,
  Calendar,
  Loader2,
} from 'lucide-react'
import usePurchaseStore from '../../store/purchaseStore'
import useSupplierStore from '../../store/supplierStore'
import useMedicineStore from '../../store/medicineStore'

// ─── Empty item template ────────────────────────────────────────────────────

const EMPTY_ITEM = {
  medicineId: '',
  batchNumber: '',
  quantity: '',
  purchasePrice: '',
  expiryDate: '',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const paymentStatusVariant = (status) => {
  switch (status) {
    case 'RECEIVED':
    case 'Paid':
      return 'success'
    case 'ORDERED':
    case 'Partial':
      return 'warning'
    case 'Pending':
      return 'danger'
    default:
      return 'default'
  }
}

const statusLabel = (status) => {
  switch (status) {
    case 'RECEIVED':
      return 'Received'
    case 'ORDERED':
      return 'Ordered'
    default:
      return status
  }
}

// ─── Purchases Page ──────────────────────────────────────────────────────────

export default function PurchasesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [viewingPO, setViewingPO] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  // ── Store data ──────────────────────────────────────────────────────────
  const { purchases, pagination, loading, fetchPurchases, createPurchase } =
    usePurchaseStore()
  const { suppliers, fetchSuppliers } = useSupplierStore()
  const { medicines, fetchMedicines } = useMedicineStore()

  // ── Fetch data on mount ─────────────────────────────────────────────────
  useEffect(() => {
    fetchPurchases()
    fetchSuppliers()
    fetchMedicines({ limit: 100 })
  }, [])

  // ── Search: re-fetch when searchQuery changes ───────────────────────────
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchPurchases({ search: searchQuery || undefined })
    }, 400)
    return () => clearTimeout(timeout)
  }, [searchQuery])

  // ── Create PO form state ───────────────────────────────────────────────
  const [poSupplier, setPOSupplier] = useState('')
  const [poItems, setPOItems] = useState([{ ...EMPTY_ITEM }])

  // ── Filter by date (client-side) ───────────────────────────────────────
  const filteredPurchases = useMemo(() => {
    if (!dateFilter) return purchases
    return purchases.filter((po) => {
      const poDate = po.createdAt
        ? new Date(po.createdAt).toISOString().slice(0, 10)
        : ''
      return poDate === dateFilter
    })
  }, [purchases, dateFilter])

  // ── Computed stats ─────────────────────────────────────────────────────
  const totalPurchasesAmount = useMemo(() => {
    return purchases.reduce((sum, po) => sum + (Number(po.total) || 0), 0)
  }, [purchases])

  const pendingPayments = useMemo(() => {
    return purchases
      .filter((po) => po.status === 'ORDERED')
      .reduce((sum, po) => sum + (Number(po.total) || 0), 0)
  }, [purchases])

  const thisMonthAmount = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    return purchases
      .filter((po) => {
        const d = new Date(po.createdAt)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      })
      .reduce((sum, po) => sum + (Number(po.total) || 0), 0)
  }, [purchases])

  // ── PO items handlers ──────────────────────────────────────────────────
  const addItem = () => {
    setPOItems((prev) => [...prev, { ...EMPTY_ITEM }])
  }

  const removeItem = (index) => {
    setPOItems((prev) => prev.filter((_, i) => i !== index))
  }

  const updateItem = (index, field, value) => {
    setPOItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    )
  }

  const itemSubtotal = (item) => {
    const qty = parseFloat(item.quantity) || 0
    const price = parseFloat(item.purchasePrice) || 0
    return qty * price
  }

  const poTotal = useMemo(() => {
    return poItems.reduce((sum, item) => sum + itemSubtotal(item), 0)
  }, [poItems])

  // ── Modal handlers ─────────────────────────────────────────────────────
  const openCreateModal = () => {
    setPOSupplier('')
    setPOItems([{ ...EMPTY_ITEM }])
    setSaveError(null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSaveError(null)
  }

  const handleSavePO = async () => {
    if (!poSupplier) {
      setSaveError('Please select a supplier.')
      return
    }

    const hasValidItem = poItems.some(
      (item) => item.medicineId && item.quantity && item.purchasePrice
    )
    if (!hasValidItem) {
      setSaveError('Please add at least one item with medicine, quantity, and price.')
      return
    }

    setSaving(true)
    setSaveError(null)

    try {
      await createPurchase({
        supplierId: poSupplier,
        items: poItems
          .filter((item) => item.medicineId)
          .map((item) => ({
            medicineId: item.medicineId,
            batchNo: item.batchNumber,
            quantity: Number(item.quantity),
            purchasePrice: Number(item.purchasePrice),
            expiryDate: item.expiryDate || undefined,
          })),
      })
      closeModal()
    } catch (err) {
      setSaveError(
        err.response?.data?.error || 'Failed to create purchase order. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ──── Top Bar ──── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchases</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage purchase orders and supplier payments
          </p>
        </div>
        <Button variant="primary" size="md" onClick={openCreateModal}>
          <Plus className="w-4 h-4" />
          Create Purchase Order
        </Button>
      </div>

      {/* ──── Stats Row ──── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Purchases"
          value={formatCurrency(totalPurchasesAmount)}
          icon={ShoppingBag}
          color="blue"
        />
        <StatCard
          title="Pending Payments"
          value={formatCurrency(pendingPayments)}
          icon={ShoppingBag}
          color="amber"
        />
        <StatCard
          title="This Month"
          value={formatCurrency(thisMonthAmount)}
          icon={ShoppingBag}
          color="green"
        />
      </div>

      {/* ──── Purchase Orders Table ──── */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Purchase Orders
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>
              <div className="w-full sm:w-64">
                <Input
                  icon={Search}
                  placeholder="Search PO# or supplier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-gray-500">Loading purchases...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-6 font-medium text-gray-500">
                      PO Number
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">
                      Supplier
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">
                      Date
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">
                      Items
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">
                      Total Amount
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
                  {filteredPurchases.map((po) => (
                    <tr
                      key={po.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-3.5 px-6 font-medium text-primary">
                        {po.invoiceNo || `PO-${po.id}`}
                      </td>
                      <td className="py-3.5 px-4 text-gray-900">
                        {po.supplier?.name || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {formatDate(po.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-center text-gray-600">
                        {po.items?.length || 0}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-gray-900">
                        {formatCurrency(po.total)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge variant={paymentStatusVariant(po.status)}>
                          {statusLabel(po.status)}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setViewingPO(po)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-primary hover:bg-primary-50 transition-colors"
                            title="View Purchase Order"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            title="Print Purchase Order"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredPurchases.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-12 text-center text-gray-400"
                      >
                        <Search className="w-8 h-8 mx-auto mb-2" />
                        <p className="font-medium">No purchase orders found</p>
                        <p className="text-sm mt-1">
                          Try adjusting your search or date filter
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

      {/* ──── View PO Modal ──── */}
      {viewingPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setViewingPO(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setViewingPO(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="bg-primary px-6 py-5 rounded-t-2xl text-white">
              <h2 className="text-xl font-bold">
                {viewingPO.invoiceNo || `PO-${viewingPO.id}`}
              </h2>
              <p className="text-primary-100 text-sm mt-1">
                Purchase Order Details
              </p>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Supplier</p>
                  <p className="font-semibold text-gray-900">
                    {viewingPO.supplier?.name || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(viewingPO.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Total Items</p>
                  <p className="font-semibold text-gray-900">
                    {viewingPO.items?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <Badge variant={paymentStatusVariant(viewingPO.status)}>
                    {statusLabel(viewingPO.status)}
                  </Badge>
                </div>
              </div>

              {/* ── Item breakdown ── */}
              {viewingPO.items && viewingPO.items.length > 0 && (
                <>
                  <hr className="border-gray-200" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Items
                    </h3>
                    <div className="space-y-2">
                      {viewingPO.items.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.medicine?.name || `Item ${idx + 1}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity}
                              {item.batchNo ? ` | Batch: ${item.batchNo}` : ''}
                            </p>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(
                              (Number(item.quantity) || 0) *
                                (Number(item.purchasePrice) || 0)
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <hr className="border-gray-200" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">
                  Total Amount
                </span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(viewingPO.total)}
                </span>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl">
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => setViewingPO(null)}
              >
                <X className="w-4 h-4" />
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ──── Create Purchase Order Modal ──── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-lg font-semibold text-gray-900">
                Create Purchase Order
              </h2>
              <button
                onClick={closeModal}
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

              {/* Supplier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Supplier
                  </label>
                  <select
                    value={poSupplier}
                    onChange={(e) => setPOSupplier(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  >
                    <option value="">Select a supplier</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Order Items
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
                          Medicine
                        </th>
                        <th className="text-left py-2.5 px-3 font-medium text-gray-500">
                          Batch #
                        </th>
                        <th className="text-left py-2.5 px-3 font-medium text-gray-500 w-24">
                          Qty
                        </th>
                        <th className="text-left py-2.5 px-3 font-medium text-gray-500 w-28">
                          Price
                        </th>
                        <th className="text-left py-2.5 px-3 font-medium text-gray-500">
                          Expiry
                        </th>
                        <th className="text-right py-2.5 px-3 font-medium text-gray-500 w-28">
                          Subtotal
                        </th>
                        <th className="py-2.5 px-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {poItems.map((item, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-100 last:border-b-0"
                        >
                          <td className="py-2 px-3">
                            <select
                              value={item.medicineId}
                              onChange={(e) =>
                                updateItem(index, 'medicineId', e.target.value)
                              }
                              className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none"
                            >
                              <option value="">Select medicine</option>
                              {medicines.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name}
                                </option>
                              ))}
                            </select>
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
                              value={item.purchasePrice}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  'purchasePrice',
                                  e.target.value
                                )
                              }
                              className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="date"
                              value={item.expiryDate}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  'expiryDate',
                                  e.target.value
                                )
                              }
                              className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-gray-900">
                            {formatCurrency(itemSubtotal(item))}
                          </td>
                          <td className="py-2 px-3">
                            {poItems.length > 1 && (
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
                      Total Amount:
                    </span>
                    <span className="text-xl font-bold text-primary">
                      {formatCurrency(poTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl sticky bottom-0">
              <Button variant="secondary" size="md" onClick={closeModal} disabled={saving}>
                Cancel
              </Button>
              <Button variant="primary" size="md" onClick={handleSavePO} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Purchase Order'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
