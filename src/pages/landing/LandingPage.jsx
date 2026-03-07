import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  ShoppingCart,
  Calendar,
  BarChart3,
  Users,
  Truck,
  Menu,
  X,
  Check,
  ArrowRight,
  Play,
  Shield,
  Clock,
  Phone,
  Mail,
  MapPin,
  Pill,
  Heart,
  Star,
  ChevronRight,
  Activity,
  Zap,
} from 'lucide-react'

// ─── Feature Data ────────────────────────────────────────────────
const features = [
  {
    icon: Package,
    title: 'Inventory Management',
    description:
      'Track stock levels in real-time, set reorder alerts, and manage multiple warehouses from a single dashboard.',
  },
  {
    icon: ShoppingCart,
    title: 'POS & Billing',
    description:
      'Fast point-of-sale with barcode scanning, invoice generation, and support for multiple payment methods.',
  },
  {
    icon: Calendar,
    title: 'Batch & Expiry Tracking',
    description:
      'Automatic expiry alerts, batch-wise tracking, and FEFO management to minimize waste and losses.',
  },
  {
    icon: BarChart3,
    title: 'Reports & Analytics',
    description:
      'Sales trends, profit margins, and inventory analytics with exportable reports and visual dashboards.',
  },
  {
    icon: Users,
    title: 'Multi-User Roles',
    description:
      'Role-based access for pharmacists, cashiers, managers, and admins with complete audit trails.',
  },
  {
    icon: Truck,
    title: 'Supplier Management',
    description:
      'Manage suppliers, automate purchase orders, track deliveries, and compare pricing across vendors.',
  },
]

// ─── Pricing Data ────────────────────────────────────────────────
const pricingPlans = [
  {
    name: 'Basic',
    price: '$19',
    period: '/mo',
    description: 'Perfect for small pharmacies just getting started.',
    features: [
      'Up to 1,000 products',
      '1 user account',
      'Basic POS & billing',
      'Inventory tracking',
      'Email support',
      'Monthly reports',
    ],
    cta: 'Start Free Trial',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/mo',
    description: 'Best for growing pharmacies that need more power.',
    features: [
      'Unlimited products',
      'Up to 10 users',
      'Advanced POS & billing',
      'Batch & expiry tracking',
      'Priority support',
      'Real-time analytics',
      'Supplier management',
      'API access',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For pharmacy chains and large-scale operations.',
    features: [
      'Everything in Pro',
      'Unlimited users',
      'Multi-branch support',
      'Custom integrations',
      'Dedicated account manager',
      'On-premise deployment option',
      'SLA guarantee',
      'Custom training',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
]

// ─── Navigation Links ────────────────────────────────────────────
const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact', href: '#contact' },
]

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Landing Page Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Navbar ──────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-700 rounded-lg flex items-center justify-center shadow-md">
                <Pill className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                Pharma<span className="text-primary">Care</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-gray-600 hover:text-primary transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <Link
                  to="/login"
                  className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors text-center"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors text-center"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ─── Hero Section ────────────────────────────────────────── */}
      <section className="relative pt-16 overflow-hidden">
        <div className="bg-gradient-to-br from-primary-50 via-white to-accent-50">
          {/* Decorative background elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-50/40 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                <span>Cloud-Based Pharmacy Solution</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Modern Pharmacy{' '}
                <br className="hidden sm:block" />
                Management{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-700">
                  Made Simple
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                The all-in-one cloud-based SaaS platform that helps pharmacies streamline
                operations, manage inventory, boost sales, and deliver better patient care.
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-gray-700 bg-white border-2 border-gray-200 hover:border-primary-200 hover:text-primary rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 flex items-center justify-center gap-2 text-sm text-gray-500">
                <Shield className="w-4 h-4 text-accent" />
                <span>No credit card required</span>
                <span className="mx-2 text-gray-300">|</span>
                <Clock className="w-4 h-4 text-accent" />
                <span>14-day free trial</span>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="mt-16 sm:mt-20 max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-2">
                <div className="grid grid-cols-3 divide-x divide-gray-100">
                  {[
                    { value: '500+', label: 'Pharmacies' },
                    { value: '10K+', label: 'Users' },
                    { value: '99.9%', label: 'Uptime' },
                  ].map((stat) => (
                    <div key={stat.label} className="py-4 sm:py-6 text-center">
                      <p className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</p>
                      <p className="mt-1 text-sm text-gray-500 font-medium">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features Section ────────────────────────────────────── */}
      <section id="features" className="py-20 sm:py-28 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-50 text-accent-600 rounded-full text-sm font-medium mb-4">
              <Activity className="w-4 h-4" />
              <span>Powerful Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Everything You Need to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Run Your Pharmacy
              </span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              From inventory to invoicing, PharmaCare gives you the tools to manage every aspect of
              your pharmacy with confidence.
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="group bg-white rounded-2xl border border-gray-200/80 p-7 hover:shadow-xl hover:shadow-gray-200/50 hover:border-primary-200 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-primary-50 group-hover:bg-primary-100 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Learn more</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Why PharmaCare Section ──────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left content */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-sm font-medium mb-4">
                <Heart className="w-4 h-4" />
                <span>Why PharmaCare</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                Built Specifically for{' '}
                <span className="text-primary">Pharmacies</span>
              </h2>
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                Unlike generic retail software, PharmaCare understands the unique needs of
                pharmaceutical businesses -- from drug scheduling to regulatory compliance.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  'Drug interaction alerts and safety checks',
                  'Automated controlled substance tracking',
                  'Regulatory compliance and audit-ready reports',
                  'Insurance and billing integration',
                  'Patient medication history and profiles',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 bg-accent-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <span className="text-gray-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Get Started Today
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right content - Stats Grid */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {[
                {
                  icon: Shield,
                  stat: '100%',
                  label: 'HIPAA Compliant',
                  color: 'primary',
                },
                {
                  icon: Clock,
                  stat: '60%',
                  label: 'Time Saved on Admin',
                  color: 'accent',
                },
                {
                  icon: Star,
                  stat: '4.9/5',
                  label: 'Customer Rating',
                  color: 'warning',
                },
                {
                  icon: Activity,
                  stat: '30%',
                  label: 'Revenue Increase',
                  color: 'primary',
                },
              ].map((item) => {
                const Icon = item.icon
                const bgMap = {
                  primary: 'bg-primary-50',
                  accent: 'bg-accent-50',
                  warning: 'bg-warning-50',
                }
                const textMap = {
                  primary: 'text-primary',
                  accent: 'text-accent',
                  warning: 'text-warning',
                }
                return (
                  <div
                    key={item.label}
                    className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    <div
                      className={`w-10 h-10 ${bgMap[item.color]} rounded-lg flex items-center justify-center mb-3`}
                    >
                      <Icon className={`w-5 h-5 ${textMap[item.color]}`} />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{item.stat}</p>
                    <p className="mt-1 text-sm text-gray-500">{item.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pricing Section ─────────────────────────────────────── */}
      <section id="pricing" className="py-20 sm:py-28 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              <span>Simple Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Choose the Plan That{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Fits Your Pharmacy
              </span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              Start free for 14 days. No credit card required. Upgrade or downgrade at any time.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 ${
                  plan.highlighted
                    ? 'bg-gradient-to-b from-primary to-primary-700 text-white shadow-2xl shadow-primary/25 ring-2 ring-primary scale-[1.03]'
                    : 'bg-white border border-gray-200/80 hover:shadow-xl hover:shadow-gray-200/50 hover:border-primary-200'
                }`}
              >
                {/* Popular badge */}
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 bg-accent text-white text-xs font-bold rounded-full shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3
                    className={`text-lg font-semibold ${
                      plan.highlighted ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`mt-1 text-sm ${
                      plan.highlighted ? 'text-primary-100' : 'text-gray-500'
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <span
                    className={`text-4xl font-extrabold ${
                      plan.highlighted ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className={`text-base font-medium ${
                        plan.highlighted ? 'text-primary-200' : 'text-gray-500'
                      }`}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          plan.highlighted ? 'text-accent-light' : 'text-accent'
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          plan.highlighted ? 'text-primary-100' : 'text-gray-600'
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.name === 'Enterprise' ? '#contact' : '/register'}
                  className={`block w-full py-3 text-center text-sm font-semibold rounded-xl transition-all duration-200 ${
                    plan.highlighted
                      ? 'bg-white text-primary hover:bg-gray-50 shadow-lg'
                      : 'bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-md'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary to-primary-800 rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Ready to Transform Your Pharmacy?
              </h2>
              <p className="mt-4 text-lg text-primary-100 max-w-2xl mx-auto">
                Join hundreds of pharmacies that trust PharmaCare to manage their operations. Start
                your free trial today and see the difference.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-primary bg-white hover:bg-gray-50 rounded-xl shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#contact"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white border-2 border-white/30 hover:border-white/60 rounded-xl transition-all duration-200"
                >
                  Contact Sales
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <footer id="contact" className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
            {/* Company Info */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-700 rounded-lg flex items-center justify-center">
                  <Pill className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">
                  Pharma<span className="text-primary-light">Care</span>
                </span>
              </Link>
              <p className="text-sm leading-relaxed max-w-xs">
                Cloud-based pharmacy management system designed to help pharmacies of all sizes
                streamline their operations and grow their business.
              </p>
              {/* Social placeholder */}
              <div className="mt-6 flex gap-3">
                {['X', 'in', 'f'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-9 h-9 bg-gray-800 hover:bg-primary rounded-lg flex items-center justify-center text-sm font-bold text-gray-400 hover:text-white transition-all duration-200"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Quick Links
              </h4>
              <ul className="space-y-3">
                {[
                  { label: 'Features', href: '#features' },
                  { label: 'Pricing', href: '#pricing' },
                  { label: 'About Us', href: '#' },
                  { label: 'Blog', href: '#' },
                  { label: 'Careers', href: '#' },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Legal
              </h4>
              <ul className="space-y-3">
                {[
                  { label: 'Privacy Policy', href: '#' },
                  { label: 'Terms of Service', href: '#' },
                  { label: 'Cookie Policy', href: '#' },
                  { label: 'HIPAA Compliance', href: '#' },
                  { label: 'Data Security', href: '#' },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Contact Us
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Mail className="w-4 h-4 mt-0.5 text-primary-light flex-shrink-0" />
                  <span className="text-sm">support@pharmacare.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="w-4 h-4 mt-0.5 text-primary-light flex-shrink-0" />
                  <span className="text-sm">+1 (555) 123-4567</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 text-primary-light flex-shrink-0" />
                  <span className="text-sm">
                    123 Healthcare Ave
                    <br />
                    San Francisco, CA 94102
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="py-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} PharmaCare. All rights reserved.
            </p>
            <p className="text-sm text-gray-600">
              Made with <Heart className="w-3.5 h-3.5 inline text-danger" /> for pharmacies
              everywhere
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
