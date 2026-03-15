import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { CheckCircle2 } from 'lucide-react'

export default function DeliveryHistory() {
  const { profile } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      if (!profile?.id) return
      try {
        // Fetch earnings and order details for this rider
        const { data, error } = await supabase
          .from('rider_earnings')
          .select(`
            id, delivery_fee_earned, tip_earned, total_earned, created_at, status,
            orders ( order_number )
          `)
          .eq('rider_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(50)
        
        if (error) throw error
        setHistory(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchHistory()
  }, [profile?.id])

  if (loading) return <div className="loader"><div className="spinner" /></div>

  // Calculate earnings
  const today = new Date().toLocaleDateString()
  const todaysEarningsList = history.filter(e => new Date(e.created_at).toLocaleDateString() === today)
  const todayEarnedNum = todaysEarningsList.reduce((acc, curr) => acc + Number(curr.total_earned || 0), 0)
  const totalEarnedNum = history.reduce((acc, curr) => acc + Number(curr.total_earned || 0), 0)

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 24px 0', color: '#f8fafc' }}>Earnings Dashboard</h2>

      <div style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '4px' }}>Today's Earnings</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>₹{todayEarnedNum.toFixed(0)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '4px' }}>Total Payouts</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#f8fafc' }}>₹{totalEarnedNum.toFixed(0)}</div>
        </div>
      </div>

      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc', marginBottom: '16px' }}>Payout History</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b' }}>
            No earnings records yet.
          </div>
        ) : (
          history.map(earning => (
            <div key={earning.id} style={{ background: '#111111', padding: '16px', borderRadius: '12px', border: '1px solid #333333', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 600, color: '#f8fafc' }}>Order #{earning.orders?.order_number || 'Unknown'}</div>
                <div style={{ color: '#10b981', fontWeight: 700, fontSize: '16px' }}>+₹{earning.total_earned}</div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', paddingBottom: '8px', borderBottom: '1px solid #222' }}>
                <span>Delivery Fee: ₹{earning.delivery_fee_earned}</span>
                <span>Tip: ₹{earning.tip_earned}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', paddingTop: '4px' }}>
                <span>{new Date(earning.created_at).toLocaleString()}</span>
                <span style={{ color: earning.status === 'paid' ? '#3b82f6' : '#f59e0b' }}>
                  {earning.status === 'paid' ? 'Paid out' : 'Pending Wallet'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
