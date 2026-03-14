import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function CartPage() {
  const navigate = useNavigate()
  const { cartItems, addItem, removeItem, clearCart, totalItems, totalPrice, totalMrp } = useCart()
  const { user, profile } = useAuth()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddrId, setSelectedAddrId] = useState(null)
  const [showNewAddr, setShowNewAddr] = useState(false)
  const [newAddrLabel, setNewAddrLabel] = useState('Home')
  const [payment, setPayment] = useState('cod')
  const [placing, setPlacing] = useState(false)

  const deliveryFee = totalPrice >= 500 ? 0 : 25
  const savings = totalMrp - totalPrice
  const grandTotal = totalPrice + deliveryFee

  // Pre-fill name/phone from profile
  useEffect(() => {
    if (profile) {
      setName(profile.full_name || '')
      setPhone(profile.phone || user?.phone || '')
    }
  }, [profile, user])

  // Load saved addresses
  useEffect(() => {
    if (!user) return
    supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setSavedAddresses(data)
          const defaultAddr = data.find(a => a.is_default) || data[0]
          setSelectedAddrId(defaultAddr.id)
          setAddress(defaultAddr.full_address)
        } else {
          setShowNewAddr(true)
        }
      })
  }, [user])

  const handleSelectAddress = (addrId) => {
    setSelectedAddrId(addrId)
    const addr = savedAddresses.find(a => a.id === addrId)
    if (addr) setAddress(addr.full_address)
    setShowNewAddr(false)
  }

  const handleSaveNewAddress = async () => {
    if (!address.trim()) return
    const { data, error } = await supabase.from('addresses').insert({
      user_id: user.id,
      label: newAddrLabel || 'Home',
      full_address: address.trim(),
      is_default: savedAddresses.length === 0,
    }).select().single()
    if (!error && data) {
      setSavedAddresses(prev => [...prev, data])
      setSelectedAddrId(data.id)
      setShowNewAddr(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert('Please fill in all delivery details')
      return
    }
    if (phone.replace(/\D/g, '').length < 10) {
      alert('Please enter a valid phone number')
      return
    }
    setPlacing(true)
    try {
      const orderNumber = 'GTM-' + Date.now().toString(36).toUpperCase()
      const { data: order, error } = await supabase.from('orders').insert({
        order_number: orderNumber,
        customer_id: user.id,
        delivery_address: address.trim(),
        status: 'placed',
        subtotal: totalPrice,
        delivery_fee: deliveryFee,
        discount: savings > 0 ? savings : 0,
        total: grandTotal,
        payment_method: payment,
        payment_status: 'pending',
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        estimated_delivery: '30-45 mins',
      }).select().single()

      if (error) throw error

      const items = cartItems.map(({ product, qty }) => ({
        order_id: order.id,
        product_id: product.id,
        product_name: product.name,
        product_price: Number(product.price),
        product_image: product.image_url,
        quantity: qty,
        total: Number(product.price) * qty,
      }))

      await supabase.from('order_items').insert(items)

      clearCart()
      navigate('/order-success', { state: { orderNumber, total: grandTotal } })
    } catch (err) {
      console.error(err)
      alert('Failed to place order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  if (totalItems === 0) {
    return (
      <div className="page-content">
        <div className="cart-page">
          <div className="cart-header">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} color="#333" />
            </button>
            <h1>My Cart</h1>
          </div>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add items from the store to get started</p>
          <Link to="/" className="empty-state-btn">Browse Products</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content" style={{ paddingBottom: '40px' }}>
      <div className="cart-page">
        <div className="cart-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} color="#333" />
          </button>
          <h1>My Cart ({totalItems})</h1>
        </div>

        {/* Cart Items */}
        <div className="cart-items-list">
          {cartItems.map(({ product, qty }) => (
            <div key={product.id} className="cart-item">
              <img src={product.image_url} alt={product.name} className="cart-item-img" />
              <div className="cart-item-details">
                <div>
                  <div className="cart-item-name">{product.name}</div>
                  <div className="cart-item-unit">{product.unit}</div>
                </div>
                <div className="cart-item-bottom">
                  <span className="cart-item-price">₹{(Number(product.price) * qty).toFixed(0)}</span>
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => removeItem(product.id)}>−</button>
                    <span className="qty-count">{qty}</span>
                    <button className="qty-btn" onClick={() => addItem(product)}>+</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bill Summary */}
        <div className="bill-summary">
          <h3>Bill Details</h3>
          <div className="bill-row">
            <span>Item Total</span>
            <span>₹{totalPrice.toFixed(0)}</span>
          </div>
          {savings > 0 && (
            <div className="bill-row saving">
              <span>Savings</span>
              <span>-₹{savings.toFixed(0)}</span>
            </div>
          )}
          <div className="bill-row">
            <span>Delivery Fee</span>
            <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
          </div>
          <div className="bill-row total">
            <span>Grand Total</span>
            <span>₹{grandTotal.toFixed(0)}</span>
          </div>
          {totalPrice < 500 && (
            <p style={{ fontSize: '11px', color: '#0d8320', marginTop: '8px', fontWeight: 600 }}>
              Add ₹{(500 - totalPrice).toFixed(0)} more for free delivery
            </p>
          )}
        </div>

        {/* Delivery Details */}
        <div className="checkout-section">
          <h3>Delivery Details</h3>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input className="form-input" type="tel" placeholder="Enter 10-digit number" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>

          {/* Saved Addresses */}
          {savedAddresses.length > 0 && !showNewAddr && (
            <div className="form-group">
              <label className="form-label">Delivery Address *</label>
              <div className="saved-addr-list">
                {savedAddresses.map(addr => (
                  <button
                    key={addr.id}
                    className={`saved-addr-item ${selectedAddrId === addr.id ? 'active' : ''}`}
                    onClick={() => handleSelectAddress(addr.id)}
                  >
                    <span className="saved-addr-label">{addr.label}</span>
                    <span className="saved-addr-text">{addr.full_address}</span>
                  </button>
                ))}
                <button className="saved-addr-add" onClick={() => setShowNewAddr(true)}>+ Add New Address</button>
              </div>
            </div>
          )}

          {/* New Address Form */}
          {(showNewAddr || savedAddresses.length === 0) && (
            <div className="form-group">
              <label className="form-label">Delivery Address *</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                {['Home', 'Work', 'Other'].map(label => (
                  <button
                    key={label}
                    className={`addr-label-btn ${newAddrLabel === label ? 'active' : ''}`}
                    onClick={() => setNewAddrLabel(label)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <textarea
                className="form-input form-textarea"
                placeholder="House/Flat no., Building, Street, Area"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
              {savedAddresses.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button className="addr-save-btn" onClick={handleSaveNewAddress}>Save Address</button>
                  <button className="addr-cancel-btn" onClick={() => { setShowNewAddr(false); handleSelectAddress(selectedAddrId) }}>Cancel</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Payment */}
        <div className="checkout-section">
          <h3>Payment Method</h3>
          <div className="payment-options">
            <button className={`payment-option ${payment === 'cod' ? 'active' : ''}`} onClick={() => setPayment('cod')}>
              💵 Cash on Delivery
            </button>
            <button className="payment-option disabled" disabled>
              💳 Pay Online
              <span className="coming-soon-tag">Coming Soon</span>
            </button>
          </div>
        </div>

        <button
          className="place-order-btn"
          onClick={handlePlaceOrder}
          disabled={placing}
        >
          {placing ? 'Placing Order...' : `Place Order • ₹${grandTotal.toFixed(0)}`}
        </button>
      </div>
    </div>
  )
}
