import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from 'lucide-react'
import Card, { CardHeader, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import useMedicineStore from '../../store/medicineStore'
import useSupplierStore from '../../store/supplierStore'

const createEmptyBatch = () => ({
  id: Date.now(),
  batchNumber: '',
  expiryDate: '',
  purchasePrice: '',
  sellingPrice: '',
  quantity: '',
})

export default function AddMedicinePage() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()

  const { categories, fetchCategories, createMedicine, updateMedicine } = useMedicineStore()
  const { suppliers, fetchSuppliers } = useSupplierStore()

  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    categoryId: '',
    description: '',
    barcode: '',
    supplierId: '',
    reorderLevel: '',
  })

  const [batches, setBatches] = useState([createEmptyBatch()])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCategories()
    fetchSuppliers()
  }, [fetchCategories, fetchSuppliers])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleBatchChange = (batchId, field, value) => {
    setBatches((prev) =>
      prev.map((batch) => (batch.id === batchId ? { ...batch, [field]: value } : batch))
    )
  }

  const handleAddBatch = () => {
    setBatches((prev) => [...prev, createEmptyBatch()])
  }

  const handleRemoveBatch = (batchId) => {
    if (batches.length === 1) return
    setBatches((prev) => prev.filter((batch) => batch.id !== batchId))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload = {
        name: formData.name,
        genericName: formData.genericName,
        categoryId: formData.categoryId,
        description: formData.description,
        barcode: formData.barcode,
        ...(formData.supplierId && { supplierId: formData.supplierId }),
        reorderLevel: Number(formData.reorderLevel),
        batches: batches.map((b) => ({
          batchNo: b.batchNumber,
          expiryDate: b.expiryDate,
          purchasePrice: Number(b.purchasePrice),
          sellingPrice: Number(b.sellingPrice),
          quantity: Number(b.quantity),
        })),
      }

      if (isEditing) {
        await updateMedicine(id, payload)
      } else {
        await createMedicine(payload)
      }

      navigate('/dashboard/medicines')
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          `Failed to ${isEditing ? 'update' : 'create'} medicine`
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard/medicines">
          <Button variant="ghost" size="sm" className="px-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Medicine' : 'Add New Medicine'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEditing
              ? 'Update medicine details and batch information'
              : 'Fill in the details below to add a new medicine to inventory'}
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Medicine Details Form */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Medicine Details</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Basic information about the medicine
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-5">
              {/* Left Column */}
              <div className="space-y-5">
                <Input
                  label="Medicine Name"
                  name="name"
                  placeholder="e.g. Paracetamol 500mg"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />

                <Input
                  label="Generic Name"
                  name="genericName"
                  placeholder="e.g. Acetaminophen"
                  value={formData.genericName}
                  onChange={handleInputChange}
                  required
                />

                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    name="description"
                    placeholder="Enter medicine description, usage instructions, or notes..."
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-5">
                <Input
                  label="Barcode"
                  name="barcode"
                  placeholder="e.g. 8901234567890"
                  value={formData.barcode}
                  onChange={handleInputChange}
                />

                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Supplier
                  </label>
                  <select
                    name="supplierId"
                    value={formData.supplierId}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  >
                    <option value="" disabled>
                      Select a supplier
                    </option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Reorder Level"
                  name="reorderLevel"
                  type="number"
                  placeholder="e.g. 100"
                  min="0"
                  value={formData.reorderLevel}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Batch Information Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Batch Information</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Add batch details for stock tracking and expiry management
              </p>
            </div>
            <Button type="button" variant="accent" size="sm" onClick={handleAddBatch}>
              <Plus className="w-4 h-4" />
              Add Batch
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      Batch Number
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      Expiry Date
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      Purchase Price
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      Selling Price
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      Quantity
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 w-16">
                      Remove
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {batches.map((batch, index) => (
                    <tr key={batch.id} className="hover:bg-gray-50/30">
                      <td className="px-6 py-3">
                        <input
                          type="text"
                          placeholder={`BT-${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`}
                          value={batch.batchNumber}
                          onChange={(e) =>
                            handleBatchChange(batch.id, 'batchNumber', e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200"
                        />
                      </td>
                      <td className="px-6 py-3">
                        <input
                          type="date"
                          value={batch.expiryDate}
                          onChange={(e) =>
                            handleBatchChange(batch.id, 'expiryDate', e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200"
                        />
                      </td>
                      <td className="px-6 py-3">
                        <input
                          type="number"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          value={batch.purchasePrice}
                          onChange={(e) =>
                            handleBatchChange(batch.id, 'purchasePrice', e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200"
                        />
                      </td>
                      <td className="px-6 py-3">
                        <input
                          type="number"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          value={batch.sellingPrice}
                          onChange={(e) =>
                            handleBatchChange(batch.id, 'sellingPrice', e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200"
                        />
                      </td>
                      <td className="px-6 py-3">
                        <input
                          type="number"
                          placeholder="0"
                          min="0"
                          value={batch.quantity}
                          onChange={(e) =>
                            handleBatchChange(batch.id, 'quantity', e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200"
                        />
                      </td>
                      <td className="px-6 py-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="px-2 text-danger hover:bg-danger-50"
                          onClick={() => handleRemoveBatch(batch.id)}
                          disabled={batches.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {batches.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-gray-500">
                  No batches added. Click "Add Batch" to start adding batch information.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <Link to="/dashboard/medicines">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEditing ? 'Update Medicine' : 'Save Medicine'}
          </Button>
        </div>
      </form>
    </div>
  )
}
