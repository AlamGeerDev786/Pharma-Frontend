import { useState, useEffect, useMemo } from 'react'
import Card, { CardHeader, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { cn, formatCurrency } from '@/lib/utils'
import {
  Search,
  Plus,
  Minus,
  X,
  ShoppingCart,
  CreditCard,
  Smartphone,
  Banknote,
  Printer,
  Receipt,
  Loader2,
} from 'lucide-react'
import useMedicineStore from '../../store/medicineStore'
import useSaleStore from '../../store/saleStore'

const PAYMENT_METHODS = [
  { key: 'cash', label: 'Cash', icon: Banknote },
  { key: 'card', label: 'Card', icon: CreditCard },
  { key: 'mobile', label: 'Mobile', icon: Smartphone },
]

// ── Component ─────────────────────────────────────────────────────────
export default function POSPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [discount, setDiscount] = useState(0)
  const [customerName, setCustomerName] = useState('')
  const [cartItems, setCartItems] = useState([])
  const [saleLoading, setSaleLoading] = useState(false)
  const [saleError, setSaleError] = useState(null)
  const [saleSuccess, setSaleSuccess] = useState(false)

  // ── Store data ────────────────────────────────────────────────────────
  const { medicines, categories, fetchMedicines, fetchCategories } = useMedicineStore()
  const { createSale } = useSaleStore()

  // ── Fetch medicines and categories on mount ───────────────────────────
  useEffect(() => {
    fetchMedicines({ limit: 50 })
    fetchCategories()
  }, [fetchMedicines, fetchCategories])

  // ── Build categories dynamically ──────────────────────────────────────
  const categoryList = useMemo(
    () => ['All', ...categories.map((c) => c.name)],
    [categories]
  )

  // ── Helper to get price from a medicine's batches ─────────────────────
  const getMedicinePrice = (med) => {
    if (!med.batches || med.batches.length === 0) return 0
    return Math.min(...med.batches.map((b) => b.sellingPrice))
  }

  // ── Helper to get the batch ID for the cheapest selling price ─────────
  const getMedicineBatch = (med) => {
    if (!med.batches || med.batches.length === 0) return null
    const sorted = [...med.batches].sort((a, b) => a.sellingPrice - b.sellingPrice)
    return sorted[0]
  }

  // ── Filtered products ───────────────────────────────────────────────
  const filteredMedicines = useMemo(() => {
    return medicines.filter((med) => {
      const matchesSearch =
        med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (med.genericName && med.genericName.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory =
        activeCategory === 'All' || med.category?.name === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [medicines, searchQuery, activeCategory])

  // ── Cart helpers ────────────────────────────────────────────────────
  const addToCart = (medicine) => {
    const price = getMedicinePrice(medicine)
    const batch = getMedicineBatch(medicine)
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === medicine.id)
      if (existing) {
        return prev.map((item) =>
          item.id === medicine.id ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [
        ...prev,
        {
          id: medicine.id,
          name: medicine.name,
          price,
          batchId: batch?.id || null,
          qty: 1,
        },
      ]
    })
  }

  const updateQty = (id, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    )
  }

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }

  const clearCart = () => setCartItems([])

  // ── Totals ──────────────────────────────────────────────────────────
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  const tax = subtotal * 0.05
  const discountAmount = Number(discount) || 0
  const total = subtotal + tax - discountAmount

  // ── Complete Sale Handler ─────────────────────────────────────────────
  const handleCompleteSale = async () => {
    if (cartItems.length === 0) return

    setSaleLoading(true)
    setSaleError(null)
    setSaleSuccess(false)

    try {
      await createSale({
        items: cartItems.map((item) => ({
          medicineId: item.id,
          batchId: item.batchId,
          quantity: item.qty,
          price: item.price,
        })),
        paymentMethod: paymentMethod.toUpperCase(),
        discount: Number(discount) || 0,
        customerName: customerName || undefined,
        tax: tax,
      })

      // On success: clear cart, show success, reset fields
      clearCart()
      setDiscount(0)
      setCustomerName('')
      setSaleSuccess(true)

      // Auto-hide success message after 4 seconds
      setTimeout(() => setSaleSuccess(false), 4000)
    } catch (err) {
      setSaleError(err.response?.data?.error || err.message || 'Failed to complete sale')
    } finally {
      setSaleLoading(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
          <p className="text-sm text-gray-500 mt-1">Create a new sale transaction</p>
        </div>
        <Badge variant="primary" className="flex items-center gap-1.5 px-3 py-1">
          <Receipt className="w-3.5 h-3.5" />
          POS Terminal
        </Badge>
      </div>

      {/* Success / Error Messages */}
      {saleSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-center justify-between">
          <span>Sale completed successfully!</span>
          <button onClick={() => setSaleSuccess(false)} className="text-green-500 hover:text-green-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {saleError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          <span>{saleError}</span>
          <button onClick={() => setSaleError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ──────── LEFT PANEL: Products (60%) ──────── */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search */}
          <Input
            icon={Search}
            placeholder="Search medicine by name or scan barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            {categoryList.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredMedicines.map((med) => {
              const price = getMedicinePrice(med)
              const stock = med.totalStock ?? 0
              return (
                <Card key={med.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 leading-tight">{med.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{med.genericName}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">{formatCurrency(price)}</span>
                      <Badge variant={stock > 100 ? 'success' : stock > 0 ? 'warning' : 'danger'}>
                        Stock: {stock}
                      </Badge>
                    </div>
                    <Button
                      variant="accent"
                      size="sm"
                      className="w-full"
                      onClick={() => addToCart(med)}
                      disabled={stock === 0}
                    >
                      <Plus className="w-4 h-4" />
                      {stock === 0 ? 'Out of Stock' : 'Add'}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}

            {filteredMedicines.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-400">
                <Search className="w-10 h-10 mx-auto mb-3" />
                <p className="font-medium">No medicines found</p>
                <p className="text-sm mt-1">Try adjusting your search or category filter</p>
              </div>
            )}
          </div>
        </div>

        {/* ──────── RIGHT PANEL: Cart & Checkout (40%) ──────── */}
        <div className="lg:col-span-2">
          <Card className="sticky top-6">
            {/* Cart Header */}
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-gray-900">Current Sale</h2>
                <Badge variant="primary">{cartItems.length}</Badge>
              </div>
              {cartItems.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearCart} className="text-danger hover:text-danger">
                  Clear All
                </Button>
              )}
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Cart Items */}
              {cartItems.length === 0 ? (
                <div className="py-8 text-center text-gray-400">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-sm">Cart is empty</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(item.price)} each</p>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-7 h-7 rounded-md bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-7 h-7 rounded-md bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line total & remove */}
                      <div className="text-right flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 w-16 text-right">
                          {formatCurrency(item.price * item.qty)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-danger hover:bg-danger-50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Divider */}
              <hr className="border-gray-200" />

              {/* Summary */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (5%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Discount</span>
                  <div className="w-24">
                    <input
                      type="number"
                      min="0"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm text-right focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    />
                  </div>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(total > 0 ? total : 0)}
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Payment Method</p>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setPaymentMethod(key)}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-lg border-2 p-3 text-sm font-medium transition-all',
                        paymentMethod === key
                          ? 'border-primary bg-primary-50 text-primary'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Name */}
              <Input
                label="Customer Name (optional)"
                placeholder="Walk-in customer"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  variant="accent"
                  size="lg"
                  className="w-full"
                  disabled={cartItems.length === 0 || saleLoading}
                  onClick={handleCompleteSale}
                >
                  {saleLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Receipt className="w-5 h-5" />
                      Complete Sale
                    </>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full"
                  disabled={cartItems.length === 0}
                >
                  <Printer className="w-4 h-4" />
                  Print Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
