import { useState, useEffect } from 'react'
import { MessageSquare, CheckCircle, Clock, Send, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function AdminSupport() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [response, setResponse] = useState('')
  const [filter, setFilter] = useState('all') // all | open | resolved

  const fetchComplaints = async () => {
    setLoading(true)
    let query = supabase
      .from('complaints')
      .select('*, profiles(full_name, phone, email), orders(order_number, total)')
      .order('created_at', { ascending: false })

    if (filter === 'open') query = query.eq('status', 'open')
    if (filter === 'resolved') query = query.eq('status', 'resolved')

    const { data } = await query
    setComplaints(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchComplaints() }, [filter])

  const handleResolve = async (id) => {
    await supabase
      .from('complaints')
      .update({
        status: 'resolved',
        admin_response: response || 'Issue resolved by admin.',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    setResponse('')
    setExpandedId(null)
    fetchComplaints()
  }

  const getStatusStyle = (status) => {
    if (status === 'open') return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }
    if (status === 'in_progress') return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }
    return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }
  }

  if (loading) return <div className="loader"><div className="spinner" /></div>

  const openCount = complaints.filter(c => c.status === 'open').length

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 className="admin-title" style={{ margin: 0 }}>
          Support & Complaints
          {openCount > 0 && (
            <span style={{
              marginLeft: '12px', background: '#ef4444', color: 'white',
              borderRadius: '12px', padding: '2px 10px', fontSize: '14px',
              fontWeight: 700, verticalAlign: 'middle',
            }}>
              {openCount} open
            </span>
          )}
        </h1>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['all', 'open', 'resolved'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              background: filter === f ? '#3b82f6' : '#1e293b',
              color: filter === f ? 'white' : '#94a3b8',
              cursor: 'pointer', fontWeight: 600, fontSize: '13px',
              textTransform: 'capitalize',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="admin-stats-grid" style={{ marginBottom: '24px' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-title">Total Tickets</span>
            <div className="admin-stat-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
              <MessageSquare size={24} color="#8b5cf6" />
            </div>
          </div>
          <div className="admin-stat-value">{complaints.length}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-title">Open</span>
            <div className="admin-stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
              <Clock size={24} color="#f59e0b" />
            </div>
          </div>
          <div className="admin-stat-value">{openCount}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-title">Resolved</span>
            <div className="admin-stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
              <CheckCircle size={24} color="#10b981" />
            </div>
          </div>
          <div className="admin-stat-value">{complaints.filter(c => c.status === 'resolved').length}</div>
        </div>
      </div>

      {/* Complaints List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {complaints.length === 0 ? (
          <div className="admin-card" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
            No complaints found.
          </div>
        ) : (
          complaints.map(c => {
            const statusStyle = getStatusStyle(c.status)
            const isExpanded = expandedId === c.id
            return (
              <div key={c.id} className="admin-card" style={{ overflow: 'hidden' }}>
                <div
                  onClick={() => setExpandedId(isExpanded ? null : c.id)}
                  style={{
                    padding: '16px', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, color: 'white', fontSize: '15px' }}>{c.subject}</span>
                      <span className="admin-badge" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                        {c.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                      {c.profiles?.full_name || 'Anonymous'} · {c.profiles?.phone || c.profiles?.email || ''} · {new Date(c.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={18} color="#94a3b8" /> : <ChevronDown size={18} color="#94a3b8" />}
                </div>

                {isExpanded && (
                  <div style={{ padding: '0 16px 16px', borderTop: '1px solid #1e293b' }}>
                    <div style={{ padding: '12px 0' }}>
                      {c.orders && (
                        <p style={{ color: '#3b82f6', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
                          📦 Order #{c.orders.order_number} — ₹{Number(c.orders.total).toFixed(0)}
                        </p>
                      )}
                      <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Customer Message:</p>
                      <p style={{ color: '#e2e8f0', fontSize: '14px', lineHeight: 1.5 }}>{c.message}</p>
                    </div>

                    {c.admin_response && (
                      <div style={{ background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                        <p style={{ color: '#10b981', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Admin Response:</p>
                        <p style={{ color: '#e2e8f0', fontSize: '14px', lineHeight: 1.5 }}>{c.admin_response}</p>
                      </div>
                    )}

                    {c.status !== 'resolved' && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <input
                          placeholder="Type your response..."
                          value={expandedId === c.id ? response : ''}
                          onChange={(e) => setResponse(e.target.value)}
                          style={{
                            flex: 1, padding: '10px 14px', borderRadius: '8px',
                            border: '1px solid #334155', background: '#1e293b',
                            color: 'white', fontSize: '14px', outline: 'none',
                          }}
                        />
                        <button
                          onClick={() => handleResolve(c.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: '#10b981', color: 'white', border: 'none',
                            borderRadius: '8px', padding: '10px 16px', cursor: 'pointer',
                            fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap',
                          }}
                        >
                          <CheckCircle size={16} /> Resolve
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
