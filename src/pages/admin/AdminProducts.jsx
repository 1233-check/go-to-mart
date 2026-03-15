import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Search, Plus, Edit2, Archive, ArchiveRestore } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function AdminProducts() {
  const { role } = useAuth()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [isEditing, setIsEditing] = useState(null) // null or product ID or 'new'
  const [editForm, setEditForm] = useState({})

  const fetchData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        supabase.from('products').select('*, categories(name)').order('name'),
        supabase.from('categories').select('*').order('name')
      ])
      
      if (pRes.error) throw pRes.error
      if (cRes.error) throw cRes.error
      
      setProducts(pRes.data || [])
      setCategories(cRes.data || [])
    } catch (err) {
      console.error(err)
      alert("Error fetching data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleToggleActive = async (product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id)
      
      if (error) throw error
      setProducts(products.map(p => p.id === product.id ? { ...p, is_active: !product.is_active } : p))
    } catch (err) {
      console.error(err)
      alert("Failed to update status")
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      if (isEditing === 'new') {
        const { data, error } = await supabase.from('products').insert([editForm]).select('*, categories(name)').single()
        if (error) throw error
        setProducts([data, ...products])
      } else {
        const { data, error } = await supabase.from('products').update(editForm).eq('id', isEditing).select('*, categories(name)').single()
        if (error) throw error
        setProducts(products.map(p => p.id === isEditing ? data : p))
      }
      setIsEditing(null)
    } catch (err) {
      console.error(err)
      alert("Failed to save product")
    }
  }

  const openEdit = (product) => {
    setEditForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      mrp: product.mrp || product.price,
      unit: product.unit || '1 pc',
      image_url: product.image_url || '',
      category_id: product.category_id || categories[0]?.id,
      stock_quantity: product.stock_quantity || 100,
      is_active: product.is_active
    })
    setIsEditing(product.id)
  }

  const openNew = () => {
    setEditForm({
      name: '',
      description: '',
      price: '',
      mrp: '',
      unit: '1 pc',
      image_url: '',
      category_id: categories[0]?.id,
      stock_quantity: 100,
      is_active: true
    })
    setIsEditing('new')
  }

  const filteredProducts = products.filter(p => 
    (filterCat === 'all' || p.category_id === filterCat) &&
    (search === '' || p.name.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading) return <div className="loader"><div className="spinner" /></div>

  if (isEditing) {
    return (
      <div className="admin-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="admin-card-header">
          <h3 className="admin-card-title">{isEditing === 'new' ? 'Add New Product' : 'Edit Product'}</h3>
        </div>
        <form onSubmit={handleSave} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '13px' }}>Product Name *</label>
            <input required type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white', outline: 'none' }} />
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '13px' }}>Selling Price (₹) *</label>
              <input required type="number" step="0.01" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white', outline: 'none' }} />
            </div>
            
            {role === 'admin' && (
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '13px' }}>MRP (₹)</label>
                <input type="number" step="0.01" value={editForm.mrp} onChange={e => setEditForm({...editForm, mrp: e.target.value})} style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white', outline: 'none' }} />
              </div>
            )}
            
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '13px' }}>Unit</label>
              <input type="text" value={editForm.unit} onChange={e => setEditForm({...editForm, unit: e.target.value})} placeholder="e.g. 1 kg, 500g" style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white', outline: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '13px' }}>Category *</label>
              <select required value={editForm.category_id} onChange={e => setEditForm({...editForm, category_id: e.target.value})} style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white', outline: 'none', cursor: 'pointer' }}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '13px' }}>Stock Qty</label>
              <input type="number" value={editForm.stock_quantity} onChange={e => setEditForm({...editForm, stock_quantity: e.target.value})} style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white', outline: 'none' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '13px' }}>Image URL</label>
            <input type="url" value={editForm.image_url} onChange={e => setEditForm({...editForm, image_url: e.target.value})} placeholder="https://..." style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white', outline: 'none' }} />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc', fontSize: '14px', cursor: 'pointer' }}>
              <input type="checkbox" checked={editForm.is_active} onChange={e => setEditForm({...editForm, is_active: e.target.checked})} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              Active (Visible to customers)
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="submit" className="admin-btn" style={{ flex: 1, justifyContent: 'center' }}>Save Product</button>
            <button type="button" onClick={() => setIsEditing(null)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <h1 className="admin-title" style={{ margin: 0 }}>Manage Products</h1>
        <button className="admin-btn" onClick={openNew}><Plus size={18} /> Add Product</button>
      </div>

      <div className="admin-card">
        <div className="admin-card-header" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#0f172a', padding: '8px 16px', borderRadius: '8px', border: '1px solid #334155', flex: 1, minWidth: '200px' }}>
            <Search size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', marginLeft: '8px', width: '100%' }}
            />
          </div>
          
          <select 
            value={filterCat} 
            onChange={(e) => setFilterCat(e.target.value)}
            style={{ background: '#0f172a', color: 'white', padding: '10px 16px', borderRadius: '8px', border: '1px solid #334155', outline: 'none', cursor: 'pointer' }}
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Image</th>
                <th>Product Details</th>
                <th>Pricing</th>
                <th>Category</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>No products found</td></tr>
              ) : (
                filteredProducts.map(p => (
                  <tr key={p.id} style={{ opacity: p.is_active ? 1 : 0.5 }}>
                    <td>
                      <img 
                        src={p.image_url || `https://placehold.co/100x100/1e293b/94a3b8?text=${encodeURIComponent(p.name)}`} 
                        alt={p.name} 
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>{p.name}</div>
                      <div style={{ fontSize: '13px', color: '#94a3b8' }}>{p.unit} • Stock: {p.stock_quantity}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>₹{Number(p.price).toFixed(0)}</div>
                      {p.mrp && Number(p.mrp) > Number(p.price) && (
                        <div style={{ fontSize: '12px', color: '#94a3b8', textDecoration: 'line-through' }}>₹{Number(p.mrp).toFixed(0)}</div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '14px', color: '#cbd5e1' }}>{p.categories?.name || 'Uncategorized'}</div>
                    </td>
                    <td>
                      <span className="admin-badge" style={{ backgroundColor: p.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.1)', color: p.is_active ? '#10b981' : '#94a3b8' }}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => openEdit(p)} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleToggleActive(p)} style={{ background: p.is_active ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: p.is_active ? '#ef4444' : '#10b981', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }} title={p.is_active ? "Deactivate" : "Activate"}>
                          {p.is_active ? <Archive size={16} /> : <ArchiveRestore size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
