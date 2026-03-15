import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Package, Clock, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const STATUS_MAP = {
  placed: { label: 'Placed', color: '#d97706', bg: '#fffbeb' },
  confirmed: { label: 'Confirmed', color: '#2563eb', bg: '#eff6ff' },
  packing: { label: 'Packing', color: '#7c3aed', bg: '#f5f3ff' },
  packed: { label: 'Packed', color: '#7c3aed', bg: '#f5f3ff' },
  assigned: { label: 'Assigned', color: '#0284c7', bg: '#f0f9ff' },
  picked_up: { label: 'Picked Up', color: '#0284c7', bg: '#f0f9ff' },
  in_transit: { label: 'On the way', color: '#ea580c', bg: '#fff7ed' },
  delivered: { label: 'Delivered', color: '#16a34a', bg: '#f0fdf4' },
  cancelled: { label: 'Cancelled', color: '#dc2626', bg: '#fef2f2' },
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })
      setOrders(data || [])
      setLoading(false)
    }
    fetchOrders()
  }, [user])

  const formatDate = (d) => {
    const date = new Date(d)
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

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
            return (
              <div key={order.id} className="order-card">
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
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
