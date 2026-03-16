import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Search, ChevronUp } from 'lucide-react'
import { useSuperCategories } from '../hooks/useSupabase'
import BottomNav from '../components/BottomNav'



export default function CategoriesPage() {
  const navigate = useNavigate()
  const { sections, loading } = useSuperCategories()

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <div className="page-content" style={{ paddingBottom: '70px' }}>
      <div className="search-page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} color="var(--text-primary)" />
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: 'bold' }}>All Categories</h1>
      </div>

      {/* Search shortcut */}
      <div style={{ padding: '0 16px 12px' }}>
        <Link to="/search" className="search-bar" style={{ 
          textDecoration: 'none', 
          background: 'var(--surface-2)', 
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Search size={16} color="var(--text-muted)" />
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
            Search for products...
          </span>
        </Link>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : (
        <div className="super-category-list">
          {sections.map((section) => (
            <div key={section.id} className="super-category-section">
              <div className="super-category-header">
                <span className="super-category-name">
                  {section.icon} {section.name}
                </span>
                <button className="back-to-top-btn" onClick={scrollToTop}>
                  <ChevronUp size={12} />
                  <span>Top</span>
                </button>
              </div>
              <div className="sub-category-grid">
                {section.categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="sub-category-card"
                    onClick={() => navigate(`/category/${cat.id}`)}
                  >
                    <div className="sub-category-img-wrap">
                      {cat.image_url ? (
                        <img src={cat.image_url} alt={cat.name} className="sub-category-img" />
                      ) : (
                        <span className="sub-category-emoji">{cat.icon}</span>
                      )}
                    </div>
                    <span className="sub-category-name">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
