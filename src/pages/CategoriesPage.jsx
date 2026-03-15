import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useCategories } from '../hooks/useSupabase'
import BottomNav from '../components/BottomNav'



export default function CategoriesPage() {
  const navigate = useNavigate()
  const { categories, loading } = useCategories()

  return (
    <div className="page-content" style={{ paddingBottom: '70px' }}>
      <div className="search-page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} color="#333" />
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: 'bold' }}>All Categories</h1>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : (
        <div className="category-grid" style={{ padding: '16px', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {categories.map((cat, i) => (
            <div 
              key={cat.id} 
              className="category-card" 
              onClick={() => navigate(`/category/${cat.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div 
                className="category-icon"
                style={cat.image_url ? { overflow: 'hidden', padding: 0 } : {}}
              >
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                ) : (
                  cat.icon
                )}
              </div>
              <span className="category-name">{cat.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
