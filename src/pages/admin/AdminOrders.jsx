import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Search } from 'lucide-react'

const ALL_STATUSES = [
  'placed', 'confirmed', 'packing', 'packed', 
  'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'
]

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          delivery_partner:profiles!orders_delivery_partner_id_fkey(full_name, phone)
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      console.error(err)
      alert("Error fetching orders")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
      
      if (error) throw error
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    } catch (err) {
      console.error(err)
      alert("Failed to update status")
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredOrders = orders.filter(o => 
    (filter === 'all' || o.status === filter) &&
    (search === '' || 
      o.order_number.toLowerCase().includes(search.toLowerCase()) || 
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone?.includes(search)
    )
  )

  const getStatusBg = (status) => {
    if (status === 'delivered') return '#10b981' // emerald
    if (status === 'cancelled') return '#ef4444' // red
    if (status === 'placed') return '#f59e0b' // amber
    if (status === 'in_transit' || status === 'picked_up') return '#f97316' // orange
    return '#3b82f6' // blue default
  }

  if (loading) return <div className="loader"><div className="spinner" /></div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="admin-title" style={{ margin: 0 }}>Manage Orders</h1>
      </div>

      <div className="admin-card">
        <div className="admin-card-header" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#0f172a', padding: '8px 16px', borderRadius: '8px', border: '1px solid #334155', flex: 1, minWidth: '200px' }}>
            <Search size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search order ID, name, or phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', marginLeft: '8px', width: '100%' }}
            />
          </div>
          
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ background: '#0f172a', color: 'white', padding: '10px 16px', borderRadius: '8px', border: '1px solid #334155', outline: 'none', cursor: 'pointer' }}
          >
            <option value="all">All Statuses</option>
            {ALL_STATUSES.map(s => (
              <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Details</th>
                <th>Customer</th>
                <th>Amount / Items</th>
                <th>Status Management</th>
                <th>Assignment</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>No orders found matching criteria</td></tr>
              ) : (
                filteredOrders.map(o => (
                  <tr key={o.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>#{o.order_number}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(o.created_at).toLocaleString()}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                        {o.payment_method === 'cod' ? '💵 COD' : '💳 Online'}
                        {o.payment_method !== 'cod' && (
                          <span style={{
                            marginLeft: '6px', fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px',
                            background: o.payment_status === 'paid' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                            color: o.payment_status === 'paid' ? '#10b981' : '#f59e0b',
                          }}>
                            {o.payment_status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                          </span>
                        )}
                      </div>
                      {o.razorpay_payment_id && (
                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', fontFamily: 'monospace' }}>ID: {o.razorpay_payment_id}</div>
                      )}
                    </td>
                    <td>
                      <div style={{ color: '#f8fafc', marginBottom: '4px' }}>{o.customer_name}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{o.customer_phone}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', maxWidth: '200px' }}>{o.delivery_address}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>₹{Number(o.total).toFixed(0)}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{o.order_items?.length || 0} items</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                        <select 
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          disabled={updatingId === o.id}
                          style={{ 
                            background: getStatusBg(o.status), 
                            color: 'white', 
                            padding: '6px 12px', 
                            borderRadius: '6px', 
                            border: 'none',
                            outline: 'none',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 600,
                            opacity: updatingId === o.id ? 0.5 : 1
                          }}
                        >
                          {ALL_STATUSES.map(s => (
                            <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td>
                      {o.delivery_partner ? (
                        <>
                          <div style={{ color: '#f8fafc', fontSize: '13px' }}>{o.delivery_partner.full_name}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>{o.delivery_partner.phone}</div>
                        </>
                      ) : (
                        <span style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
