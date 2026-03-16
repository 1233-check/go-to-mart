import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useProducts, useCategories } from '../hooks/useSupabase'
import ProductCard from '../components/ProductCard'

export default function CategoryPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { products, loading } = useProducts(id)
  const { categories } = useCategories()
  const category = categories.find(c => c.id === id)

  return (
    <div className="page-content">
      <div className="category-page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} color="var(--text-primary)" />
        </button>
        <div>
          <h1>{category?.icon} {category?.name || 'Category'}</h1>
          {!loading && <span className="category-page-count">{products.length} products</span>}
        </div>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h2>No products found</h2>
          <p>This category doesn't have any products yet.</p>
        </div>
      ) : (
        <div className="product-grid product-grid-2col" style={{ padding: '16px' }}>
          {products.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
