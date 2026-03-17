import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { Clock, CheckSquare, Phone, MapPin, User } from 'lucide-react'

const TABS = [
  { id: 'placed', label: 'New Orders' },
  { id: 'packing', label: 'Packing' },
  { id: 'packed', label: 'Ready' }
]

export default function StoreOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('placed')
  const [updatingId, setUpdatingId] = useState(null)
  const prevCountRef = useRef(0)

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, order_number, created_at, status, total, payment_method,
          customer_name, customer_phone, delivery_address,
          order_items ( id, quantity, product_name, product_price, total )
        `)
        .in('status', ['placed', 'confirmed', 'packing', 'packed'])
        .order('created_at', { ascending: true })
      
      if (error) throw error
      
      // Audio alert for new orders
      const newOrders = (data || []).filter(o => o.status === 'placed' || o.status === 'confirmed')
      if (newOrders.length > prevCountRef.current && prevCountRef.current > 0) {
        try { new Audio('data:audio/wav;base64,UklGRl9vT19teleVmF0YQEAAAEAEAABAAEAAABAAAgAGABkYXRhAQAAAAAA').play().catch(() => {}) } catch(e) {}
      }
      prevCountRef.current = newOrders.length
      
      setOrders(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    const channel = supabase
      .channel('store_orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders()
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)
      if (error) throw error
      
      // Log status change
      await supabase.from('order_status_log').insert({
        order_id: orderId, status: newStatus, note: `Store staff: ${newStatus}`
      })
      
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    } catch (err) {
      alert("Failed to update status")
    } finally {
      setUpdatingId(null)
    }
  }

  const displayStatus = (status) => status === 'confirmed' ? 'placed' : status
  const filteredOrders = orders.filter(o => displayStatus(o.status) === activeTab)

  const getTimeAgo = (dateStr) => {
    const min = Math.floor((new Date() - new Date(dateStr)) / 60000)
    if (min < 1) return 'Just now'
    if (min < 60) return `${min}m ago`
    return `${Math.floor(min/60)}h ${min%60}m ago`
  }

  if (loading) return <div className="loader"><div className="spinner" /></div>

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 16px 0' }}>Order Fulfillment</h2>
      
      <div className="store-tabs">
        {TABS.map(tab => {
          const count = orders.filter(o => displayStatus(o.status) === tab.id).length
          return (
            <div 
              key={tab.id}
              className={`store-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {count > 0 && (
                <span style={{ 
                  marginLeft: '6px', 
                  background: tab.id === 'placed' ? '#ef4444' : 'var(--brand)', 
                  color: 'white', borderRadius: '50%', padding: '2px 7px', fontSize: '11px', fontWeight: 700 
                }}>
                  {count}
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div>
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: '#94a3b8' }}>
            <CheckSquare size={48} opacity={0.2} style={{ marginBottom: '16px' }} />
            <p>No orders in "{TABS.find(t => t.id === activeTab)?.label}"</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="store-order-card">
              <div className="store-order-target">
                <div>
                  <div className="store-order-id">#{order.order_number}</div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                    {order.order_items?.length || 0} items • ₹{Number(order.total).toFixed(0)}
                    {order.payment_method === 'cod' && <span style={{ marginLeft: '6px', background: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>COD</span>}
                  </div>
                </div>
                <div className="store-order-time">
                  <Clock size={14} />
                  <span style={{ color: Math.floor((new Date() - new Date(order.created_at)) / 60000) > 15 ? '#ef4444' : 'inherit' }}>
                    {getTimeAgo(order.created_at)}
                  </span>
                </div>
              </div>
              
              {/* Customer Info */}
              <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-primary)' }}>
                  <User size={13} /> <strong>{order.customer_name}</strong>
                  {order.customer_phone && (
                    <a href={`tel:${order.customer_phone}`} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--brand)', fontSize: '12px', textDecoration: 'none' }}>
                      <Phone size={12} /> Call
                    </a>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <MapPin size={12} style={{ flexShrink: 0, marginTop: '2px' }} /> {order.delivery_address}
                </div>
              </div>

              <div className="store-order-body">
                {/* Items list */}
                <div className="store-order-items-preview">
                  {order.order_items?.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                      <span><strong>{item.quantity}x</strong> {item.product_name}</span>
                      <span style={{ color: '#94a3b8' }}>₹{Number(item.total).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
                
                {activeTab === 'placed' && (
                  <button 
                    className="store-btn store-btn-primary"
                    onClick={() => handleUpdateStatus(order.id, 'packing')}
                    disabled={updatingId === order.id}
                  >
                    {updatingId === order.id ? 'Accepting...' : 'Accept & Start Packing'}
                  </button>
                )}
                
                {activeTab === 'packing' && (
                  <button 
                    className="store-btn store-btn-success"
                    onClick={() => handleUpdateStatus(order.id, 'packed')}
                    disabled={updatingId === order.id}
                  >
                    {updatingId === order.id ? 'Updating...' : '✓ Mark as Ready for Pickup'}
                  </button>
                )}
                
                {activeTab === 'packed' && (
                  <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(251,191,36,0.1)', borderRadius: '8px', color: '#d97706', fontSize: '14px', fontWeight: 600 }}>
                    ⏳ Waiting for Delivery Partner
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
