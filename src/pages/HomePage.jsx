import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, ChevronDown, ShoppingCart, User, Zap, ChevronRight, ChevronUp } from 'lucide-react'
import { useCategories, useProducts, useSuperCategories } from '../hooks/useSupabase'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useUserLocation } from '../hooks/useLocation'
import ProductCard from '../components/ProductCard'



export default function HomePage() {
  const { categories, loading: catLoading } = useCategories()
  const { sections, loading: superLoading } = useSuperCategories()
  const { products, loading: prodLoading } = useProducts()
  const { totalItems } = useCart()
  const { user } = useAuth()
  const { address, distance, deliveryTime, loading: locLoading, error: locError, requestLocation, permissionDenied } = useUserLocation()

  // Delivery display
  const displayTime = deliveryTime || '8 minutes'
  const displayDist = distance ? `${distance} km` : null
  const displayAddr = address || (locLoading ? 'Detecting location...' : 'Set delivery location')

  return (
    <div className="page-content">
      {/* Header */}
      <header className="header">
        <div className="header-top">
          <div className="header-brand">
            <img src="/logo-4k.png" alt="Go To Mart" className="header-logo" />
            <div className="header-delivery">
              <span className="header-delivery-label">Delivery in</span>
              <div className="header-delivery-time">
                <span>{displayTime}</span>
                {displayDist && <span className="header-delivery-badge">{displayDist}</span>}
              </div>
            </div>
          </div>
          <div className="header-icons">
            <Link to="/profile" className="header-icon-btn">
              <User size={16} color="#fff" />
            </Link>
            <Link to="/cart" className="header-icon-btn">
              <ShoppingCart size={16} color="#fff" />
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </Link>
          </div>
        </div>

        <div className="location-row" onClick={() => { if (permissionDenied || locError) requestLocation() }} style={{ cursor: permissionDenied || locError ? 'pointer' : 'default' }}>
          <MapPin size={11} color={locLoading ? 'rgba(255,255,255,0.7)' : '#10b981'} />
          <span className="location-text">{displayAddr}</span>
          <ChevronDown size={11} color="rgba(255,255,255,0.7)" />
        </div>

        <div className="search-bar-wrap">
          <Link to="/search" className="search-bar" style={{ textDecoration: 'none' }}>
            <Search size={16} color="rgba(255,255,255,0.7)" />
            <span className="search-bar-text">Search for groceries, vegetables, fruits...</span>
          </Link>
        </div>
      </header>

      {/* Tagline */}
      <div className="tagline-banner">
        <p><Zap size={12} fill="gold" color="gold" /> Fast, Fresh, Everyday Essentials <Zap size={12} fill="gold" color="gold" /></p>
      </div>

      {/* Super-Category Sections */}
      {superLoading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : (
        <div className="super-category-list">
          {sections.map((section) => (
            <div key={section.id} className="super-category-section">
              <div className="super-category-header">
                <span className="super-category-name">
                  {section.icon} {section.name}
                </span>
              </div>
              <div className="sub-category-grid">
                {section.categories.map((cat) => (
                  <Link to={`/category/${cat.id}`} key={cat.id} className="sub-category-card" style={{ textDecoration: 'none' }}>
                    <div className="sub-category-img-wrap">
                      {cat.image_url ? (
                        <img src={cat.image_url} alt={cat.name} className="sub-category-img" />
                      ) : (
                        <span className="sub-category-emoji">{cat.icon}</span>
                      )}
                    </div>
                    <span className="sub-category-name">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="section-divider" />

      {/* Bestsellers */}
      {prodLoading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : (
        <>
          {/* Top picks - first 12 */}
          <div>
            <div className="section-header">
              <div>
                <div className="section-title">Bestsellers</div>
                <div className="section-subtitle">Most popular near you</div>
              </div>
            </div>
            <div className="product-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {products.slice(0, 12).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>

          <div className="section-divider" />

          {/* Category-wise sections */}
          {categories.slice(0, 6).map(cat => {
            const catProducts = products.filter(p => p.category_id === cat.id).slice(0, 6)
            if (catProducts.length === 0) return null
            return (
              <div key={cat.id}>
                <div className="section-header">
                  <div>
                    <div className="section-title">{cat.icon} {cat.name}</div>
                  </div>
                  <Link to={`/category/${cat.id}`} className="section-action">
                    see all <ChevronRight size={14} />
                  </Link>
                </div>
                <div className="scroll-row">
                  {catProducts.map(p => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}
