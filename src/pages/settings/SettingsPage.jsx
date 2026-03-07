import { useState, useEffect } from 'react'
import {
  Building2,
  Users,
  CreditCard,
  Upload,
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  Crown,
  Shield,
  Loader2,
} from 'lucide-react'
import Card, { CardHeader, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { cn, formatCurrency } from '@/lib/utils'
import useSettingsStore from '../../store/settingsStore'
import useAuthStore from '../../store/authStore'

// ─── Role Mapping Helpers ────────────────────────────────────────────────────

const roleToDisplay = {
  ORG_ADMIN: 'Organization Admin',
  ADMIN: 'Branch Admin',
  PHARMACIST: 'Pharmacist',
  CASHIER: 'Cashier',
}

// ─── Static Data (billing not wired to API yet) ─────────────────────────────

const billingHistory = [
  { date: '2026-02-01', description: 'Pro Plan - Monthly', amount: 49.0, status: 'Paid', invoice: 'INV-2026-002' },
  { date: '2026-01-01', description: 'Pro Plan - Monthly', amount: 49.0, status: 'Paid', invoice: 'INV-2026-001' },
  { date: '2025-12-01', description: 'Pro Plan - Monthly', amount: 49.0, status: 'Paid', invoice: 'INV-2025-012' },
  { date: '2025-11-01', description: 'Pro Plan - Monthly', amount: 49.0, status: 'Paid', invoice: 'INV-2025-011' },
  { date: '2025-10-01', description: 'Plan Upgrade (Basic to Pro)', amount: 49.0, status: 'Paid', invoice: 'INV-2025-010' },
]

const plans = [
  {
    name: 'Basic',
    price: '$19',
    period: '/month',
    description: 'For small pharmacies getting started',
    features: [
      'Up to 3 users',
      '500 medicine entries',
      '5 GB storage',
      'Basic reports',
      'Email support',
    ],
    current: false,
    buttonText: 'Downgrade',
    buttonVariant: 'secondary',
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'For growing pharmacies that need more',
    features: [
      'Up to 10 users',
      'Unlimited medicines',
      '10 GB storage',
      'Advanced reports & analytics',
      'Priority support',
      'API access',
      'Multi-branch support',
    ],
    current: true,
    buttonText: 'Current Plan',
    buttonVariant: 'primary',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large pharmacy chains and networks',
    features: [
      'Unlimited users',
      'Unlimited medicines',
      'Unlimited storage',
      'Custom reports',
      'Dedicated support',
      'Full API access',
      'Multi-branch support',
      'Custom integrations',
      'SLA guarantee',
    ],
    current: false,
    buttonText: 'Contact Sales',
    buttonVariant: 'outline',
  },
]

// ─── Tab Configuration ──────────────────────────────────────────────────────

const tabs = [
  { id: 'profile', label: 'Pharmacy Profile', icon: Building2 },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'subscription', label: 'Subscription', icon: CreditCard },
]

// ─── Settings Page ──────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your pharmacy profile, team members, and subscription.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && <PharmacyProfileTab />}
      {activeTab === 'users' && <UserManagementTab />}
      {activeTab === 'subscription' && <SubscriptionTab />}
    </div>
  )
}

// ─── Pharmacy Profile Tab ───────────────────────────────────────────────────

function PharmacyProfileTab() {
  const { tenant } = useAuthStore()
  const { updatePharmacy } = useSettingsStore()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const [form, setForm] = useState({
    name: tenant?.name || '',
    email: tenant?.email || '',
    phone: tenant?.phone || '',
    address: tenant?.address || '',
    city: '',
    state: '',
    zipCode: '',
  })

  // Sync form if tenant data loads after initial render
  useEffect(() => {
    if (tenant) {
      setForm((prev) => ({
        ...prev,
        name: tenant.name || prev.name,
        email: tenant.email || prev.email,
        phone: tenant.phone || prev.phone,
        address: tenant.address || prev.address,
      }))
    }
  }, [tenant])

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      await updatePharmacy(form)
      setMessage({ type: 'success', text: 'Pharmacy profile updated successfully.' })
    } catch (err) {
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to update pharmacy profile. Please try again.',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Message Banner */}
      {message && (
        <div
          className={cn(
            'px-4 py-3 rounded-lg text-sm font-medium',
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          )}
        >
          {message.text}
        </div>
      )}

      {/* Logo Upload */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Pharmacy Logo</h2>
          <p className="text-sm text-gray-500 mt-0.5">Upload your pharmacy logo for branding</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-primary transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-xs text-gray-500 text-center px-2">Click to browse</span>
            </div>
            <div>
              <p className="text-sm text-gray-700 font-medium">Upload a logo</p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, or SVG. Max file size 2MB. Recommended size 200x200px.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Pharmacy Information</h2>
          <p className="text-sm text-gray-500 mt-0.5">Update your pharmacy details</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Pharmacy Name"
              value={form.name}
              onChange={handleChange('name')}
              placeholder="Enter pharmacy name"
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              placeholder="Enter email address"
            />
            <Input
              label="Phone"
              type="tel"
              value={form.phone}
              onChange={handleChange('phone')}
              placeholder="Enter phone number"
            />
            <Input
              label="City"
              value={form.city}
              onChange={handleChange('city')}
              placeholder="Enter city"
            />
            <Input
              label="State"
              value={form.state}
              onChange={handleChange('state')}
              placeholder="Enter state"
            />
            <Input
              label="Zip Code"
              value={form.zipCode}
              onChange={handleChange('zipCode')}
              placeholder="Enter zip code"
            />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
              <textarea
                value={form.address}
                onChange={handleChange('address')}
                placeholder="Enter full address"
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button variant="primary" size="md" onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── User Management Tab ────────────────────────────────────────────────────

function UserManagementTab() {
  const { users, loading, fetchUsers, createUser, updateUser } = useSettingsStore()
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [savingUser, setSavingUser] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'PHARMACIST',
    isActive: true,
  })

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const openAddModal = () => {
    setEditingUser(null)
    setErrorMsg(null)
    setUserForm({ name: '', email: '', password: '', role: 'PHARMACIST', isActive: true })
    setShowUserModal(true)
  }

  const openEditModal = (user) => {
    setEditingUser(user)
    setErrorMsg(null)
    setUserForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      isActive: user.isActive,
    })
    setShowUserModal(true)
  }

  const handleSaveUser = async () => {
    setSavingUser(true)
    setErrorMsg(null)
    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          name: userForm.name,
          email: userForm.email,
          role: userForm.role,
          isActive: userForm.isActive,
        })
      } else {
        await createUser({
          name: userForm.name,
          email: userForm.email,
          password: userForm.password,
          role: userForm.role,
        })
      }
      setShowUserModal(false)
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message || 'Failed to save user. Please try again.'
      )
    } finally {
      setSavingUser(false)
    }
  }

  const handleFormChange = (field) => (e) => {
    setUserForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'ORG_ADMIN':
        return 'primary'
      case 'ADMIN':
        return 'primary'
      case 'PHARMACIST':
        return 'success'
      case 'CASHIER':
        return 'warning'
      default:
        return 'default'
    }
  }

  const formatLastLogin = (dateStr) => {
    if (!dateStr) return 'Never'
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
              <p className="text-sm text-gray-500 mt-0.5">Manage your pharmacy staff and their roles</p>
            </div>
            <Button variant="primary" size="md" onClick={openAddModal}>
              <Plus className="w-4 h-4" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-gray-500">Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Users className="w-10 h-10 mb-2" />
              <p className="text-sm">No team members found. Add your first user.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left font-medium text-gray-500 px-6 py-3">Name</th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">Email</th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">Role</th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">Status</th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">Last Login</th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-xs font-semibold text-primary">
                              {user.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-gray-600">{user.email}</td>
                      <td className="px-6 py-3.5">
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {roleToDisplay[user.role] || user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge variant={user.isActive ? 'success' : 'danger'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5 text-gray-500 text-xs">
                        {formatLastLogin(user.lastLoginAt)}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors"
                            title="Edit user"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            disabled
                            className="p-1.5 text-gray-300 rounded-lg cursor-not-allowed"
                            title="Delete not available"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowUserModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-0">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
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
                label="Full Name"
                value={userForm.name}
                onChange={handleFormChange('name')}
                placeholder="Enter full name"
              />
              <Input
                label="Email"
                type="email"
                value={userForm.email}
                onChange={handleFormChange('email')}
                placeholder="Enter email address"
              />
              {!editingUser && (
                <Input
                  label="Password"
                  type="password"
                  value={userForm.password}
                  onChange={handleFormChange('password')}
                  placeholder="Enter password"
                />
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                <select
                  value={userForm.role}
                  onChange={handleFormChange('role')}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                >
                  <option value="PHARMACIST">Pharmacist</option>
                  <option value="CASHIER">Cashier</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Active Status</label>
                <button
                  type="button"
                  onClick={() =>
                    setUserForm((prev) => ({ ...prev, isActive: !prev.isActive }))
                  }
                  className={cn(
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
                    userForm.isActive ? 'bg-primary' : 'bg-gray-300'
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200',
                      userForm.isActive ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <Button variant="secondary" size="md" onClick={() => setShowUserModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" onClick={handleSaveUser} disabled={savingUser}>
                {savingUser ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingUser ? 'Save Changes' : 'Add User'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Subscription Tab ───────────────────────────────────────────────────────

function SubscriptionTab() {
  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
          <p className="text-sm text-gray-500 mt-0.5">Your active subscription details</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-gray-900">Pro Plan</h3>
                  <Badge variant="success">Active</Badge>
                </div>
                <p className="text-sm text-gray-500">$49.00 / month</p>
              </div>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm text-gray-500">Next renewal</p>
              <p className="text-sm font-semibold text-gray-900">March 1, 2026</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Usage</h2>
          <p className="text-sm text-gray-500 mt-0.5">Your current plan usage</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Users */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Users</span>
                <span className="text-sm text-gray-500">3 of 10</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: '30%' }}
                />
              </div>
            </div>
            {/* Medicines */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Medicines</span>
                <span className="text-sm text-gray-500">847 of Unlimited</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-500"
                  style={{ width: '15%' }}
                />
              </div>
            </div>
            {/* Storage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Storage</span>
                <span className="text-sm text-gray-500">2.1 GB of 10 GB</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-warning rounded-full transition-all duration-500"
                  style={{ width: '21%' }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                'relative',
                plan.current && 'ring-2 ring-primary border-primary'
              )}
            >
              {plan.current && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="primary" className="px-3 py-1">
                    <Shield className="w-3 h-3 mr-1" />
                    Current Plan
                  </Badge>
                </div>
              )}
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-sm text-gray-500">{plan.period}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-accent-500 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.buttonVariant}
                  size="md"
                  className="w-full"
                  disabled={plan.current}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Billing History</h2>
          <p className="text-sm text-gray-500 mt-0.5">Recent invoices and payments</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left font-medium text-gray-500 px-6 py-3">Date</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-3">Description</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-3">Amount</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-3">Status</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-3">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {billingHistory.map((row) => (
                  <tr key={row.invoice} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3.5 text-gray-600">{row.date}</td>
                    <td className="px-6 py-3.5 font-medium text-gray-900">{row.description}</td>
                    <td className="px-6 py-3.5 font-medium text-gray-900">
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge variant="success">{row.status}</Badge>
                    </td>
                    <td className="px-6 py-3.5">
                      <button className="text-primary hover:text-primary-700 font-medium text-sm transition-colors">
                        {row.invoice}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
