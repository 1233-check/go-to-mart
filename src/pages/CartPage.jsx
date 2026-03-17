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
  
  // New Fee & Tip State
  const [deliveryDistance, setDeliveryDistance] = useState(2.5)
  const [tip, setTip] = useState(0)

  // Fake Distance Calculator based on address to simulate Maps API
  useEffect(() => {
    if (address.length > 5) {
      const dist = ((address.length * 0.35) % 8 + 1.2).toFixed(1)
      setDeliveryDistance(Number(dist))
    }
  }, [address])

  // Fee Calculations
  const savings = totalMrp - totalPrice
  const platformFee = totalItems > 0 ? 15 : 0 // Flat 15 Rs
  const gstAmount = totalPrice * 0.05 // 5% Flat GST

  // Delivery Fee: 30 Rs upto 3km, +5 Rs per km after
  let deliveryFee = 0
  if (totalItems > 0) {
    if (deliveryDistance <= 3) {
      deliveryFee = 30
    } else {
      const extraKm = Math.ceil(deliveryDistance - 3)
      deliveryFee = 30 + (extraKm * 5)
    }
  }

  const grandTotal = totalPrice + deliveryFee + platformFee + gstAmount + tip

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
      // Generate sequential order number via DB sequence
      const { data: seqData } = await supabase.rpc('nextval_order_number')
      const seqNum = seqData || Date.now()
      const orderNumber = 'GTM-' + String(seqNum).padStart(4, '0')

      const { data: order, error } = await supabase.from('orders').insert({
        order_number: orderNumber,
        customer_id: user.id,
        delivery_address: address.trim(),
        status: 'placed',
        subtotal: totalPrice,
        delivery_fee: deliveryFee,
        discount: savings > 0 ? savings : 0,
        total: grandTotal,
        platform_fee: platformFee,
        gst_amount: gstAmount,
        rider_tip: tip,
        delivery_distance_km: deliveryDistance,
        payment_method: payment,
        payment_status: payment === 'cod' ? 'pending' : 'pending',
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        estimated_delivery: '30-45 mins',
      }).select().single()

      if (error) throw error

      // Insert order items
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

      // Log status change
      await supabase.from('order_status_log').insert({
        order_id: order.id,
        status: 'placed',
        changed_by: user.id,
        note: 'Order placed by customer'
      })

      // Deduct stock quantities
      for (const { product, qty } of cartItems) {
        await supabase.rpc('decrement_stock', { p_product_id: product.id, p_qty: qty })
      }

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
              <ArrowLeft size={18} color="var(--text-primary)" />
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
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
          {savings > 0 && (
            <div className="bill-row saving">
              <span>Savings</span>
              <span>-₹{savings.toFixed(2)}</span>
            </div>
          )}
          <div className="bill-row">
            <span>Delivery Fee ({deliveryDistance} km)</span>
            <span>₹{deliveryFee.toFixed(2)}</span>
          </div>
          <div className="bill-row">
            <span>Platform Fee</span>
            <span>₹{platformFee.toFixed(2)}</span>
          </div>
          <div className="bill-row">
            <span>GST Amount (5%)</span>
            <span>₹{gstAmount.toFixed(2)}</span>
          </div>
          {tip > 0 && (
            <div className="bill-row">
              <span>Delivery Partner Tip</span>
              <span>₹{tip.toFixed(2)}</span>
            </div>
          )}
          <div className="bill-row total">
            <span>Grand Total</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Tip Section — Redesigned */}
        <div className="checkout-section tip-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '18px' }}>🤝</span>
            <h3 style={{ margin: 0 }}>Tip your Delivery Partner</h3>
          </div>
          <p className="tip-subtitle" style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--text-muted)' }}>100% of the tip goes directly to the rider helping you</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {[
              { amt: 10, emoji: '😊', label: 'Kind' },
              { amt: 20, emoji: '🙏', label: 'Grateful' },
              { amt: 30, emoji: '⭐', label: 'Great' },
              { amt: 50, emoji: '🎉', label: 'Amazing' },
            ].map(({ amt, emoji, label }) => (
              <button
                key={amt}
                onClick={() => setTip(tip === amt ? 0 : amt)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                  padding: '10px 4px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                  background: tip === amt ? 'var(--brand)' : 'var(--surface)',
                  color: tip === amt ? '#fff' : 'var(--text-primary)',
                  boxShadow: tip === amt ? '0 2px 8px rgba(22,163,74,0.3)' : '0 1px 3px rgba(0,0,0,0.06)',
                  outline: tip === amt ? 'none' : '1px solid var(--border)',
                  transition: 'all 0.2s ease',
                  transform: tip === amt ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                <span style={{ fontSize: '20px' }}>{emoji}</span>
                <span style={{ fontSize: '14px', fontWeight: 700 }}>₹{amt}</span>
                <span style={{ fontSize: '9px', opacity: 0.7, fontWeight: 500 }}>{label}</span>
              </button>
            ))}
          </div>
          {tip > 0 && (
            <div style={{ marginTop: '8px', textAlign: 'center', fontSize: '12px', color: 'var(--brand)', fontWeight: 600 }}>
              ✨ You're adding ₹{tip} tip — Thank you!
            </div>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {savedAddresses.map(addr => {
                  const isSelected = selectedAddrId === addr.id
                  const icon = addr.label === 'Home' ? '🏠' : addr.label === 'Work' ? '🏢' : '📍'
                  return (
                    <button
                      key={addr.id}
                      onClick={() => handleSelectAddress(addr.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
                        background: isSelected ? 'rgba(22,163,74,0.08)' : 'var(--surface)',
                        outline: isSelected ? '2px solid var(--brand)' : '1px solid var(--border)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ fontSize: '20px', flexShrink: 0 }}>{icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{addr.label}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{addr.full_address}</div>
                      </div>
                      {isSelected && <span style={{ color: 'var(--brand)', fontSize: '18px', flexShrink: 0 }}>✓</span>}
                    </button>
                  )
                })}
                <button 
                  onClick={() => setShowNewAddr(true)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                    background: 'transparent', outline: '1px dashed var(--border)',
                    color: 'var(--brand)', fontSize: '13px', fontWeight: 600,
                  }}
                >
                  ＋ Add New Address
                </button>
              </div>
            </div>
          )}

          {/* New Address Form */}
          {(showNewAddr || savedAddresses.length === 0) && (
            <div className="form-group">
              <label className="form-label">Delivery Address *</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                {[
                  { label: 'Home', icon: '🏠' },
                  { label: 'Work', icon: '🏢' },
                  { label: 'Other', icon: '📍' },
                ].map(({ label, icon }) => (
                  <button
                    key={label}
                    onClick={() => setNewAddrLabel(label)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '6px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                      background: newAddrLabel === label ? 'var(--brand)' : 'var(--surface)',
                      color: newAddrLabel === label ? '#fff' : 'var(--text-secondary)',
                      outline: newAddrLabel === label ? 'none' : '1px solid var(--border)',
                    }}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
              <textarea
                className="form-input form-textarea"
                placeholder="House/Flat no., Building, Street, Area"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button 
                  onClick={handleSaveNewAddress}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    background: 'var(--brand)', color: '#fff', fontSize: '13px', fontWeight: 600,
                  }}
                >
                  💾 Save Address
                </button>
                {savedAddresses.length > 0 && (
                  <button 
                    onClick={() => { setShowNewAddr(false); handleSelectAddress(selectedAddrId) }}
                    style={{
                      padding: '10px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600,
                      outline: '1px solid var(--border)',
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
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
