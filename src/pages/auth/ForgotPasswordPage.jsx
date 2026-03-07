import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Pill, Send } from 'lucide-react'
import api from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Pill className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">PharmaCare</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">
          {!submitted ? (
            <>
              {/* Icon */}
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mail className="w-7 h-7 text-primary" />
              </div>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot your password?</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  No worries. Enter the email address associated with your account and we'll send you a link to reset your password.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-5">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@pharmacy.com"
                      required
                      className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <>
              <div className="w-14 h-14 bg-accent-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mail className="w-7 h-7 text-accent" />
              </div>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="text-primary hover:text-primary-dark font-medium transition-colors"
                  >
                    try again
                  </button>
                </p>
              </div>
            </>
          )}

          {/* Back to Login */}
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors mt-6 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Back to Sign In
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Need help?{' '}
          <a href="#" className="text-primary hover:text-primary-dark font-medium transition-colors">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  )
}
