import { useState, useEffect } from 'react'
import { DollarSign, ShoppingBag, Users, Package } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeUsers: 0,
    activeProducts: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const { count: uCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
        const { count: pCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true)
        const { count: oCount } = await supabase.from('orders').select('*', { count: 'exact', head: true })
        
        // Fetch all orders for revenue calculation
        const { data: oData } = await supabase.from('orders')
          .select('total')
          .neq('status', 'cancelled')
        
        const totalRevenue = oData?.reduce((s, o) => s + Number(o.total), 0) || 0
        
        // Recent orders for the table display
        const { data: recentData } = await supabase.from('orders')
          .select('id, total, status, customer_name, order_number, created_at')
          .order('created_at', { ascending: false })
          .limit(5)
        
        setStats({
          totalRevenue,
          totalOrders: oCount || 0,
          activeUsers: uCount || 0,
          activeProducts: pCount || 0
        })
        
        setRecentOrders(recentData || [])
      } catch (err) {
        console.error('Fetch stats err:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <div className="loader"><div className="spinner" /></div>

  const statCards = [
    { title: 'Total Revenue', value: `₹${stats.totalRevenue.toFixed(0)}`, icon: DollarSign, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
    { title: 'Active Products', value: stats.activeProducts, icon: Package, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    { title: 'Total Users', value: stats.activeUsers, icon: Users, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
  ]

  const getStatusColor = (status) => {
    if (status === 'delivered') return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }
    if (status === 'cancelled') return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }
    if (status === 'placed') return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }
    return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }
  }

  return (
    <div>
      <h1 className="admin-title">Dashboard Overview</h1>
      
      <div className="admin-stats-grid">
        {statCards.map((s, i) => (
          <div key={i} className="admin-stat-card">
            <div className="admin-stat-top">
              <span className="admin-stat-title">{s.title}</span>
              <div className="admin-stat-icon" style={{ backgroundColor: s.bg }}>
                <s.icon size={24} color={s.color} />
              </div>
            </div>
            <div className="admin-stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Recent Orders</h3>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>No orders found</td></tr>
              ) : (
                recentOrders.map(o => {
                  const sColor = getStatusColor(o.status)
                  return (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 600 }}>{o.order_number}</td>
                      <td>{o.customer_name}</td>
                      <td>{new Date(o.created_at).toLocaleDateString()}</td>
                      <td>₹{Number(o.total).toFixed(0)}</td>
                      <td>
                        <span className="admin-badge" style={{ backgroundColor: sColor.bg, color: sColor.color }}>
                          {o.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
