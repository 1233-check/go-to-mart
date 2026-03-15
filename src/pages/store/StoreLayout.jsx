import { Navigate, Outlet, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ClipboardList, Package, LogOut } from 'lucide-react'
import '../../store.css'

export default function StoreLayout() {
  const { user, profile, loading, signOut } = useAuth()
  const location = useLocation()

  if (loading) return <div className="loader"><div className="spinner" /></div>

  // Restrict to store_staff (and allow admin for testing/fallback)
  if (!user || !profile || (profile.role !== 'store_staff' && profile.role !== 'admin')) {
    return <Navigate to="/" replace />
  }

  const handleLogout = async () => {
    await signOut()
    window.location.href = '/'
  }

  const navItems = [
    { path: '/store', label: 'Orders', icon: ClipboardList },
    { path: '/store/inventory', label: 'Inventory', icon: Package },
  ]

  return (
    <div className="store-layout">
      {/* Top Header */}
      <header className="store-header">
        <div className="store-brand">
          <img src="/logo.jpg" alt="Logo" />
          <h1>Staff Panel</h1>
        </div>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', color: '#64748b' }}>
          <LogOut size={20} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="store-main">
        <Outlet />
      </main>

      {/* Bottom Navigation (Mobile First) */}
      <nav className="store-nav">
        {navItems.map(item => {
          const Icon = item.icon
          const active = location.pathname === item.path || (item.path !== '/store' && location.pathname.startsWith(item.path))
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`store-nav-item ${active ? 'active' : ''}`}
            >
              <Icon size={24} strokeWidth={active ? 2.5 : 2} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
