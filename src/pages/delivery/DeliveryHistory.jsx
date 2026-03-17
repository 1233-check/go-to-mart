import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Clock, IndianRupee, TrendingUp, Package } from 'lucide-react'

export default function DeliveryHistory() {
  const { profile } = useAuth()
  const [deliveries, setDeliveries] = useState([])
  const [earnings, setEarnings] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('today')

  useEffect(() => {
    if (!profile?.id) return
    const fetchData = async () => {
      // Fetch completed deliveries
      const { data: orders } = await supabase
        .from('orders')
        .select('id, order_number, created_at, total, delivery_fee, rider_tip, payment_method, customer_name, delivery_address')
        .eq('delivery_partner_id', profile.id)
        .eq('status', 'delivered')
        .order('created_at', { ascending: false })
        .limit(50)

      // Fetch earnings
      const { data: earningsData } = await supabase
        .from('rider_earnings')
        .select('*')
        .eq('rider_id', profile.id)
        .order('created_at', { ascending: false })

      setDeliveries(orders || [])
      setEarnings(earningsData || [])
      setLoading(false)
    }
    fetchData()
  }, [profile?.id])

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 7)

  const filterByPeriod = (items) => {
    if (period === 'today') return items.filter(e => new Date(e.created_at) >= todayStart)
    if (period === 'week') return items.filter(e => new Date(e.created_at) >= weekStart)
    return items
  }

  const filteredEarnings = filterByPeriod(earnings)
  const filteredDeliveries = filterByPeriod(deliveries)

  const totalEarned = filteredEarnings.reduce((s, e) => s + Number(e.total_earned || 0), 0)
  const totalFees = filteredEarnings.reduce((s, e) => s + Number(e.delivery_fee_earned || 0), 0)
  const totalTips = filteredEarnings.reduce((s, e) => s + Number(e.tip_earned || 0), 0)

  const formatDate = (d) => {
    const date = new Date(d)
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  if (loading) return <div className="loader"><div className="spinner" /></div>

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 16px 0', color: '#fbbf24' }}>Earnings & History</h2>

      {/* Period Toggle */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        {[{ id: 'today', label: 'Today' }, { id: 'week', label: 'This Week' }, { id: 'all', label: 'All Time' }].map(p => (
          <button key={p.id} onClick={() => setPeriod(p.id)} style={{
            padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
            background: period === p.id ? '#fbbf24' : 'rgba(255,255,255,0.08)',
            color: period === p.id ? '#000' : '#94a3b8'
          }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Earnings Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '20px' }}>
        <div style={{ padding: '12px', background: 'rgba(34,197,94,0.1)', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#22c55e' }}>₹{totalEarned.toFixed(0)}</div>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>Total Earned</div>
        </div>
        <div style={{ padding: '12px', background: 'rgba(59,130,246,0.1)', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#3b82f6' }}>₹{totalFees.toFixed(0)}</div>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>Delivery Fees</div>
        </div>
        <div style={{ padding: '12px', background: 'rgba(251,191,36,0.1)', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#fbbf24' }}>₹{totalTips.toFixed(0)}</div>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>Tips Earned</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <div style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={18} color="#fbbf24" />
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{filteredDeliveries.length}</div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>Deliveries</div>
          </div>
        </div>
        <div style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} color="#22c55e" />
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              ₹{filteredDeliveries.length > 0 ? (totalEarned / filteredDeliveries.length).toFixed(0) : 0}
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>Avg per Delivery</div>
          </div>
        </div>
      </div>

      {/* Delivery List */}
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 10px 0' }}>Recent Deliveries</h3>
      {filteredDeliveries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px', color: '#64748b', fontSize: '14px' }}>
          No deliveries in this period yet.
        </div>
      ) : (
        filteredDeliveries.map(d => {
          const earned = (Number(d.delivery_fee) || 0) + (Number(d.rider_tip) || 0)
          return (
            <div key={d.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', marginBottom: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>#{d.order_number}</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#22c55e' }}>+₹{earned.toFixed(0)}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                <span>{d.customer_name}</span>
                <span><Clock size={10} style={{ marginRight: '3px' }} />{formatDate(d.created_at)}</span>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
