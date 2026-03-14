import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, User, Package, Heart, Bell, MapPin, CreditCard, HelpCircle, Info, LogOut, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const menuSections = [
  {
    title: 'My Activity',
    items: [
      { icon: Package, label: 'My Orders', color: '#e8f5e9', iconColor: '#0d8320', link: '/orders' },
      { icon: MapPin, label: 'Saved Addresses', color: '#e3f2fd', iconColor: '#1e88e5' },
      { icon: Heart, label: 'Wishlist', color: '#fce4ec', iconColor: '#e53935' },
    ]
  },
  {
    title: 'Settings',
    items: [
      { icon: Bell, label: 'Notifications', color: '#fff3e0', iconColor: '#f57c00' },
      { icon: CreditCard, label: 'Payment Methods', color: '#f3e5f5', iconColor: '#8e24aa' },
    ]
  },
  {
    title: 'Support',
    items: [
      { icon: HelpCircle, label: 'Help & Support', color: '#e0f7fa', iconColor: '#00897b' },
      { icon: Info, label: 'About Go To Mart', color: '#f5f5f5', iconColor: '#616161' },
    ]
  }
]

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const displayName = profile?.full_name || 'Customer'
  const displayPhone = profile?.phone || user?.phone || ''
  const displayEmail = profile?.email || user?.email || ''

  return (
    <div className="page-content">
      <div className="category-page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} color="#333" />
        </button>
        <h1>My Account</h1>
      </div>

      {/* Profile card */}
      <div className="profile-card">
        <div className="profile-avatar">
          <User size={22} />
        </div>
        <div className="profile-info">
          <h2>{displayName}</h2>
          {displayPhone && <p>{displayPhone}</p>}
          {displayEmail && <p>{displayEmail}</p>}
        </div>
      </div>

      {/* Menu sections */}
      {menuSections.map(section => (
        <div key={section.title} className="menu-section">
          <div className="menu-section-title">{section.title}</div>
          <div className="menu-list">
            {section.items.map(item => {
              const Icon = item.icon
              const content = (
                <>
                  <div className="menu-item-icon" style={{ background: item.color }}>
                    <Icon size={16} color={item.iconColor} />
                  </div>
                  <span className="menu-item-label">{item.label}</span>
                  <ChevronRight size={16} className="menu-item-arrow" />
                </>
              )
              if (item.link) {
                return (
                  <Link key={item.label} to={item.link} className="menu-item" style={{ textDecoration: 'none' }}>
                    {content}
                  </Link>
                )
              }
              return (
                <button key={item.label} className="menu-item">{content}</button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Logout */}
      <div className="menu-section">
        <div className="menu-list">
          <button className="menu-item" onClick={handleLogout} style={{ color: '#dc2626' }}>
            <div className="menu-item-icon" style={{ background: '#fef2f2' }}>
              <LogOut size={16} color="#dc2626" />
            </div>
            <span className="menu-item-label" style={{ color: '#dc2626' }}>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  )
}
