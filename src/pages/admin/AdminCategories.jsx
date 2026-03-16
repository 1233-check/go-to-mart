import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Edit2, Upload, Plus, Trash2, Save, X } from 'lucide-react'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [superCategories, setSuperCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editSuperCatId, setEditSuperCatId] = useState(null)
  const [superCatForm, setSuperCatForm] = useState({ name: '', icon: '', sort_order: 0, is_active: true })
  const [showAddSuperCat, setShowAddSuperCat] = useState(false)

  const fetchData = async () => {
    const [catRes, scRes] = await Promise.all([
      supabase.from('categories').select('*, super_categories(name)').order('sort_order'),
      supabase.from('super_categories').select('*').order('sort_order')
    ])
    setCategories(catRes.data || [])
    setSuperCategories(scRes.data || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  // --- Super Category CRUD ---
  const handleSaveSuperCat = async () => {
    if (!superCatForm.name.trim()) return alert('Name is required')
    if (editSuperCatId) {
      await supabase.from('super_categories').update(superCatForm).eq('id', editSuperCatId)
    } else {
      await supabase.from('super_categories').insert([superCatForm])
    }
    setEditSuperCatId(null)
    setShowAddSuperCat(false)
    setSuperCatForm({ name: '', icon: '', sort_order: 0, is_active: true })
    fetchData()
  }

  const handleEditSuperCat = (sc) => {
    setSuperCatForm({ name: sc.name, icon: sc.icon || '', sort_order: sc.sort_order || 0, is_active: sc.is_active })
    setEditSuperCatId(sc.id)
    setShowAddSuperCat(true)
  }

  const handleDeleteSuperCat = async (id) => {
    if (!confirm('Delete this super category? Sub-categories will be unlinked.')) return
    await supabase.from('categories').update({ super_category_id: null }).eq('super_category_id', id)
    await supabase.from('super_categories').delete().eq('id', id)
    fetchData()
  }

  // --- Sub Category Edit ---
  const handleEdit = (cat) => {
    setEditForm({
      name: cat.name,
      icon: cat.icon || '',
      sort_order: cat.sort_order || 0,
      is_active: cat.is_active,
      super_category_id: cat.super_category_id || '',
    })
    setEditId(cat.id)
  }

  const handleSave = async () => {
    await supabase.from('categories').update(editForm).eq('id', editId)
    setEditId(null)
    fetchData()
  }

  const handleImageUpload = async (catId, file) => {
    if (!file) return
    const ext = file.name.split('.').pop()
    const path = `cat-${catId}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('categories').upload(path, file, { upsert: true })
    if (error) return alert('Upload failed: ' + error.message)
    const { data } = supabase.storage.from('categories').getPublicUrl(path)
    await supabase.from('categories').update({ image_url: data.publicUrl }).eq('id', catId)
    fetchData()
  }

  if (loading) return <div className="loader"><div className="spinner" /></div>

  const catsBySuperCat = superCategories.map(sc => ({
    ...sc,
    cats: categories.filter(c => c.super_category_id === sc.id)
  }))

  return (
    <div>
      <h1 className="admin-title">Category Management</h1>

      {/* Super Categories with Add/Edit */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="admin-card-title">Super Categories ({superCategories.length})</h3>
          <button className="admin-btn" onClick={() => {
            setSuperCatForm({ name: '', icon: '', sort_order: superCategories.length + 1, is_active: true })
            setEditSuperCatId(null)
            setShowAddSuperCat(true)
          }}><Plus size={16} /> Add</button>
        </div>

        {/* Add/Edit Super Category Form */}
        {showAddSuperCat && (
          <div style={{ padding: '16px', borderTop: '1px solid #1e293b', display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: '150px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Name *</label>
              <input value={superCatForm.name} onChange={e => setSuperCatForm({ ...superCatForm, name: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: 'white', outline: 'none' }} />
            </div>
            <div style={{ flex: 1, minWidth: '80px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Icon (emoji)</label>
              <input value={superCatForm.icon} onChange={e => setSuperCatForm({ ...superCatForm, icon: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: 'white', outline: 'none' }} />
            </div>
            <div style={{ flex: 1, minWidth: '60px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Order</label>
              <input type="number" value={superCatForm.sort_order} onChange={e => setSuperCatForm({ ...superCatForm, sort_order: Number(e.target.value) })}
                style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: 'white', outline: 'none' }} />
            </div>
            <button onClick={handleSaveSuperCat} style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Save size={14} /> {editSuperCatId ? 'Update' : 'Add'}
            </button>
            <button onClick={() => { setShowAddSuperCat(false); setEditSuperCatId(null) }}
              style={{ padding: '8px 12px', background: 'transparent', border: '1px solid #334155', borderRadius: '6px', color: '#94a3b8', cursor: 'pointer' }}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Super Category List */}
        <div style={{ padding: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {superCategories.map(sc => (
            <div key={sc.id} style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
              background: '#0f172a', borderRadius: '8px', border: '1px solid #1e293b',
            }}>
              <span style={{ fontSize: '18px' }}>{sc.icon}</span>
              <span style={{ fontWeight: 600, color: '#f8fafc' }}>{sc.name}</span>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>({catsBySuperCat.find(c => c.id === sc.id)?.cats.length || 0} sub-cats)</span>
              <button onClick={() => handleEditSuperCat(sc)}
                style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', padding: '4px', borderRadius: '4px', cursor: 'pointer', marginLeft: '4px' }}>
                <Edit2 size={12} />
              </button>
              <button onClick={() => handleDeleteSuperCat(sc.id)}
                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sub-Categories Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Sub-Categories ({categories.length})</h3>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>Image</th>
                <th>Name</th>
                <th>Icon</th>
                <th>Super Category</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td>
                    <div style={{ position: 'relative', width: '50px', height: '50px' }}>
                      <img src={cat.image_url || `https://placehold.co/80x80/1e293b/94a3b8?text=${encodeURIComponent(cat.icon || '?')}`}
                        alt={cat.name} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                      <label style={{
                        position: 'absolute', bottom: -4, right: -4, width: '22px', height: '22px',
                        borderRadius: '50%', background: '#3b82f6', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      }}>
                        <Upload size={10} color="white" />
                        <input type="file" accept="image/*" style={{ display: 'none' }}
                          onChange={e => handleImageUpload(cat.id, e.target.files[0])} />
                      </label>
                    </div>
                  </td>
                  {editId === cat.id ? (
                    <>
                      <td><input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} style={{ width: '100%', padding: '6px', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: 'white' }} /></td>
                      <td><input value={editForm.icon} onChange={e => setEditForm({ ...editForm, icon: e.target.value })} style={{ width: '50px', padding: '6px', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: 'white', textAlign: 'center' }} /></td>
                      <td>
                        <select value={editForm.super_category_id || ''} onChange={e => setEditForm({ ...editForm, super_category_id: e.target.value || null })}
                          style={{ padding: '6px', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: 'white' }}>
                          <option value="">None</option>
                          {superCategories.map(sc => <option key={sc.id} value={sc.id}>{sc.icon} {sc.name}</option>)}
                        </select>
                      </td>
                      <td><input type="number" value={editForm.sort_order} onChange={e => setEditForm({ ...editForm, sort_order: Number(e.target.value) })} style={{ width: '50px', padding: '6px', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: 'white', textAlign: 'center' }} /></td>
                      <td>
                        <select value={editForm.is_active ? 'true' : 'false'} onChange={e => setEditForm({ ...editForm, is_active: e.target.value === 'true' })}
                          style={{ padding: '6px', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: 'white' }}>
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={handleSave} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}><Save size={14} /></button>
                          <button onClick={() => setEditId(null)} style={{ background: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}><X size={14} /></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ fontWeight: 600 }}>{cat.name}</td>
                      <td style={{ fontSize: '20px' }}>{cat.icon}</td>
                      <td>
                        {cat.super_categories?.name ? (
                          <span className="admin-badge" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>{cat.super_categories.name}</span>
                        ) : '—'}
                      </td>
                      <td>{cat.sort_order}</td>
                      <td>
                        <span className="admin-badge" style={{
                          background: cat.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                          color: cat.is_active ? '#10b981' : '#94a3b8'
                        }}>{cat.is_active ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td>
                        <button onClick={() => handleEdit(cat)} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}><Edit2 size={14} /></button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
