import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, User, Mail, Phone, Lock, Check, Eye, EyeOff, Pill, Shield, Zap, Loader2 } from 'lucide-react'
import useAuthStore from '../../store/authStore'

const plans = [
  {
    id: 'BASIC',
    name: 'Basic',
    price: '$19',
    period: '/month',
    description: 'For small pharmacies',
    features: ['Up to 500 medicines', 'Basic reports', '1 user account'],
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'For growing pharmacies',
    features: ['Unlimited medicines', 'Advanced analytics', 'Up to 5 users'],
    popular: true,
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For pharmacy chains',
    features: ['Multi-location', 'Priority support', 'Unlimited users'],
  },
]

export default function RegisterPage() {
  const [selectedPlan, setSelectedPlan] = useState('PRO')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const register = useAuthStore((s) => s.register)

  const [formData, setFormData] = useState({
    pharmacyName: '', ownerName: '', email: '', phone: '', password: '', confirmPassword: '',
  })
  const handleChange = (field) => (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register({ pharmacyName: formData.pharmacyName, ownerName: formData.ownerName, email: formData.email, phone: formData.phone, password: formData.password, plan: selectedPlan })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden flex min-h-[700px]">

        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-primary via-primary-700 to-primary-900 p-10 flex-col justify-between relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/3 right-0 w-32 h-32 bg-accent/10 rounded-full translate-x-1/2" />

          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Pill className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">PharmaCare</span>
            </div>

            <h1 className="text-3xl font-bold text-white leading-tight mb-4">
              Start Managing
              <span className="block text-accent-light">Your Pharmacy Today</span>
            </h1>
            <p className="text-primary-200 text-sm leading-relaxed">
              Join thousands of pharmacies already using PharmaCare to streamline operations and boost revenue.
            </p>
          </div>

          {/* Benefits */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-accent-light" />
              </div>
              <span className="text-sm text-primary-100">Setup in under 5 minutes</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-accent-light" />
              </div>
              <span className="text-sm text-primary-100">14-day free trial, no card needed</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Register Form */}
        <div className="w-full lg:w-7/12 p-8 sm:p-10 lg:p-12 overflow-y-auto max-h-screen scrollbar-thin">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-6 justify-center">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">PharmaCare</span>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h2>
            <p className="text-gray-500 text-sm">Get started with your pharmacy management platform</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-danger-50 border border-danger/20 text-sm text-danger">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Pharmacy Name & Owner Name Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Pharmacy Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Building2 className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="MediCare Pharmacy"
                    value={formData.pharmacyName}
                    onChange={handleChange('pharmacyName')}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Owner Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={formData.ownerName}
                    onChange={handleChange('ownerName')}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Email & Phone Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Mail className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="you@pharmacy.com"
                    value={formData.email}
                    onChange={handleChange('email')}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Phone className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleChange('phone')}
                    className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Password & Confirm Password Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={handleChange('password')}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-11 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-11 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Plan Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose Your Plan
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`relative rounded-xl border-2 p-4 text-left transition-all duration-200 cursor-pointer ${
                      selectedPlan === plan.id
                        ? 'border-primary bg-primary-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                        Popular
                      </span>
                    )}

                    <div className="text-center">
                      <p className={`font-semibold text-sm ${
                        selectedPlan === plan.id ? 'text-primary' : 'text-gray-900'
                      }`}>
                        {plan.name}
                      </p>
                      <div className="mt-1">
                        <span className={`text-xl font-bold ${
                          selectedPlan === plan.id ? 'text-primary' : 'text-gray-900'
                        }`}>
                          {plan.price}
                        </span>
                        {plan.period && (
                          <span className="text-xs text-gray-500">{plan.period}</span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">{plan.description}</p>
                    </div>

                    {/* Features */}
                    <ul className="mt-3 space-y-1">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <Check className={`w-3 h-3 flex-shrink-0 ${
                            selectedPlan === plan.id ? 'text-accent' : 'text-gray-400'
                          }`} />
                          <span className="text-[11px] text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Selected indicator */}
                    {selectedPlan === plan.id && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Terms Checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/30 mt-0.5 cursor-pointer"
              />
              <span className="text-sm text-gray-600 leading-snug">
                I agree to the{' '}
                <a href="#" className="text-primary hover:text-primary-dark font-medium transition-colors">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary hover:text-primary-dark font-medium transition-colors">
                  Privacy Policy
                </a>
              </span>
            </label>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 shadow-sm hover:shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
