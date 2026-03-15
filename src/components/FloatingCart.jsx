import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, ChevronRight } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function FloatingCart() {
  const { totalItems, cartItems } = useCart()
  const { pathname } = useLocation()

  if (totalItems === 0 || pathname === '/cart' || pathname === '/order-success') return null
  
  // Get the most recently added item's image (or just the first item's image as a representative thumbnail)
  const thumbnailImg = cartItems.length > 0 ? cartItems[0].product.image_url : null

  return (
    <Link to="/cart" className="floating-cart">
      <div className="floating-cart-left">
        <div className="floating-cart-thumbnail">
          {thumbnailImg ? (
            <img src={thumbnailImg} alt="cart item" />
          ) : (
            <ShoppingCart size={16} color="white" />
          )}
        </div>
        <div className="floating-cart-info">
          <span className="floating-cart-title">View cart</span>
          <span className="floating-cart-count">
            {totalItems} item{totalItems > 1 ? 's' : ''}
          </span>
        </div>
      </div>
      <div className="floating-cart-right">
        <ChevronRight size={18} color="white" />
      </div>
    </Link>
  )
}
