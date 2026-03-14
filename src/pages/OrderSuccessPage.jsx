import { Link, useLocation } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'

export default function OrderSuccessPage() {
  const { state } = useLocation()

  return (
    <div className="page-content">
      <div className="order-success">
        <div className="order-success-icon">✅</div>
        <h1>Order Placed!</h1>
        <p>
          Your order <strong>{state?.orderNumber || ''}</strong> has been placed successfully.
          {state?.total && <> Total: <strong>₹{Number(state.total).toFixed(0)}</strong></>}
        </p>
        <p style={{ marginTop: '8px', fontSize: '13px', color: '#666' }}>
          Estimated delivery: 30-45 minutes
        </p>
        <Link to="/" className="empty-state-btn" style={{ marginTop: '24px' }}>
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
