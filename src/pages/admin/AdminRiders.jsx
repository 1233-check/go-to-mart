import { useState, useEffect } from 'react'
import { Bike, Plus, Phone, Mail, Calendar, Package, CheckCircle, XCircle, Search, UserPlus } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function AdminRiders() {
  const [riders, setRiders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAppoint, setShowAppoint] = useState(false)
  const [searchPhone, setSearchPhone] = useState('')
  const [foundUser, setFoundUser] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [riderStats, setRiderStats] = useState({})
  const [riderEarnings, setRiderEarnings] = useState({})
  const [pendingPayouts, setPendingPayouts] = useState([])

  const fetchRiders = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'delivery_partner')
      .order('created_at', { ascending: false })
    
    // Fetch delivery stats for each rider
    const statsMap = {}
    if (data) {
      for (const rider of data) {
        const { count: totalDeliveries } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('delivery_partner_id', rider.id)
          .eq('status', 'delivered')

        const { count: activeOrders } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('delivery_partner_id', rider.id)
          .in('status', ['assigned', 'picked_up', 'in_transit'])

        statsMap[rider.id] = {
          totalDeliveries: totalDeliveries || 0,
          activeOrders: activeOrders || 0,
        }
      }
    }

    setRiderStats(statsMap)
    setRiders(data || [])

    // Fetch earnings for all riders
    const earningsMap = {}
    if (data) {
      for (const rider of data) {
        const { data: earningsData } = await supabase
          .from('rider_earnings')
          .select('total_earned, status')
          .eq('rider_id', rider.id)

        const totalEarned = (earningsData || []).reduce((s, e) => s + Number(e.total_earned || 0), 0)
        const pendingBalance = (earningsData || []).filter(e => e.status === 'pending').reduce((s, e) => s + Number(e.total_earned || 0), 0)

        earningsMap[rider.id] = { totalEarned, pendingBalance }
      }
    }
    setRiderEarnings(earningsMap)

    // Fetch pending payouts
    const { data: payoutsData } = await supabase
      .from('rider_payouts')
      .select('*')
      .in('status', ['requested', 'processing'])
      .order('created_at', { ascending: false })
    setPendingPayouts(payoutsData || [])

    setLoading(false)
  }

  useEffect(() => { fetchRiders() }, [])

  const handleSearch = async () => {
    if (!searchPhone.trim()) return
    setSearchLoading(true)
    setSearchError('')
    setFoundUser(null)

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`phone.eq.${searchPhone.trim()},email.eq.${searchPhone.trim()}`)
      .single()

    if (error || !data) {
      setSearchError('No user found with that phone or email.')
    } else if (data.role === 'delivery_partner') {
      setSearchError('This user is already a delivery partner.')
    } else {
      setFoundUser(data)
    }
    setSearchLoading(false)
  }

  const handleAppoint = async () => {
    if (!foundUser) return
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'delivery_partner' })
      .eq('id', foundUser.id)

    if (!error) {
      setShowAppoint(false)
      setFoundUser(null)
      setSearchPhone('')
      fetchRiders()
    }
  }

  const handleRemoveRider = async (riderId) => {
    if (!confirm('Remove this rider? They will revert to a regular customer.')) return
    await supabase
      .from('profiles')
      .update({ role: 'customer' })
      .eq('id', riderId)
    fetchRiders()
  }

  if (loading) return <div className="loader"><div className="spinner" /></div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 className="admin-title" style={{ margin: 0 }}>Delivery Riders</h1>
        <button
          onClick={() => setShowAppoint(!showAppoint)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#10b981', color: 'white', border: 'none',
            borderRadius: '8px', padding: '10px 20px', fontSize: '14px',
            fontWeight: 600, cursor: 'pointer',
          }}
        >
          <UserPlus size={18} /> Appoint New Rider
        </button>
      </div>

      {/* Appoint Rider Panel */}
      {showAppoint && (
        <div className="admin-card" style={{ marginBottom: '24px', border: '1px solid #10b981' }}>
          <div className="admin-card-header">
            <h3 className="admin-card-title">Appoint New Delivery Rider</h3>
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
              Search by phone number or email. The user must already have an account.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Phone number or email..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: '8px',
                  border: '1px solid #334155', background: '#1e293b',
                  color: 'white', fontSize: '14px', outline: 'none',
                }}
              />
              <button
                onClick={handleSearch}
                disabled={searchLoading}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: '#3b82f6', color: 'white', border: 'none',
                  borderRadius: '8px', padding: '10px 16px', cursor: 'pointer',
                  fontSize: '14px', fontWeight: 600,
                }}
              >
                <Search size={16} /> Search
              </button>
            </div>

            {searchError && (
              <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>{searchError}</p>
            )}

            {foundUser && (
              <div style={{
                background: '#1e293b', borderRadius: '8px', padding: '16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <p style={{ fontWeight: 700, color: 'white', margin: 0 }}>{foundUser.full_name || 'Unnamed User'}</p>
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0' }}>
                    {foundUser.phone || foundUser.email} · Current role: <strong>{foundUser.role}</strong>
                  </p>
                </div>
                <button
                  onClick={handleAppoint}
                  style={{
                    background: '#10b981', color: 'white', border: 'none',
                    borderRadius: '8px', padding: '10px 20px', cursor: 'pointer',
                    fontWeight: 600, fontSize: '14px',
                  }}
                >
                  Appoint as Rider
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rider Stats Summary */}
      <div className="admin-stats-grid" style={{ marginBottom: '24px' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-title">Total Riders</span>
            <div className="admin-stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
              <Bike size={24} color="#10b981" />
            </div>
          </div>
          <div className="admin-stat-value">{riders.length}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-title">Active Riders</span>
            <div className="admin-stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
              <CheckCircle size={24} color="#3b82f6" />
            </div>
          </div>
          <div className="admin-stat-value">{riders.filter(r => r.is_active).length}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-title">Total Deliveries</span>
            <div className="admin-stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
              <Package size={24} color="#f59e0b" />
            </div>
          </div>
          <div className="admin-stat-value">
            {Object.values(riderStats).reduce((sum, s) => sum + s.totalDeliveries, 0)}
          </div>
        </div>
      </div>

      {/* Pending Payouts Alert */}
      {pendingPayouts.length > 0 && (
        <div className="admin-card" style={{ marginBottom: '24px', border: '1px solid #f59e0b' }}>
          <div className="admin-card-header">
            <h3 className="admin-card-title">💰 Pending Payout Requests ({pendingPayouts.length})</h3>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Rider</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Requested</th>
                </tr>
              </thead>
              <tbody>
                {pendingPayouts.map(p => {
                  const rider = riders.find(r => r.id === p.rider_id)
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{rider?.full_name || 'Unknown'}</td>
                      <td style={{ fontWeight: 700, color: '#22c55e' }}>₹{Number(p.amount).toFixed(0)}</td>
                      <td>{p.payout_method === 'upi' ? `UPI: ${p.account_details?.upi_id || ''}` : 'Bank'}</td>
                      <td>
                        <span className="admin-badge" style={{
                          backgroundColor: p.status === 'processing' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)',
                          color: p.status === 'processing' ? '#3b82f6' : '#f59e0b'
                        }}>
                          {p.status === 'processing' ? '⏳ Processing' : '📝 Requested'}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Riders Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">All Delivery Riders ({riders.length})</h3>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Deliveries</th>
                <th>Earnings</th>
                <th>Active Orders</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {riders.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>No delivery riders yet. Appoint one above!</td></tr>
              ) : (
                riders.map(r => {
                  const stat = riderStats[r.id] || { totalDeliveries: 0, activeOrders: 0 }
                  return (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>{r.full_name || 'Unnamed'}</td>
                      <td>{r.phone || r.email || '—'}</td>
                      <td>{new Date(r.created_at).toLocaleDateString()}</td>
                      <td>{stat.totalDeliveries}</td>
                      <td>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#22c55e' }}>₹{(riderEarnings[r.id]?.totalEarned || 0).toFixed(0)}</div>
                        {(riderEarnings[r.id]?.pendingBalance || 0) > 0 && (
                          <div style={{ fontSize: '10px', color: '#f59e0b', marginTop: '2px' }}>₹{riderEarnings[r.id].pendingBalance.toFixed(0)} pending</div>
                        )}
                      </td>
                      <td>
                        {stat.activeOrders > 0 ? (
                          <span className="admin-badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                            {stat.activeOrders} active
                          </span>
                        ) : '—'}
                      </td>
                      <td>
                        <span className="admin-badge" style={{
                          backgroundColor: r.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: r.is_active ? '#10b981' : '#ef4444'
                        }}>
                          {r.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleRemoveRider(r.id)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none',
                            borderRadius: '6px', padding: '6px 12px', cursor: 'pointer',
                            fontSize: '12px', fontWeight: 600,
                          }}
                        >
                          Remove
                        </button>
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
