import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Package,
  ChevronLeft,
  Loader2,
} from 'lucide-react'
import Card, { CardHeader, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { formatCurrency, formatDate } from '@/lib/utils'
import { canEdit } from '@/lib/permissions'
import useAuthStore from '../../store/authStore'
import useMedicineStore from '../../store/medicineStore'
import useSupplierStore from '../../store/supplierStore'

const ITEMS_PER_PAGE = 5

const batchStatusVariant = {
  active: 'success',
  expiring: 'warning',
  expired: 'danger',
}

export default function MedicinesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [supplierFilter, setSupplierFilter] = useState('All')
  const [expandedRow, setExpandedRow] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  const { user } = useAuthStore()
  const isReadOnly = !canEdit(user?.role, '/dashboard/medicines')

  const {
    medicines,
    categories,
    pagination,
    loading,
    fetchMedicines,
    fetchCategories,
    deleteMedicine,
  } = useMedicineStore()

  const { suppliers, fetchSuppliers } = useSupplierStore()

  // Build dynamic filter lists
  const categoryList = ['All', ...categories.map((c) => c.name)]
  const supplierList = ['All', ...suppliers.map((s) => s.name)]

  // Fetch categories and suppliers once on mount
  useEffect(() => {
    fetchCategories()
    fetchSuppliers()
  }, [fetchCategories, fetchSuppliers])

  // Fetch medicines whenever search, category filter, or page changes
  const loadMedicines = useCallback(() => {
    const params = {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    }
    if (searchQuery.trim()) {
      params.search = searchQuery.trim()
    }
    if (categoryFilter !== 'All') {
      params.category = categoryFilter
    }
    if (supplierFilter !== 'All') {
      params.supplier = supplierFilter
    }
    fetchMedicines(params)
  }, [currentPage, searchQuery, categoryFilter, supplierFilter, fetchMedicines])

  useEffect(() => {
    loadMedicines()
  }, [loadMedicines])

  // Pagination values from server
  const totalItems = pagination?.total || 0
  const totalPages = pagination?.pages || 1
  const serverPage = pagination?.page || currentPage
  const startIdx = (serverPage - 1) * ITEMS_PER_PAGE

  const handleToggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      setExpandedRow(null)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return
    }
    try {
      await deleteMedicine(id)
      // Reload current page after deletion
      loadMedicines()
    } catch {
      // Error is set in the store
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medicines</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your medicine inventory and batch details
          </p>
        </div>
        {!isReadOnly && (
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm">
              <Package className="w-4 h-4" />
              Export
            </Button>
            <Link to="/dashboard/medicines/add">
              <Button size="sm">
                <Plus className="w-4 h-4" />
                Add Medicine
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by name, generic name, or barcode..."
            icon={Search}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="appearance-none rounded-lg border border-gray-300 bg-white pl-10 pr-8 py-2.5 text-sm text-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200"
            >
              {categoryList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={supplierFilter}
              onChange={(e) => {
                setSupplierFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="appearance-none rounded-lg border border-gray-300 bg-white pl-4 pr-8 py-2.5 text-sm text-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200"
            >
              {supplierList.map((sup) => (
                <option key={sup} value={sup}>
                  {sup === 'All' ? 'All Suppliers' : sup}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Medicine Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Medicine Inventory</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {totalItems} medicine{totalItems !== 1 ? 's' : ''} found
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="ml-3 text-sm text-gray-500">Loading medicines...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 w-8" />
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      Medicine Name
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      Category
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      Barcode
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      Total Stock
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      Reorder Level
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      Price Range
                    </th>
                    {!isReadOnly && (
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {medicines.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm font-medium text-gray-500">No medicines found</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Try adjusting your search or filter criteria
                        </p>
                      </td>
                    </tr>
                  ) : (
                    medicines.map((med) => (
                      <MedicineRow
                        key={med.id}
                        medicine={med}
                        isExpanded={expandedRow === med.id}
                        onToggle={() => handleToggleRow(med.id)}
                        onDelete={() => handleDelete(med.id, med.name)}
                        isReadOnly={isReadOnly}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing {startIdx + 1} to{' '}
                {Math.min(startIdx + ITEMS_PER_PAGE, totalItems)} of{' '}
                {totalItems} medicines
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      page === currentPage
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function MedicineRow({ medicine, isExpanded, onToggle, onDelete, isReadOnly }) {
  // Derive values from API data shape
  const categoryName = medicine.category?.name || medicine.category || '-'
  const totalStock = medicine.totalStock ?? 0
  const reorderLevel = medicine.reorderLevel ?? 0
  const batches = medicine.batches || []

  // Compute price range from batches
  const prices = batches.map((b) => b.sellingPrice).filter(Boolean)
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0

  const isLowStock = totalStock < reorderLevel || totalStock < 200

  return (
    <>
      <tr
        onClick={onToggle}
        className="hover:bg-gray-50/50 cursor-pointer transition-colors"
      >
        <td className="px-6 py-4">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </td>
        <td className="px-6 py-4">
          <div>
            <p className="text-sm font-medium text-gray-900">{medicine.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{medicine.genericName}</p>
          </div>
        </td>
        <td className="px-6 py-4">
          <Badge variant="primary">{categoryName}</Badge>
        </td>
        <td className="px-6 py-4">
          <span className="text-sm text-gray-600 font-mono">{medicine.barcode || '-'}</span>
        </td>
        <td className="px-6 py-4">
          <span
            className={`text-sm font-semibold ${
              isLowStock ? 'text-danger' : 'text-gray-900'
            }`}
          >
            {totalStock.toLocaleString()}
          </span>
        </td>
        <td className="px-6 py-4">
          <span className="text-sm text-gray-700">{reorderLevel}</span>
        </td>
        <td className="px-6 py-4">
          <span className="text-sm text-gray-700">
            {prices.length > 0
              ? `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`
              : '-'}
          </span>
        </td>
        {!isReadOnly && (
          <td className="px-6 py-4">
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <Link to={`/dashboard/medicines/edit/${medicine.id}`}>
                <Button variant="ghost" size="sm" className="px-2">
                  <Edit className="w-4 h-4 text-gray-500" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="px-2 text-danger hover:bg-danger-50"
                onClick={onDelete}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </td>
        )}
      </tr>

      {/* Expanded Batch Details */}
      {isExpanded && (
        <tr>
          <td colSpan={8} className="bg-gray-50/80 px-6 py-4">
            <div className="ml-8">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Batch Details
              </h4>
              {batches.length === 0 ? (
                <p className="text-sm text-gray-400">No batches recorded for this medicine.</p>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left text-xs font-medium text-gray-500 px-4 py-2.5">
                          Batch #
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 px-4 py-2.5">
                          Expiry Date
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 px-4 py-2.5">
                          Purchase Price
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 px-4 py-2.5">
                          Selling Price
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 px-4 py-2.5">
                          Quantity
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 px-4 py-2.5">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {batches.map((batch) => (
                        <tr key={batch.batchNo} className="hover:bg-gray-50/50">
                          <td className="px-4 py-2.5 text-sm font-mono text-gray-700">
                            {batch.batchNo}
                          </td>
                          <td className="px-4 py-2.5 text-sm text-gray-600">
                            {formatDate(batch.expiryDate)}
                          </td>
                          <td className="px-4 py-2.5 text-sm text-gray-600">
                            {formatCurrency(batch.purchasePrice)}
                          </td>
                          <td className="px-4 py-2.5 text-sm font-medium text-gray-900">
                            {formatCurrency(batch.sellingPrice)}
                          </td>
                          <td className="px-4 py-2.5 text-sm text-gray-700">{batch.quantity}</td>
                          <td className="px-4 py-2.5">
                            <Badge variant={batchStatusVariant[batch.status] || 'default'}>
                              {batch.status
                                ? batch.status.charAt(0).toUpperCase() + batch.status.slice(1)
                                : '-'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
