import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

const fallback = (name) => `https://placehold.co/300x300/f0fdf4/16a34a?text=${encodeURIComponent(name)}`

export default function ProductCard({ product }) {
  const { addItem, removeItem, getQty } = useCart()
  const navigate = useNavigate()
  const qty = getQty(product.id)
  const hasDiscount = product.mrp && Number(product.mrp) > Number(product.price)
  const pct = hasDiscount ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0
  const [imgSrc, setImgSrc] = useState(product.image_url || fallback(product.name))

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('.qty-control')) return
    navigate(`/product/${product.id}`)
  }

  return (
    <div className="product-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className="product-img-wrap">
        {hasDiscount && pct > 0 && (
          <span className="product-discount-tag">{pct}% OFF</span>
        )}
        <img
          src={imgSrc}
          alt={product.name}
          className="product-img"
          loading="lazy"
          onError={() => setImgSrc(fallback(product.name))}
        />
      </div>
      <div className="product-info">
        <p className="product-name">{product.name}</p>
        <p className="product-unit">{product.unit}</p>
        <p className="product-desc">
          {product.description || "Fresh & premium quality everyday essentials, delivered instantly."}
        </p>
        <div className="product-bottom">
          <div>
            <span className="product-price">₹{Number(product.price).toFixed(0)}</span>
            {hasDiscount && <span className="product-mrp">₹{Number(product.mrp).toFixed(0)}</span>}
          </div>
          {qty === 0 ? (
            <button className="add-btn" onClick={() => addItem(product)}>ADD</button>
          ) : (
            <div className="qty-control">
              <button className="qty-btn" onClick={() => removeItem(product.id)}>−</button>
              <span className="qty-count">{qty}</span>
              <button className="qty-btn" onClick={() => addItem(product)}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
