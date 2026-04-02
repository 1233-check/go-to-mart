import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Clock, IndianRupee, TrendingUp, Package, Wallet, X, ChevronDown, ChevronUp } from 'lucide-react'
import { requestRiderCashout } from '../../lib/razorpay'

export default function DeliveryHistory() {
  const { profile } = useAuth()
  const [deliveries, setDeliveries] = useState([])
  const [earnings, setEarnings] = useState([])
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('today')

  // Cashout modal state
  const [showCashout, setShowCashout] = useState(false)
  const [cashoutAmount, setCashoutAmount] = useState('')
  const [payoutMethod, setPayoutMethod] = useState('upi')
  const [upiId, setUpiId] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [ifsc, setIfsc] = useState('')
  const [accountHolderName, setAccountHolderName] = useState('')
  const [cashoutLoading, setCashoutLoading] = useState(false)
  const [cashoutError, setCashoutError] = useState('')
  const [cashoutSuccess, setCashoutSuccess] = useState('')
  const [showPayoutHistory, setShowPayoutHistory] = useState(false)

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

      // Fetch payout history
      const { data: payoutsData } = await supabase
        .from('rider_payouts')
        .select('*')
        .eq('rider_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20)

      setDeliveries(orders || [])
      setEarnings(earningsData || [])
      setPayouts(payoutsData || [])
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

  // Available balance = pending earnings (not yet cashed out)
  const availableBalance = earnings
    .filter(e => e.status === 'pending')
    .reduce((s, e) => s + Number(e.total_earned || 0), 0)

  const formatDate = (d) => {
    const date = new Date(d)
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  const handleCashout = async () => {
    setCashoutError('')
    setCashoutSuccess('')

    const amount = Number(cashoutAmount)
    if (!amount || amount <= 0) {
      setCashoutError('Enter a valid amount')
      return
    }
    if (amount > availableBalance) {
      setCashoutError(`Insufficient balance. Available: ₹${availableBalance.toFixed(0)}`)
      return
    }
    if (amount < 10) {
      setCashoutError('Minimum cashout amount is ₹10')
      return
    }

    // Validate payment details
    if (payoutMethod === 'upi' && !upiId.trim()) {
      setCashoutError('Enter your UPI ID')
      return
    }
    if (payoutMethod === 'bank_transfer') {
      if (!accountNumber.trim() || !ifsc.trim() || !accountHolderName.trim()) {
        setCashoutError('Fill in all bank details')
        return
      }
    }

    setCashoutLoading(true)
    try {
      const accountDetails = payoutMethod === 'upi'
        ? { upi_id: upiId.trim() }
        : { account_number: accountNumber.trim(), ifsc: ifsc.trim(), account_holder_name: accountHolderName.trim() }

      const result = await requestRiderCashout(amount, payoutMethod, accountDetails)

      setCashoutSuccess(result.message || 'Cashout request submitted!')
      setCashoutAmount('')
      setUpiId('')
      setAccountNumber('')
      setIfsc('')
      setAccountHolderName('')

      // Refresh data
      const { data: earningsData } = await supabase
        .from('rider_earnings')
        .select('*')
        .eq('rider_id', profile.id)
        .order('created_at', { ascending: false })
      setEarnings(earningsData || [])

      const { data: payoutsData } = await supabase
        .from('rider_payouts')
        .select('*')
        .eq('rider_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20)
      setPayouts(payoutsData || [])

      // Close modal after 2s
      setTimeout(() => {
        setShowCashout(false)
        setCashoutSuccess('')
      }, 2500)
    } catch (err) {
      setCashoutError(err.message || 'Cashout failed')
    } finally {
      setCashoutLoading(false)
    }
  }

  const getPayoutStatusStyle = (status) => {
    switch (status) {
      case 'completed': return { bg: 'rgba(34,197,94,0.1)', color: '#22c55e', label: '✅ Completed' }
      case 'processing': return { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', label: '⏳ Processing' }
      case 'requested': return { bg: 'rgba(251,191,36,0.1)', color: '#fbbf24', label: '📝 Requested' }
      case 'failed': return { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', label: '❌ Failed' }
      case 'rejected': return { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', label: '❌ Rejected' }
      default: return { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8', label: status }
    }
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
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

      {/* Available Balance + Cashout Button */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 16px', background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.1))',
        borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(34,197,94,0.2)',
      }}>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>Available Balance</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#22c55e' }}>₹{availableBalance.toFixed(0)}</div>
        </div>
        <button
          onClick={() => { setShowCashout(true); setCashoutError(''); setCashoutSuccess(''); setCashoutAmount(String(availableBalance > 0 ? availableBalance : '')) }}
          disabled={availableBalance < 10}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: availableBalance >= 10 ? 'pointer' : 'not-allowed',
            background: availableBalance >= 10 ? '#22c55e' : 'rgba(255,255,255,0.08)',
            color: availableBalance >= 10 ? '#fff' : '#64748b',
            fontWeight: 700, fontSize: '14px',
            transition: 'all 0.2s', opacity: availableBalance >= 10 ? 1 : 0.5,
          }}
        >
          <Wallet size={18} /> Cash Out
        </button>
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

      {/* Payout History Toggle */}
      {payouts.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setShowPayoutHistory(!showPayoutHistory)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
              padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px',
              border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600,
            }}
          >
            <span>💰 Payout History ({payouts.length})</span>
            {showPayoutHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showPayoutHistory && (
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {payouts.map(p => {
                const style = getPayoutStatusStyle(p.status)
                return (
                  <div key={p.id} style={{
                    padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>₹{Number(p.amount).toFixed(0)}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                        {p.payout_method === 'upi' ? `UPI: ${p.account_details?.upi_id || ''}` : 'Bank Transfer'}
                        <span style={{ marginLeft: '8px' }}><Clock size={10} style={{ marginRight: '2px' }} />{formatDate(p.created_at)}</span>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px',
                      background: style.bg, color: style.color,
                    }}>
                      {style.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

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

      {/* ========== CASHOUT MODAL ========== */}
      {showCashout && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }} onClick={() => setShowCashout(false)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '480px', background: '#1e293b', borderRadius: '20px 20px 0 0',
              padding: '20px', maxHeight: '85vh', overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fff' }}>💰 Cash Out</h3>
              <button onClick={() => setShowCashout(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={22} />
              </button>
            </div>

            {/* Available Balance */}
            <div style={{
              padding: '14px', background: 'rgba(34,197,94,0.1)', borderRadius: '12px', marginBottom: '16px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Available Balance</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#22c55e' }}>₹{availableBalance.toFixed(0)}</div>
            </div>

            {/* Amount */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', display: 'block', marginBottom: '6px' }}>Amount to Withdraw</label>
              <input
                type="number"
                value={cashoutAmount}
                onChange={e => setCashoutAmount(e.target.value)}
                placeholder="Enter amount"
                style={{
                  width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #334155',
                  background: '#0f172a', color: '#fff', fontSize: '16px', fontWeight: 600, outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Payout Method */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', display: 'block', marginBottom: '6px' }}>Payout Method</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setPayoutMethod('upi')}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                    background: payoutMethod === 'upi' ? '#22c55e' : 'rgba(255,255,255,0.08)',
                    color: payoutMethod === 'upi' ? '#fff' : '#94a3b8', fontWeight: 600, fontSize: '13px',
                  }}
                >
                  📱 UPI
                </button>
                <button
                  onClick={() => setPayoutMethod('bank_transfer')}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                    background: payoutMethod === 'bank_transfer' ? '#22c55e' : 'rgba(255,255,255,0.08)',
                    color: payoutMethod === 'bank_transfer' ? '#fff' : '#94a3b8', fontWeight: 600, fontSize: '13px',
                  }}
                >
                  🏦 Bank Transfer
                </button>
              </div>
            </div>

            {/* UPI Input */}
            {payoutMethod === 'upi' && (
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', display: 'block', marginBottom: '6px' }}>UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  style={{
                    width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #334155',
                    background: '#0f172a', color: '#fff', fontSize: '14px', outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            {/* Bank Transfer Inputs */}
            {payoutMethod === 'bank_transfer' && (
              <>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', display: 'block', marginBottom: '4px' }}>Account Holder Name</label>
                  <input type="text" value={accountHolderName} onChange={e => setAccountHolderName(e.target.value)} placeholder="Full name" style={{
                    width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155',
                    background: '#0f172a', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                  }} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', display: 'block', marginBottom: '4px' }}>Account Number</label>
                  <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="Account number" style={{
                    width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155',
                    background: '#0f172a', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                  }} />
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', display: 'block', marginBottom: '4px' }}>IFSC Code</label>
                  <input type="text" value={ifsc} onChange={e => setIfsc(e.target.value)} placeholder="e.g. SBIN0001234" style={{
                    width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155',
                    background: '#0f172a', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                  }} />
                </div>
              </>
            )}

            {/* Error / Success */}
            {cashoutError && (
              <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>
                ⚠️ {cashoutError}
              </div>
            )}
            {cashoutSuccess && (
              <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(34,197,94,0.1)', color: '#22c55e', fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>
                ✅ {cashoutSuccess}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleCashout}
              disabled={cashoutLoading || !!cashoutSuccess}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: cashoutLoading ? 'wait' : 'pointer',
                background: cashoutSuccess ? '#22c55e' : '#22c55e', color: '#fff',
                fontSize: '16px', fontWeight: 700, opacity: cashoutLoading ? 0.6 : 1,
                transition: 'all 0.2s',
              }}
            >
              {cashoutLoading ? '⏳ Processing...' : cashoutSuccess ? '✅ Done!' : `Withdraw ₹${cashoutAmount || '0'}`}
            </button>

            <p style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', marginTop: '10px', margin: '10px 0 0' }}>
              Payouts are processed within 24-48 hours
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
