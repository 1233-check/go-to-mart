import { supabase } from './supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID

/**
 * Load Razorpay Checkout script dynamically
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.id = 'razorpay-script'
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

/**
 * Create a Razorpay order via Edge Function
 */
export async function createRazorpayOrder(orderId, amount) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const response = await fetch(`${SUPABASE_URL}/functions/v1/razorpay-create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ order_id: orderId, amount }),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'Failed to create payment order')
  }
  return data
}

/**
 * Verify Razorpay payment via Edge Function
 */
export async function verifyRazorpayPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const response = await fetch(`${SUPABASE_URL}/functions/v1/razorpay-verify-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    }),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'Payment verification failed')
  }
  return data
}

/**
 * Open Razorpay Checkout Modal
 * Returns a promise that resolves with payment details on success,
 * or rejects on failure/dismissal
 */
export function openRazorpayCheckout({ razorpayOrderId, amount, currency, keyId, customerName, customerPhone, customerEmail, orderNumber }) {
  return new Promise((resolve, reject) => {
    const options = {
      key: keyId || RAZORPAY_KEY_ID,
      amount,
      currency: currency || 'INR',
      name: 'Go-to-Mart',
      description: `Order ${orderNumber || ''}`,
      order_id: razorpayOrderId,
      prefill: {
        name: customerName || '',
        contact: customerPhone || '',
        email: customerEmail || '',
      },
      theme: {
        color: '#16a34a',
        backdrop_color: 'rgba(0,0,0,0.6)',
      },
      modal: {
        ondismiss: () => {
          reject(new Error('Payment cancelled by user'))
        },
        confirm_close: true,
        escape: true,
      },
      handler: (response) => {
        resolve({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        })
      },
    }

    const rzp = new window.Razorpay(options)

    rzp.on('payment.failed', (response) => {
      reject(new Error(response.error?.description || 'Payment failed'))
    })

    rzp.open()
  })
}

/**
 * Request rider cashout via Edge Function
 */
export async function requestRiderCashout(amount, payoutMethod, accountDetails) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const response = await fetch(`${SUPABASE_URL}/functions/v1/razorpay-create-payout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      amount,
      payout_method: payoutMethod,
      account_details: accountDetails,
    }),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'Cashout request failed')
  }
  return data
}
