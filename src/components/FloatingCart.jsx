import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, ChevronRight } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function FloatingCart() {
  const { totalItems, totalPrice } = useCart()
  const { pathname } = useLocation()

  if (totalItems === 0 || pathname === '/cart' || pathname === '/order-success') return null

  return (
    <Link to="/cart" className="floating-cart">
      <div className="floating-cart-left">
        <div className="floating-cart-icon">
          <ShoppingCart size={16} />
        </div>
        <span className="floating-cart-count">
          {totalItems} item{totalItems > 1 ? 's' : ''}
        </span>
      </div>
      <div className="floating-cart-right">
        <span className="floating-cart-price">₹{totalPrice.toFixed(0)}</span>
        <div className="floating-cart-arrow">
          <ChevronRight size={14} />
        </div>
      </div>
    </Link>
  )
}
