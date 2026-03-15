import { Navigate, Outlet, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Bike, History, LogOut } from 'lucide-react'
import '../../delivery.css'

export default function DeliveryLayout() {
  const { user, profile, loading, signOut } = useAuth()
  const location = useLocation()

  if (loading) return <div className="loader"><div className="spinner" /></div>

  // Restrict to delivery_partner (and allow admin for testing)
  if (!user || !profile || (profile.role !== 'delivery_partner' && profile.role !== 'admin')) {
    return <Navigate to="/" replace />
  }

  const handleLogout = async () => {
    await signOut()
    window.location.href = '/'
  }

  const navItems = [
    { path: '/delivery', label: 'My Tasks', icon: Bike },
    { path: '/delivery/history', label: 'History', icon: History },
  ]

  return (
    <div className="delivery-layout">
      {/* Top Header */}
      <header className="delivery-header">
        <div className="delivery-brand">
          <img src="/logo.jpg" alt="Logo" />
          <h1>Rider App</h1>
        </div>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', color: '#94a3b8' }}>
          <LogOut size={20} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="delivery-main">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="delivery-nav">
        {navItems.map(item => {
          const Icon = item.icon
          const active = location.pathname === item.path || (item.path !== '/delivery' && location.pathname.startsWith(item.path))
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`delivery-nav-item ${active ? 'active' : ''}`}
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
