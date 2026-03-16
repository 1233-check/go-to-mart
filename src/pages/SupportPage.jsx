import { useState, useEffect } from 'react'
import { ArrowLeft, Send, CheckCircle, Clock, MessageSquare, Package } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function SupportPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchData = async () => {
    if (!user) return
    const [compRes, ordRes] = await Promise.all([
      supabase.from('complaints').select('*, orders(order_number, total, created_at)')
        .eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('orders').select('id, order_number, total, status, created_at')
        .eq('customer_id', user.id).order('created_at', { ascending: false })
    ])
    setComplaints(compRes.data || [])
    setOrders(ordRes.data || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) return
    setSubmitting(true)
    
    await supabase.from('complaints').insert([{
      user_id: user.id,
      order_id: selectedOrder || null,
      subject: subject.trim(),
      message: message.trim(),
    }])

    setSubject('')
    setMessage('')
    setSelectedOrder(null)
    setShowNew(false)
    setSubmitting(false)
    fetchData()
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: '8px',
    border: '1px solid var(--border)', fontSize: '14px',
    outline: 'none', fontFamily: 'inherit',
    background: 'var(--surface-2)', color: 'var(--text-primary)',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-3)', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{
        background: 'var(--primary)', padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: '12px',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={24} color="white" />
        </button>
        <h1 style={{ color: 'white', fontSize: '18px', fontWeight: 700, margin: 0 }}>Help & Support</h1>
      </div>

      <div style={{ padding: '16px 20px' }}>
        {/* New Complaint Button */}
        {!showNew && (
          <button
            onClick={() => setShowNew(true)}
            style={{
              width: '100%', padding: '14px', border: 'none', borderRadius: '12px',
              background: 'var(--primary)', color: 'white', fontSize: '15px',
              fontWeight: 600, cursor: 'pointer', marginBottom: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            <MessageSquare size={18} /> Raise a Complaint
          </button>
        )}

        {/* New Complaint Form */}
        {showNew && (
          <form onSubmit={handleSubmit} style={{
            background: 'var(--surface)', borderRadius: '12px', padding: '20px',
            boxShadow: 'var(--shadow-sm)', marginBottom: '20px',
            border: '1px solid var(--border)',
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              New Complaint
            </h3>

            {/* Order Selection */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                Select Order (optional)
              </label>
              {orders.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>No orders yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {orders.map(o => (
                    <button key={o.id} type="button" onClick={() => setSelectedOrder(selectedOrder === o.id ? null : o.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                        border: selectedOrder === o.id ? '2px solid var(--brand)' : '1px solid var(--border)',
                        background: selectedOrder === o.id ? 'var(--brand-light)' : 'var(--surface-2)',
                        textAlign: 'left',
                      }}>
                      <Package size={16} color={selectedOrder === o.id ? 'var(--brand)' : 'var(--text-muted)'} />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                          #{o.order_number}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                          ₹{Number(o.total).toFixed(0)} • {new Date(o.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '8px',
                        background: o.status === 'delivered' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                        color: o.status === 'delivered' ? '#10b981' : '#f59e0b',
                      }}>{o.status}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input
              type="text"
              placeholder="Subject (e.g. Wrong item delivered)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              style={{ ...inputStyle, marginBottom: '12px' }}
            />
            <textarea
              placeholder="Describe your issue in detail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              style={{ ...inputStyle, marginBottom: '12px', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" disabled={submitting}
                style={{
                  flex: 1, padding: '12px', border: 'none', borderRadius: '8px',
                  background: 'var(--primary)', color: 'white', fontSize: '14px',
                  fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}>
                <Send size={16} /> {submitting ? 'Submitting...' : 'Submit'}
              </button>
              <button type="button" onClick={() => setShowNew(false)}
                style={{
                  padding: '12px 20px', border: '1px solid var(--border)', borderRadius: '8px',
                  background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: '14px',
                  cursor: 'pointer',
                }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Complaints List */}
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
          Your Tickets ({complaints.length})
        </h3>

        {loading ? (
          <div className="loader"><div className="spinner" /></div>
        ) : complaints.length === 0 ? (
          <div style={{
            background: 'var(--surface)', borderRadius: '12px', padding: '32px 20px',
            textAlign: 'center', color: 'var(--text-muted)',
            boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)',
          }}>
            <MessageSquare size={40} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
            <p style={{ fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 4px' }}>No complaints yet</p>
            <p style={{ fontSize: '13px', margin: 0 }}>Raise one if you have any issues!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {complaints.map(c => (
              <div key={c.id} style={{
                background: 'var(--surface)', borderRadius: '12px', padding: '16px',
                boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>{c.subject}</span>
                  <span style={{
                    fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '12px',
                    background: c.status === 'resolved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: c.status === 'resolved' ? '#10b981' : '#f59e0b',
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}>
                    {c.status === 'resolved' ? <CheckCircle size={12} /> : <Clock size={12} />}
                    {c.status}
                  </span>
                </div>

                {/* Order reference */}
                {c.orders && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    fontSize: '12px', color: 'var(--brand)', fontWeight: 600,
                    background: 'var(--brand-light)', padding: '4px 10px', borderRadius: '6px',
                    marginBottom: '8px',
                  }}>
                    <Package size={12} /> Order #{c.orders.order_number}
                  </div>
                )}

                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 8px' }}>
                  {c.message}
                </p>
                {c.admin_response && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', padding: '12px',
                    borderLeft: '3px solid #10b981',
                  }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#10b981', margin: '0 0 4px' }}>Admin Response</p>
                    <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>{c.admin_response}</p>
                  </div>
                )}
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '8px 0 0' }}>
                  {new Date(c.created_at).toLocaleDateString()} • {new Date(c.created_at).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
