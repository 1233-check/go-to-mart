import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search } from 'lucide-react'
import { useSearchProducts } from '../hooks/useSupabase'
import ProductCard from '../components/ProductCard'

export default function SearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const { results, loading, search } = useSearchProducts()
  const inputRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => search(query), 300)
    return () => clearTimeout(timerRef.current)
  }, [query, search])

  return (
    <div className="page-content">
      <div className="search-page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} color="#333" />
        </button>
        <div className="search-page-input-wrap">
          <Search size={16} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for products..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : query.length < 2 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h2>Search products</h2>
          <p>Type at least 2 characters to search from 190+ products</p>
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">😕</div>
          <h2>No results found</h2>
          <p>Try a different search term</p>
        </div>
      ) : (
        <div className="product-grid product-grid-2col" style={{ padding: '16px' }}>
          {results.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
