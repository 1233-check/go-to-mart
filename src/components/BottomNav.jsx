import { useLocation, Link } from 'react-router-dom'
import { Search, LayoutGrid, User } from 'lucide-react'

const CustomHomeIcon = ({ size }) => (
  <div style={{ width: size + 4, height: size + 4, borderRadius: '6px', overflow: 'hidden' }}>
    <img src="/logo-4k.png" alt="Home" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  </div>
)

const tabs = [
  { id: '/', label: 'Home', icon: CustomHomeIcon },
  { id: '/search', label: 'Search', icon: Search },
  { id: '/categories', label: 'Categories', icon: LayoutGrid },
  { id: '/profile', label: 'Account', icon: User },
]

export default function BottomNav() {
  const { pathname } = useLocation()

  // Hide on cart and order success
  if (pathname === '/cart' || pathname === '/order-success') return null

  const getActive = (id) => {
    if (id === '/') return pathname === '/'
    if (id === '/categories') return pathname.startsWith('/category')
    return pathname.startsWith(id)
  }

  return (
    <nav className="bottom-nav">
      {tabs.map(tab => {
        const active = getActive(tab.id)
        return (
          <Link key={tab.id} to={tab.id} className={`nav-item ${active ? 'active' : ''}`}>
            <tab.icon size={20} strokeWidth={active ? 2.5 : 1.8} fill={active ? 'currentColor' : 'none'} />
            <span className="nav-label">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
