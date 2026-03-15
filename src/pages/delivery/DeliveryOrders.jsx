import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { MapPin, Phone, PackageCheck, Navigation } from 'lucide-react'

export default function DeliveryOrders() {
  const { profile } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  const fetchOrders = async () => {
    if (!profile?.id) return
    try {
      // Find orders assigned to this delivery partner 
      // where status is either just assigned, or currently on the way
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, order_number, created_at, status, total, payment_method,
          customer_name, customer_phone, delivery_address,
          delivery_fee, rider_tip
        `)
        .in('status', ['packed', 'assigned', 'picked_up', 'in_transit'])
        // Usually, the admin assigns it, but for a true MVP we can let any rider "claim" a packed order.
        // For now, let's just show all 'packed' orders so they can claim them, 
        // OR orders explicitly assigned to them/picked up by them.
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
  }, [profile?.id])

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      const updateData = { status: newStatus }
      
      // If they are picking up a 'packed' order, assign it to them
      if (newStatus === 'picked_up') {
        updateData.delivery_partner_id = profile.id
      }
      
      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
      
      if (error) throw error
      
      // If delivered, calculate earnings and remove from this view
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

  if (loading) return <div className="loader"><div className="spinner" /></div>

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 16px 0', color: '#fbbf24' }}>Active Tasks</h2>

      <div>
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: '#64748b' }}>
            <PackageCheck size={48} opacity={0.3} style={{ marginBottom: '16px' }} />
            <p>No active deliveries right now.</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="delivery-card">
              <div className="delivery-target">
                <div className="delivery-id">#{order.order_number}</div>
                <div className="delivery-amount">
                  {order.payment_method === 'cod' ? `Collect ₹${Number(order.total).toFixed(0)}` : 'PREPAID'}
                </div>
              </div>
              
              <div className="delivery-body">
                <div className="delivery-customer">
                  <div className="delivery-customer-name">{order.customer_name}</div>
                  <div className="delivery-customer-address">
                    <MapPin size={14} style={{ display: 'inline', marginRight: '4px', position: 'relative', top: '2px' }} />
                    {order.delivery_address}
                  </div>
                </div>

                <div className="delivery-action-row">
                  <a href={`tel:${order.customer_phone}`} className="delivery-call-btn">
                    <Phone size={16} /> Call
                  </a>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.delivery_address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="delivery-map-btn"
                  >
                    <Navigation size={16} /> Map
                  </a>
                </div>

                <div style={{ marginTop: '16px' }}>
                  {order.status === 'packed' && (
                    <button 
                      className="delivery-btn delivery-btn-primary"
                      onClick={() => handleUpdateStatus(order.id, 'picked_up')}
                      disabled={updatingId === order.id}
                    >
                      {updatingId === order.id ? 'Updating...' : 'Pick Up Order'}
                    </button>
                  )}
                  
                  {(order.status === 'assigned' || order.status === 'picked_up' || order.status === 'in_transit') && (
                    <button 
                      className="delivery-btn delivery-btn-success"
                      onClick={() => handleUpdateStatus(order.id, 'delivered')}
                      disabled={updatingId === order.id}
                    >
                      {updatingId === order.id ? 'Updating...' : 'Mark Delivered'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
