import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Package, Clock, ChevronRight, Phone, MapPin, CheckCircle2, Truck, PackageCheck, ShoppingBag, Box } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const STATUS_STEPS = [
  { key: 'placed', label: 'Placed', icon: ShoppingBag },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'packing', label: 'Packing', icon: Box },
  { key: 'packed', label: 'Ready', icon: PackageCheck },
  { key: 'picked_up', label: 'Picked Up', icon: Package },
  { key: 'in_transit', label: 'On the Way', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
]

const STATUS_MAP = {
  placed: { label: 'Placed', color: '#d97706', bg: 'rgba(217,119,6,0.15)' },
  confirmed: { label: 'Confirmed', color: '#2563eb', bg: 'rgba(37,99,235,0.15)' },
  packing: { label: 'Packing', color: '#7c3aed', bg: 'rgba(124,58,237,0.15)' },
  packed: { label: 'Packed', color: '#7c3aed', bg: 'rgba(124,58,237,0.15)' },
  assigned: { label: 'Assigned', color: '#0284c7', bg: 'rgba(2,132,199,0.15)' },
  picked_up: { label: 'Picked Up', color: '#0284c7', bg: 'rgba(2,132,199,0.15)' },
  in_transit: { label: 'On the Way', color: '#ea580c', bg: 'rgba(234,88,12,0.15)' },
  delivered: { label: 'Delivered', color: '#16a34a', bg: 'rgba(22,163,74,0.15)' },
  cancelled: { label: 'Cancelled', color: '#dc2626', bg: 'rgba(220,38,38,0.15)' },
}

function getStepIndex(status) {
  // Map 'assigned' to 'picked_up' step for display
  const mapped = status === 'assigned' ? 'picked_up' : status
  return STATUS_STEPS.findIndex(s => s.key === mapped)
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  const fetchOrders = async () => {
    if (!user) return
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (!user) return
    fetchOrders()

    // Realtime subscription for order updates
    const channel = supabase
      .channel('customer_orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `customer_id=eq.${user.id}` }, () => {
        fetchOrders()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  const formatDate = (d) => {
    const date = new Date(d)
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const isActive = (status) => !['delivered', 'cancelled'].includes(status)

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 40 }}>
        <button className="back-btn" onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', padding: 0, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <ArrowLeft size={18} color="var(--text-primary)" />
        </button>
        <h1 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>My Orders</h1>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h2>No orders yet</h2>
          <p>Your orders will appear here once you place them</p>
          <Link to="/" className="empty-state-btn">Start Shopping</Link>
        </div>
      ) : (
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {orders.map(order => {
            const status = STATUS_MAP[order.status] || STATUS_MAP.placed
            const itemCount = order.order_items?.length || 0
            const expanded = expandedId === order.id
            const currentStep = getStepIndex(order.status)

            return (
              <div key={order.id} className="order-card" onClick={() => setExpandedId(expanded ? null : order.id)} style={{ cursor: 'pointer' }}>
                <div className="order-card-top">
                  <div>
                    <div className="order-card-number">#{order.order_number}</div>
                    <div className="order-card-date">
                      <Clock size={11} /> {formatDate(order.created_at)}
                    </div>
                  </div>
                  <span className="order-status-badge" style={{ color: status.color, background: status.bg }}>
                    {status.label}
                  </span>
                </div>
                <div className="order-card-bottom">
                  <div>
                    <span className="order-card-items">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                    <span className="order-card-total">₹{Number(order.total).toFixed(0)}</span>
                  </div>
                  <span className="order-card-method">
                    {order.payment_method === 'cod' ? '💵 COD' : '💳 Online'}
                  </span>
                </div>

                {/* Expanded: Order tracking timeline */}
                {expanded && (
                  <div style={{ borderTop: '1px solid var(--border)', marginTop: '12px', paddingTop: '14px' }} onClick={e => e.stopPropagation()}>
                    {/* Tracking timeline */}
                    {isActive(order.status) && order.status !== 'cancelled' && (
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>Order Tracking</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                          {STATUS_STEPS.map((step, i) => {
                            const Icon = step.icon
                            const done = i <= currentStep
                            const isCurrent = i === currentStep
                            return (
                              <div key={step.key} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', position: 'relative' }}>
                                {/* Vertical line */}
                                {i < STATUS_STEPS.length - 1 && (
                                  <div style={{ position: 'absolute', left: '11px', top: '24px', width: '2px', height: '20px', background: done && i < currentStep ? 'var(--brand)' : 'var(--border)' }} />
                                )}
                                {/* Icon */}
                                <div style={{
                                  width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                  background: done ? 'var(--brand)' : 'var(--surface-2, var(--surface))',
                                  border: done ? 'none' : '2px solid var(--border)',
                                }}>
                                  <Icon size={12} color={done ? '#fff' : 'var(--text-muted)'} />
                                </div>
                                {/* Label */}
                                <div style={{ paddingBottom: '14px' }}>
                                  <div style={{ fontSize: '13px', fontWeight: isCurrent ? 700 : 500, color: done ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                    {step.label}
                                    {isCurrent && <span style={{ marginLeft: '6px', fontSize: '10px', background: 'var(--brand)', color: '#fff', padding: '1px 6px', borderRadius: '8px' }}>NOW</span>}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Delivered badge */}
                    {order.status === 'delivered' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(22,163,74,0.1)', borderRadius: '8px', marginBottom: '12px' }}>
                        <CheckCircle2 size={18} color="#16a34a" />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#16a34a' }}>Delivered successfully!</span>
                      </div>
                    )}

                    {/* Order Items */}
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Items</div>
                    {order.order_items?.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        <span>{item.quantity}x {item.product_name}</span>
                        <span>₹{Number(item.total).toFixed(0)}</span>
                      </div>
                    ))}

                    {/* Address */}
                    <div style={{ marginTop: '10px', padding: '8px', background: 'var(--surface-2, var(--surface))', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <MapPin size={14} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{order.delivery_address}</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
