import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Search, ShieldAlert, CheckCircle, XCircle } from 'lucide-react'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const fetchUsers = async () => {
    try {
      // Note: Full user management (deleting users, changing passwords) requires Supabase Admin API.
      // Here we manage the 'profiles' table which holds roles and user data perfectly.
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      console.error(err)
      alert("Error fetching users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
      
      if (error) throw error
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (err) {
      console.error(err)
      alert("Failed to update user role")
    }
  }

  const filteredUsers = users.filter(u => 
    (roleFilter === 'all' || u.role === roleFilter) &&
    (search === '' || 
      u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
      u.phone?.includes(search)
    )
  )

  const getRoleColor = (role) => {
    if (role === 'admin') return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }
    if (role === 'store_staff') return { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }
    if (role === 'delivery_partner') return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }
    return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' } // customer
  }

  if (loading) return <div className="loader"><div className="spinner" /></div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="admin-title" style={{ margin: 0 }}>Manage Users</h1>
      </div>

      <div className="admin-card">
        <div className="admin-card-header" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#0f172a', padding: '8px 16px', borderRadius: '8px', border: '1px solid #334155', flex: 1, minWidth: '200px' }}>
            <Search size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search by name or phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', marginLeft: '8px', width: '100%' }}
            />
          </div>
          
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ background: '#0f172a', color: 'white', padding: '10px 16px', borderRadius: '8px', border: '1px solid #334155', outline: 'none', cursor: 'pointer' }}
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="admin">Admins</option>
            <option value="store_staff">Store Staff</option>
            <option value="delivery_partner">Delivery Partners</option>
          </select>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Contact</th>
                <th>Joined</th>
                <th>Role Assignment</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '32px' }}>No users found</td></tr>
              ) : (
                filteredUsers.map(u => {
                  const rColor = getRoleColor(u.role)
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f8fafc', fontWeight: 600, fontSize: '16px' }}>
                            {u.full_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>{u.full_name || 'Unknown User'}</div>
                            <span className="admin-badge" style={{ backgroundColor: rColor.bg, color: rColor.color }}>
                              {u.role ? u.role.replace('_', ' ') : 'customer'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ color: '#cbd5e1' }}>{u.phone}</div>
                      </td>
                      <td>
                        <div style={{ color: '#94a3b8', fontSize: '14px' }}>
                          {new Date(u.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <select 
                          value={u.role || 'customer'}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          style={{ 
                            background: '#0f172a', 
                            color: 'white', 
                            padding: '8px 12px', 
                            borderRadius: '6px', 
                            border: '1px solid #334155',
                            outline: 'none',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          <option value="customer">Customer</option>
                          <option value="admin">Admin</option>
                          <option value="store_staff">Store Staff</option>
                          <option value="delivery_partner">Delivery Partner</option>
                        </select>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
