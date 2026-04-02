import { Link, useLocation } from 'react-router-dom'
import { CheckCircle, Heart, ShieldCheck } from 'lucide-react'
import { useState } from 'react'

export default function OrderSuccessPage() {
  const { state } = useLocation()
  const [tip, setTip] = useState(0)
  const isPaid = state?.paymentMethod === 'online'

  return (
    <div className="page-content">
      <div className="order-success">
        <div className="order-success-icon">✅</div>
        <h1>Order Placed!</h1>
        <p>
          Your order <strong>{state?.orderNumber || ''}</strong> has been placed successfully.
          {state?.total && <> Total: <strong>₹{Number(state.total).toFixed(0)}</strong></>}
        </p>

        {/* Payment Status Badge */}
        {isPaid ? (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '20px', marginTop: '8px',
            background: 'rgba(22,163,74,0.12)', color: '#16a34a', fontWeight: 600, fontSize: '13px',
          }}>
            <ShieldCheck size={16} /> Paid Online via Razorpay
          </div>
        ) : (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '20px', marginTop: '8px',
            background: 'rgba(217,119,6,0.12)', color: '#d97706', fontWeight: 600, fontSize: '13px',
          }}>
            💵 Cash on Delivery — Pay when delivered
          </div>
        )}

        <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
          Estimated delivery: 30-45 minutes
        </p>

        {/* Tip Section — only show for COD orders (online already had tip in cart) */}
        {!isPaid && (
          <div style={{ marginTop: '24px', width: '100%', maxWidth: '300px', textAlign: 'left', background: 'var(--surface-2)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Heart size={16} color="var(--brand)" />
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Tip your rider?</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              100% of the tip goes directly to your delivery partner.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {[10, 20, 50, 'Custom'].map(amt => (
                <button 
                  key={amt}
                  onClick={() => setTip(amt)}
                  style={{ 
                    flex: 1, 
                    padding: '8px 0', 
                    borderRadius: '16px', 
                    border: `1px solid ${tip === amt ? 'var(--brand)' : 'var(--border)'}`,
                    background: tip === amt ? 'var(--brand-light)' : 'var(--surface)',
                    color: tip === amt ? 'var(--brand)' : 'var(--text-secondary)',
                    fontWeight: '600',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {typeof amt === 'number' ? `₹${amt}` : amt}
                </button>
              ))}
            </div>
            {tip !== 0 && (
              <button style={{ width: '100%', padding: '10px', background: 'var(--brand)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                Add Tip {typeof tip === 'number' ? `₹${tip}` : ''}
              </button>
            )}
          </div>
        )}

        <Link to="/" className="empty-state-btn" style={{ marginTop: '24px' }}>
          Continue Shopping
        </Link>
        <Link to="/orders" style={{ display: 'block', marginTop: '12px', color: 'var(--brand)', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
          Track your order →
        </Link>
      </div>
    </div>
  )
}
