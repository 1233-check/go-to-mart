import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Clock, CheckSquare } from 'lucide-react'

// Staff focuses on initial fulfillment
const TABS = [
  { id: 'placed', label: 'New Orders' },
  { id: 'packing', label: 'Packing' },
  { id: 'packed', label: 'Ready for Pickup' }
]

export default function StoreOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('placed')
  const [updatingId, setUpdatingId] = useState(null)

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, order_number, created_at, status, total,
          order_items ( id, quantity, price, product:products(name, unit) )
        `)
        .in('status', ['placed', 'confirmed', 'packing', 'packed'])
        .order('created_at', { ascending: false })
      
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
    
    // Set up realtime subscription for new incoming orders
    const channel = supabase
      .channel('store_orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
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
        .update({ status: newStatus })
        .eq('id', orderId)
      
      if (error) throw error
      // Local optimistic update
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    } catch (err) {
      alert("Failed to update status")
    } finally {
      setUpdatingId(null)
    }
  }

  // Treat 'confirmed' as 'placed' for the staff view to simplify
  const displayStatus = (status) => status === 'confirmed' ? 'placed' : status
  
  const filteredOrders = orders.filter(o => displayStatus(o.status) === activeTab)

  const getTimeAgo = (dateStr) => {
    const min = Math.floor((new Date() - new Date(dateStr)) / 60000)
    if (min < 60) return `${min}m ago`
    return `${Math.floor(min/60)}h ${min%60}m ago`
  }

  if (loading) return <div className="loader"><div className="spinner" /></div>

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 16px 0' }}>Order Fulfillment</h2>
      
      <div className="store-tabs">
        {TABS.map(tab => (
          <div 
            key={tab.id}
            className={`store-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.id === 'placed' && orders.filter(o => displayStatus(o.status) === 'placed').length > 0 && (
              <span style={{ marginLeft: '6px', background: '#ef4444', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '11px' }}>
                {orders.filter(o => displayStatus(o.status) === 'placed').length}
              </span>
            )}
          </div>
        ))}
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
                    {order.order_items.length} items • ₹{Number(order.total).toFixed(0)}
                  </div>
                </div>
                <div className="store-order-time">
                  <Clock size={14} />
                  <span style={{ color: Math.floor((new Date() - new Date(order.created_at)) / 60000) > 15 ? '#ef4444' : 'inherit' }}>
                    {getTimeAgo(order.created_at)}
                  </span>
                </div>
              </div>
              
              <div className="store-order-body">
                <div className="store-order-items-preview">
                  {order.order_items.map((item, i) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span><strong>{item.quantity}x</strong> {item.product?.name}</span>
                      <span style={{ color: '#94a3b8' }}>{item.product?.unit}</span>
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
                    {updatingId === order.id ? 'Updating...' : 'Mark as Ready for Pickup'}
                  </button>
                )}
                
                {activeTab === 'packed' && (
                  <div style={{ textAlign: 'center', padding: '12px', background: '#f1f5f9', borderRadius: '8px', color: '#475569', fontSize: '14px', fontWeight: 500 }}>
                    Waiting for Delivery Partner
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
