import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown, ChevronUp, ShieldCheck, Truck } from 'lucide-react'
import { useProducts } from '../hooks/useSupabase'
import { useCart } from '../context/CartContext'
import '../product-detail.css'

const fallback = (name) => `https://placehold.co/300x300/f0fdf4/16a34a?text=${encodeURIComponent(name)}`

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { products, loading } = useProducts()
  const { addItem, removeItem, getQty, cartTotal } = useCart()
  
  const [product, setProduct] = useState(null)
  const [imgSrc, setImgSrc] = useState('')
  const [isHighlightsOpen, setIsHighlightsOpen] = useState(true)
  const [isInfoOpen, setIsInfoOpen] = useState(false)

  useEffect(() => {
    if (!loading && products.length > 0) {
      const found = products.find(p => p.id === id)
      if (found) {
        setProduct(found)
        setImgSrc(found.image_url || fallback(found.name))
      }
    }
  }, [loading, products, id])

  if (loading) return <div className="loader"><div className="spinner" /></div>
  if (!product) return <div className="page-content"><p style={{padding: '20px'}}>Product not found.</p></div>

  const qty = getQty(product.id)
  const hasDiscount = product.mrp && Number(product.mrp) > Number(product.price)
  const pct = hasDiscount ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0

  return (
    <div className="product-detail-page">
      {/* Header */}
      <header className="pd-header">
        <button onClick={() => navigate(-1)} className="pd-back-btn">
          <ArrowLeft size={24} color="#111" />
        </button>
      </header>

      {/* Hero Section */}
      <div className="pd-hero">
        <img 
          src={imgSrc} 
          alt={product.name} 
          className="pd-image" 
          onError={() => setImgSrc(fallback(product.name))}
        />
      </div>

      {/* Core Info */}
      <div className="pd-core-info">
        <h1 className="pd-title">{product.name}</h1>
        <p className="pd-unit">{product.unit || '1 pc'}</p>
        
        <div className="pd-pricing-row">
          <span className="pd-price">₹{Number(product.price).toFixed(0)}</span>
          {hasDiscount && <span className="pd-mrp">₹{Number(product.mrp).toFixed(0)}</span>}
          {hasDiscount && pct > 0 && <span className="pd-discount-tag">{pct}% OFF</span>}
        </div>
      </div>

      {/* Trust Badges */}
      <div className="pd-trust-badges">
        <div className="pd-trust-badge">
          <ShieldCheck size={20} color="#0A882D" />
          <span className="pd-trust-text">Easy Refunds</span>
        </div>
        <div className="pd-trust-badge">
          <Truck size={20} color="#0A882D" />
          <span className="pd-trust-text">Fast Delivery</span>
        </div>
      </div>

      {/* Accordions */}
      <div className="pd-accordions">
        {/* Highlights Accordion */}
        <div className="pd-accordion">
          <button 
            className="pd-accordion-header" 
            onClick={() => setIsHighlightsOpen(!isHighlightsOpen)}
          >
            <span>Highlights</span>
            {isHighlightsOpen ? <ChevronUp size={20} color="#6b7280" /> : <ChevronDown size={20} color="#6b7280" />}
          </button>
          
          {isHighlightsOpen && (
            <div className="pd-accordion-content">
              <div className="pd-highlights-grid">
                <span className="pd-highlight-label">Type</span>
                <span className="pd-highlight-value">{product.name.split(' ')[0]}</span>
                <span className="pd-highlight-label">Unit</span>
                <span className="pd-highlight-value">{product.unit || 'Standard'}</span>
                <span className="pd-highlight-label">Details</span>
                <span className="pd-highlight-value">{product.description || 'Fresh and premium quality everyday essentials.'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Info Accordion */}
        <div className="pd-accordion">
          <button 
            className="pd-accordion-header" 
            onClick={() => setIsInfoOpen(!isInfoOpen)}
          >
            <span>Important Information</span>
            {isInfoOpen ? <ChevronUp size={20} color="#6b7280" /> : <ChevronDown size={20} color="#6b7280" />}
          </button>
          
          {isInfoOpen && (
            <div className="pd-accordion-content">
              <p style={{marginBottom: '12px'}}>
                <strong>Disclaimer:</strong> Every effort is made to maintain the accuracy of all information. However, actual product packaging and materials may contain more and/or different information. It is recommended not to solely rely on the information presented.
              </p>
              <p>
                <strong>Customer Care:</strong> For queries, please contact our support desk via the app or email us at support@gotomart.com
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="pd-bottom-bar">
        <div>
          {cartTotal > 0 && <div style={{fontSize: '12px', color: '#6b7280'}}>Cart Total</div>}
          <div className="pd-total-price">
            {cartTotal > 0 ? `₹${cartTotal.toFixed(0)}` : `₹${Number(product.price).toFixed(0)}`}
          </div>
        </div>
        
        {qty === 0 ? (
          <button className="pd-add-btn" onClick={() => addItem(product)}>
            ADD
          </button>
        ) : (
          <div className="pd-qty-controls">
            <button className="pd-qty-btn" onClick={() => removeItem(product.id)}>−</button>
            <span className="pd-qty-text">{qty}</span>
            <button className="pd-qty-btn" onClick={() => addItem(product)}>+</button>
          </div>
        )}
      </div>
    </div>
  )
}
