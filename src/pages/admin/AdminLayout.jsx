import { Navigate, Outlet, useLocation, Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, ShoppingBag, Package, Users, LogOut, Menu, X, Bike, FolderOpen, MessageSquare } from 'lucide-react'
import '../../admin.css'

export default function AdminLayout() {
  const { user, profile, loading, signOut } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) return <div className="loader"><div className="spinner" /></div>

  // Restrict to admins (bypassed in local dev)
  if (!import.meta.env.DEV && (!user || !profile || profile.role !== 'admin')) {
    return <Navigate to="/" replace />
  }

  const activeProfile = import.meta.env.DEV && (!profile || profile.role !== 'admin') 
    ? { full_name: 'Dev Admin', role: 'admin' } 
    : profile;

  const handleLogout = async () => {
    await signOut()
    window.location.href = '/'
  }

  const closeSidebar = () => setSidebarOpen(false)

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { path: '/admin/products', label: 'Products', icon: Package },
    { path: '/admin/categories', label: 'Categories', icon: FolderOpen },
    { path: '/admin/riders', label: 'Riders', icon: Bike },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/support', label: 'Support', icon: MessageSquare },
  ]

  return (
    <div className="admin-layout">
      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40 }}
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-brand">
          <img src="/logo.jpg" alt="Logo" />
          <h2>Admin Panel</h2>
          {sidebarOpen && (
            <button className="mobile-menu-btn" onClick={closeSidebar} style={{ marginLeft: 'auto' }}>
              <X size={24} />
            </button>
          )}
        </div>
        
        <nav className="admin-nav">
          {navItems.map(item => {
            const Icon = item.icon
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-nav-item ${active ? 'active' : ''}`}
                onClick={closeSidebar}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '16px' }}>
          <button 
            onClick={handleLogout}
            className="admin-nav-item" 
            style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', justifyContent: 'flex-start' }}
          >
            <LogOut size={20} color="#ef4444" />
            <span style={{ color: '#ef4444' }}>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div style={{ fontSize: '14px', color: '#94a3b8' }}>
              Welcome back, <span style={{ color: 'white', fontWeight: 600 }}>{activeProfile?.full_name || 'Admin'}</span>
            </div>
          </div>
          <Link to="/" style={{ color: '#10b981', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
            View App →
          </Link>
        </header>
        
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
