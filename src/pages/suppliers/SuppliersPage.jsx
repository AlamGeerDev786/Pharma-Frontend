import { useState, useEffect } from 'react'
import Card, { CardHeader, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { cn, formatCurrency } from '@/lib/utils'
import { Plus, Search, Edit, Trash2, X, Phone, Mail, MapPin, Loader2 } from 'lucide-react'
import useSupplierStore from '../../store/supplierStore'

const EMPTY_FORM = {
  name: '',
  phone: '',
  email: '',
  address: '',
}

// ─── Suppliers Page ──────────────────────────────────────────────────────────

export default function SuppliersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const { suppliers, loading, fetchSuppliers, createSupplier, updateSupplier, deleteSupplier } =
    useSupplierStore()

  // ── Fetch on mount ──────────────────────────────────────────────────────
  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  // ── Debounced search ────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchSuppliers({ search: searchQuery })
      } else {
        fetchSuppliers()
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [searchQuery, fetchSuppliers])

  // ── Helpers to map API supplier fields for display ──────────────────────
  const getDisplayStatus = (supplier) => {
    if (typeof supplier.isActive === 'boolean') {
      return supplier.isActive ? 'Active' : 'Inactive'
    }
    return supplier.status || 'Active'
  }

  // ── Modal handlers ─────────────────────────────────────────────────────
  const openAddModal = () => {
    setEditingSupplier(null)
    setFormData(EMPTY_FORM)
    setSaveError(null)
    setShowModal(true)
  }

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier)
    setFormData({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
    })
    setSaveError(null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingSupplier(null)
    setFormData(EMPTY_FORM)
    setSaveError(null)
  }

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, formData)
      } else {
        await createSupplier(formData)
      }
      closeModal()
    } catch (err) {
      setSaveError(
        err.response?.data?.error ||
          err.message ||
          'Something went wrong. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return
    try {
      await deleteSupplier(id)
    } catch (err) {
      alert(
        err.response?.data?.error ||
          err.message ||
          'Failed to delete supplier.'
      )
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ──── Top Bar ──── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your pharmaceutical suppliers and distributors
          </p>
        </div>
        <Button variant="primary" size="md" onClick={openAddModal}>
          <Plus className="w-4 h-4" />
          Add Supplier
        </Button>
      </div>

      {/* ──── Supplier Table ──── */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              All Suppliers
            </h2>
            <div className="w-full sm:w-72">
              <Input
                icon={Search}
                placeholder="Search suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="ml-3 text-sm text-gray-500">Loading suppliers...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-6 font-medium text-gray-500">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">
                      Phone
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">
                      Address
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">
                      Total Purchases
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">
                      Outstanding
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
                  {suppliers.map((supplier) => {
                    const displayStatus = getDisplayStatus(supplier)
                    return (
                      <tr
                        key={supplier.id}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-3.5 px-6">
                          <p className="font-medium text-gray-900">
                            {supplier.name}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {supplier.phone}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {supplier.email}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-gray-500 max-w-[200px]">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="truncate">{supplier.address}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-gray-900">
                          {formatCurrency(supplier.totalPurchases ?? 0)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span
                            className={cn(
                              'font-semibold',
                              (supplier.outstandingBalance ?? 0) > 0
                                ? 'text-warning-600'
                                : 'text-accent'
                            )}
                          >
                            {formatCurrency(supplier.outstandingBalance ?? 0)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Badge
                            variant={
                              displayStatus === 'Active' ? 'success' : 'default'
                            }
                          >
                            {displayStatus}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-6">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEditModal(supplier)}
                              className="p-1.5 rounded-md text-gray-400 hover:text-primary hover:bg-primary-50 transition-colors"
                              title="Edit Supplier"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(supplier.id)}
                              className="p-1.5 rounded-md text-gray-400 hover:text-danger hover:bg-danger-50 transition-colors"
                              title="Delete Supplier"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {suppliers.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-12 text-center text-gray-400"
                      >
                        <Search className="w-8 h-8 mx-auto mb-2" />
                        <p className="font-medium">No suppliers found</p>
                        <p className="text-sm mt-1">
                          Try adjusting your search query
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

      {/* ──── Add / Edit Supplier Modal ──── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </h2>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-5 space-y-4">
              {saveError && (
                <div className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
                  {saveError}
                </div>
              )}
              <Input
                label="Supplier Name"
                placeholder="e.g. MedLine Pharmaceuticals"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
              />
              <Input
                label="Phone Number"
                icon={Phone}
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
              />
              <Input
                label="Email Address"
                icon={Mail}
                type="email"
                placeholder="contact@supplier.com"
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
              />
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Address
                </label>
                <textarea
                  placeholder="Full supplier address..."
                  rows={3}
                  value={formData.address}
                  onChange={(e) => handleFormChange('address', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <Button variant="secondary" size="md" onClick={closeModal} disabled={saving}>
                Cancel
              </Button>
              <Button variant="primary" size="md" onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingSupplier ? 'Update Supplier' : 'Save Supplier'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
