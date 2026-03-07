import { useState, useEffect } from 'react'
import {
  Building2,
  Plus,
  Edit,
  X,
  Check,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Users,
  Pill,
  Star,
  Power,
  FileText,
} from 'lucide-react'
import Card, { CardHeader, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import useBranchStore from '../../store/branchStore'

// ─── Branches Page ─────────────────────────────────────────────────────────

export default function BranchesPage() {
  const { branches, loading, fetchBranches, createBranch, updateBranch, toggleBranch } =
    useBranchStore()

  const [showModal, setShowModal] = useState(false)
  const [editingBranch, setEditingBranch] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    license: '',
  })

  useEffect(() => {
    fetchBranches()
  }, [fetchBranches])

  // ── Modal Helpers ──────────────────────────────────────────────────────

  const openAddModal = () => {
    setEditingBranch(null)
    setErrorMsg(null)
    setForm({ name: '', phone: '', email: '', address: '', license: '' })
    setShowModal(true)
  }

  const openEditModal = (branch) => {
    setEditingBranch(branch)
    setErrorMsg(null)
    setForm({
      name: branch.name || '',
      phone: branch.phone || '',
      email: branch.email || '',
      address: branch.address || '',
      license: branch.license || '',
    })
    setShowModal(true)
  }

  const handleFormChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setErrorMsg(null)
    try {
      if (editingBranch) {
        await updateBranch(editingBranch.id, form)
        setSuccessMsg('Branch updated successfully.')
      } else {
        await createBranch(form)
        setSuccessMsg('Branch created successfully.')
      }
      setShowModal(false)
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message || 'Failed to save branch. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (branch) => {
    if (branch.isMain) return
    setToggling(branch.id)
    try {
      await toggleBranch(branch.id)
      setSuccessMsg(
        `Branch "${branch.name}" ${branch.active ? 'deactivated' : 'activated'} successfully.`
      )
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      setSuccessMsg(null)
      setErrorMsg(
        err?.response?.data?.message || 'Failed to toggle branch status.'
      )
      setTimeout(() => setErrorMsg(null), 3000)
    } finally {
      setToggling(null)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branch Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your organization's pharmacy branches.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={openAddModal}>
          <Plus className="w-4 h-4" />
          Add Branch
        </Button>
      </div>

      {/* Success / Error Banners */}
      {successMsg && (
        <div className="px-4 py-3 rounded-lg text-sm font-medium bg-green-50 text-green-700 border border-green-200">
          {successMsg}
        </div>
      )}
      {errorMsg && !showModal && (
        <div className="px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">
          {errorMsg}
        </div>
      )}

      {/* Branch Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-gray-500">Loading branches...</span>
        </div>
      ) : branches.length === 0 ? (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Building2 className="w-10 h-10 mb-2" />
              <p className="text-sm">No branches found. Add your first branch.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <Card key={branch.id} className="relative">
              {/* Card Header */}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-100">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-gray-900">
                          {branch.name}
                        </h3>
                        {branch.isMain && (
                          <Badge variant="primary">
                            <Star className="w-3 h-3 mr-1" />
                            Main
                          </Badge>
                        )}
                      </div>
                      <Badge variant={branch.active ? 'success' : 'danger'} className="mt-1">
                        {branch.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              {/* Card Body */}
              <CardContent>
                <div className="space-y-3">
                  {/* Contact Info */}
                  {branch.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{branch.phone}</span>
                    </div>
                  )}
                  {branch.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{branch.email}</span>
                    </div>
                  )}
                  {branch.address && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span>{branch.address}</span>
                    </div>
                  )}
                  {branch.license && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>License: {branch.license}</span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{branch._count?.users ?? 0}</span>
                      <span className="text-gray-400">users</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Pill className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{branch._count?.medicines ?? 0}</span>
                      <span className="text-gray-400">medicines</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openEditModal(branch)}
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant={branch.active ? 'danger' : 'accent'}
                      size="sm"
                      onClick={() => handleToggle(branch)}
                      disabled={branch.isMain || toggling === branch.id}
                      title={
                        branch.isMain
                          ? 'Main branch cannot be deactivated'
                          : branch.active
                            ? 'Deactivate branch'
                            : 'Activate branch'
                      }
                    >
                      {toggling === branch.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Power className="w-3.5 h-3.5" />
                      )}
                      {branch.active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Branch Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-0">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingBranch ? 'Edit Branch' : 'Add New Branch'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Error Message */}
              {errorMsg && (
                <div className="px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">
                  {errorMsg}
                </div>
              )}

              <Input
                label="Branch Name"
                value={form.name}
                onChange={handleFormChange('name')}
                placeholder="Enter branch name"
              />
              <Input
                label="Phone"
                type="tel"
                value={form.phone}
                onChange={handleFormChange('phone')}
                placeholder="Enter phone number"
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={handleFormChange('email')}
                placeholder="Enter email address"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                <textarea
                  value={form.address}
                  onChange={handleFormChange('address')}
                  placeholder="Enter branch address"
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
                />
              </div>
              <Input
                label="License Number"
                value={form.license}
                onChange={handleFormChange('license')}
                placeholder="Enter pharmacy license number"
              />
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <Button variant="secondary" size="md" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : editingBranch ? (
                  <>
                    <Check className="w-4 h-4" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Branch
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
