import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { MapPin, Phone, PackageCheck, Navigation, Package, IndianRupee, ChevronDown, ChevronUp } from 'lucide-react'

export default function DeliveryOrders() {
  const { profile } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  const fetchOrders = async () => {
    if (!profile?.id) return
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, order_number, created_at, status, total, payment_method,
          customer_name, customer_phone, delivery_address,
          delivery_fee, rider_tip, subtotal, platform_fee, gst_amount,
          order_items ( id, quantity, product_name, product_price, total )
        `)
        .in('status', ['packed', 'assigned', 'picked_up', 'in_transit'])
        .or(`delivery_partner_id.eq.${profile.id},status.eq.packed`)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    
    // Realtime: new packed orders appear automatically
    const channel = supabase
      .channel('rider_orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders()
      })
      .subscribe()
    
    return () => supabase.removeChannel(channel)
  }, [profile?.id])

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      const updateData = { status: newStatus, updated_at: new Date().toISOString() }
      
      if (newStatus === 'picked_up') {
        updateData.delivery_partner_id = profile.id
      }
      
      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
      
      if (error) throw error
      
      // Log status change
      await supabase.from('order_status_log').insert({
        order_id: orderId, status: newStatus, changed_by: profile.id,
        note: `Rider: ${newStatus === 'picked_up' ? 'Picked up order' : newStatus === 'in_transit' ? 'On the way to customer' : 'Delivered to customer'}`
      })
      
      // If delivered, record earnings and remove from view
      if (newStatus === 'delivered') {
        const order = orders.find(o => o.id === orderId)
        if (order) {
          const feeEarned = Number(order.delivery_fee) || 0
          const tipEarned = Number(order.rider_tip) || 0
          const totalEarned = feeEarned + tipEarned
          
          if (totalEarned > 0) {
            await supabase.from('rider_earnings').insert({
              rider_id: profile.id,
              order_id: orderId,
              delivery_fee_earned: feeEarned,
              tip_earned: tipEarned,
              total_earned: totalEarned,
              status: 'pending'
            })
          }
        }
        setOrders(orders.filter(o => o.id !== orderId))
      } else {
        setOrders(orders.map(o => o.id === orderId ? { ...o, ...updateData } : o))
      }
    } catch (err) {
      alert("Failed to update status")
    } finally {
      setUpdatingId(null)
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'packed': return '#d97706'
      case 'picked_up': return '#2563eb'
      case 'in_transit': return '#ea580c'
      default: return '#64748b'
    }
  }

  const getStatusLabel = (status) => {
    switch(status) {
      case 'packed': return '📦 Ready for Pickup'
      case 'assigned': return '✅ Assigned to You'
      case 'picked_up': return '🛵 Picked Up'
      case 'in_transit': return '🚀 On the Way'
      default: return status
    }
  }

  if (loading) return <div className="loader"><div className="spinner" /></div>

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 16px 0', color: '#fbbf24' }}>Active Deliveries</h2>

      {/* Summary bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <div style={{ flex: 1, padding: '10px', background: 'rgba(251,191,36,0.1)', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#fbbf24' }}>{orders.length}</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Active</div>
        </div>
        <div style={{ flex: 1, padding: '10px', background: 'rgba(34,197,94,0.1)', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#22c55e' }}>
            ₹{orders.reduce((sum, o) => sum + (Number(o.delivery_fee) || 0) + (Number(o.rider_tip) || 0), 0)}
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Potential Earnings</div>
        </div>
      </div>

      <div>
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: '#64748b' }}>
            <PackageCheck size={48} opacity={0.3} style={{ marginBottom: '16px' }} />
            <p style={{ margin: 0 }}>No active deliveries right now.</p>
            <p style={{ fontSize: '13px', marginTop: '6px', color: '#475569' }}>New orders will appear here automatically.</p>
          </div>
        ) : (
          orders.map(order => {
            const expanded = expandedId === order.id
            const earnings = (Number(order.delivery_fee) || 0) + (Number(order.rider_tip) || 0)
            return (
              <div key={order.id} className="delivery-card" style={{ marginBottom: '12px' }}>
                {/* Header */}
                <div className="delivery-target">
                  <div>
                    <div className="delivery-id">#{order.order_number}</div>
                    <div style={{ fontSize: '11px', color: getStatusColor(order.status), fontWeight: 600, marginTop: '2px' }}>
                      {getStatusLabel(order.status)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="delivery-amount" style={{ color: '#22c55e' }}>
                      {order.payment_method === 'cod' ? `Collect ₹${Number(order.total).toFixed(0)}` : 'PREPAID'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      Earn ₹{earnings.toFixed(0)}
                    </div>
                  </div>
                </div>
                
                <div className="delivery-body">
                  {/* Customer info */}
                  <div className="delivery-customer">
                    <div className="delivery-customer-name">{order.customer_name}</div>
                    <div className="delivery-customer-address">
                      <MapPin size={14} style={{ display: 'inline', marginRight: '4px', position: 'relative', top: '2px' }} />
                      {order.delivery_address}
                    </div>
                  </div>

                  {/* Expandable: order items */}
                  <button 
                    onClick={() => setExpandedId(expanded ? null : order.id)}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', 
                      color: 'var(--brand)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: '6px 0', width: '100%'
                    }}
                  >
                    <Package size={13} /> {order.order_items?.length || 0} items
                    {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                  {expanded && (
                    <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '8px' }}>
                      {order.order_items?.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                          <span>{item.quantity}x {item.product_name}</span>
                          <span>₹{Number(item.total).toFixed(0)}</span>
                        </div>
                      ))}
                      {Number(order.rider_tip) > 0 && (
                        <div style={{ marginTop: '6px', padding: '4px 8px', background: 'rgba(34,197,94,0.1)', borderRadius: '6px', fontSize: '12px', color: '#22c55e', fontWeight: 600 }}>
                          💰 Customer Tip: ₹{Number(order.rider_tip).toFixed(0)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="delivery-action-row">
                    <a href={`tel:${order.customer_phone}`} className="delivery-call-btn">
                      <Phone size={16} /> Call
                    </a>
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.delivery_address)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="delivery-map-btn"
                    >
                      <Navigation size={16} /> Navigate
                    </a>
                  </div>

                  {/* Status action buttons */}
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {order.status === 'packed' && (
                      <button 
                        className="delivery-btn delivery-btn-primary"
                        onClick={() => handleUpdateStatus(order.id, 'picked_up')}
                        disabled={updatingId === order.id}
                      >
                        {updatingId === order.id ? 'Updating...' : '📦 Pick Up Order'}
                      </button>
                    )}
                    
                    {(order.status === 'assigned' || order.status === 'picked_up') && (
                      <>
                        <button 
                          className="delivery-btn delivery-btn-primary"
                          onClick={() => handleUpdateStatus(order.id, 'in_transit')}
                          disabled={updatingId === order.id}
                          style={{ background: '#ea580c' }}
                        >
                          {updatingId === order.id ? 'Updating...' : '🚀 Start Delivery'}
                        </button>
                      </>
                    )}

                    {order.status === 'in_transit' && (
                      <button 
                        className="delivery-btn delivery-btn-success"
                        onClick={() => handleUpdateStatus(order.id, 'delivered')}
                        disabled={updatingId === order.id}
                      >
                        {updatingId === order.id ? 'Updating...' : '✅ Mark Delivered'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
