import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Search, Package, Plus, Minus } from 'lucide-react'

export default function StoreInventory() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, unit, stock_quantity, image_url')
        .eq('is_active', true)
        .order('name')
      
      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const updateStock = async (id, currentStock, delta) => {
    const newStock = Math.max(0, currentStock + delta)
    try {
      // Optimistic update
      setProducts(products.map(p => p.id === id ? { ...p, stock_quantity: newStock } : p))
      
      const { error } = await supabase
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', id)
      
      if (error) {
        // Revert on error
        setProducts(products.map(p => p.id === id ? { ...p, stock_quantity: currentStock } : p))
        throw error
      }
    } catch (err) {
      console.error("Failed to update stock", err)
    }
  }

  const filteredProducts = products.filter(p => 
    search === '' || p.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="loader"><div className="spinner" /></div>

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 16px 0' }}>Quick Inventory</h2>
      
      <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '20px' }}>
        <Search size={20} color="#94a3b8" />
        <input 
          type="text" 
          placeholder="Search products to update stock..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', marginLeft: '12px', width: '100%', fontSize: '15px' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: '#94a3b8' }}>
            <Package size={48} opacity={0.2} style={{ marginBottom: '16px' }} />
            <p>No products found</p>
          </div>
        ) : (
          filteredProducts.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <img 
                src={p.image_url || `https://placehold.co/100x100/f8fafc/94a3b8?text=${encodeURIComponent(p.name)}`} 
                alt={p.name}
                style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', marginRight: '16px' }}
              />
              
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>{p.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{p.unit}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg)', padding: '6px 8px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <button 
                  onClick={() => updateStock(p.id, p.stock_quantity, -1)}
                  disabled={p.stock_quantity <= 0}
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: p.stock_quantity <= 0 ? 'not-allowed' : 'pointer', opacity: p.stock_quantity <= 0 ? 0.5 : 1, color: 'var(--text-primary)' }}
                >
                  <Minus size={16} />
                </button>
                
                <span style={{ fontWeight: 700, minWidth: '32px', textAlign: 'center', fontSize: '15px', color: p.stock_quantity === 0 ? '#ef4444' : 'var(--text-primary)' }}>
                  {p.stock_quantity}
                </span>

                <button 
                  onClick={() => updateStock(p.id, p.stock_quantity, 1)}
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)' }}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
