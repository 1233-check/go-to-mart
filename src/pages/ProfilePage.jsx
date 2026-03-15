import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, User, Package, LogOut, ChevronRight, Settings, ShoppingBag, Bike, Moon, Sun, Wallet, HelpCircle, FileText, Heart, MapPin, Bell, Shield, Share2, Info } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    }
    setIsDark(!isDark)
  }

  const displayName = profile?.full_name || 'Customer'
  const displayPhone = profile?.phone || user?.phone || ''
  const displayEmail = profile?.email || user?.email || ''

  // Build secure menu dynamically based on role (Hidden for normal users)
  const secureSections = [
    {
      title: 'Admin & Staff Access',
      items: [
        ...(profile?.role === 'admin' ? [{ icon: Settings, label: 'Admin Panel', color: '#e0f2fe', iconColor: '#0284c7', link: '/admin' }] : []),
        ...(['admin', 'store_staff'].includes(profile?.role) ? [{ icon: ShoppingBag, label: 'Staff Panel', color: '#ede9fe', iconColor: '#8b5cf6', link: '/store' }] : []),
        ...(['admin', 'delivery_partner'].includes(profile?.role) ? [{ icon: Bike, label: 'Rider App', color: '#fef3c7', iconColor: '#d97706', link: '/delivery' }] : []),
      ]
    },
  ]

  // Filter out the section if it has no items (i.e., normal customer)
  const visibleSecureSections = secureSections.filter(s => s.items.length > 0)

  const generalSections = [
    {
      title: 'Your information',
      items: [
        { icon: MapPin, label: 'Address book', color: '#f1f5f9', iconColor: '#475569' },
        { icon: FileText, label: 'Bookmarked recipes', color: '#f1f5f9', iconColor: '#475569' },
        { icon: Heart, label: 'Your wishlist', color: '#f1f5f9', iconColor: '#475569' },
      ]
    },
    {
      title: 'Other information',
      items: [
        { icon: Share2, label: 'Share the app', color: '#f1f5f9', iconColor: '#475569' },
        { icon: Info, label: 'About us', color: '#f1f5f9', iconColor: '#475569' },
        { icon: Shield, label: 'Account privacy', color: '#f1f5f9', iconColor: '#475569' },
        { icon: Bell, label: 'Notification preferences', color: '#f1f5f9', iconColor: '#475569' },
      ]
    }
  ]

  return (
    <div className="page-content" style={{ paddingBottom: '80px', background: 'var(--surface-3)' }}>
      {/* Top Header - minimal */}
      <div style={{ padding: '16px', display: 'flex', alignItems: 'center' }}>
        <button className="back-btn" onClick={() => navigate(-1)} style={{ color: 'var(--text-primary)', background: 'var(--surface)', padding: '8px', borderRadius: '50%', boxShadow: 'var(--shadow-sm)' }}>
          <ArrowLeft size={18} color="currentColor" />
        </button>
      </div>

      {/* Profile Info - Centered Blinkit Style */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)', marginBottom: '12px' }}>
          <User size={40} color="var(--text-primary)" />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>{displayName}</h2>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {displayPhone && <span>📞 {displayPhone}</span>}
          {displayEmail && <span>✉️ {displayEmail}</span>}
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Quick Action Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
          <Link to="/orders" style={{ textDecoration: 'none', background: 'var(--surface)', borderRadius: '12px', padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fdf8e6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={20} color="#d97706" />
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', textAlign: 'center' }}>Your orders</span>
          </Link>
          <div style={{ background: 'var(--surface)', borderRadius: '12px', padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={20} color="#16a34a" />
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', textAlign: 'center' }}>Wallet Money</span>
          </div>
          <div style={{ background: 'var(--surface)', borderRadius: '12px', padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HelpCircle size={20} color="#e11d48" />
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', textAlign: 'center' }}>Need help?</span>
          </div>
        </div>

        {/* Secure Admin/Staff Sections (Only visible if roles match) */}
        {visibleSecureSections.map(section => (
          <div key={section.title} className="menu-section" style={{ background: 'var(--surface)', borderRadius: '16px', padding: '4px 0', marginBottom: '16px', boxShadow: 'var(--shadow-sm)' }}>
            <div className="menu-section-title" style={{ padding: '12px 16px 4px', fontSize: '12px', fontWeight: '800', color: 'var(--brand)', textTransform: 'none', letterSpacing: 'normal' }}>{section.title}</div>
            <div className="menu-list" style={{ border: 'none', background: 'transparent' }}>
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
                return (
                  <Link key={item.label} to={item.link} className="menu-item" style={{ textDecoration: 'none' }}>
                    {content}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        {/* Dynamic Theme Settings */}
        <div className="menu-section" style={{ background: 'var(--surface)', borderRadius: '16px', padding: '4px 0', marginBottom: '16px', boxShadow: 'var(--shadow-sm)' }}>
          <div className="menu-list" style={{ border: 'none', background: 'transparent' }}>
            <button className="menu-item" onClick={toggleTheme} style={{ padding: '16px' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Sun size={18} color="var(--text-secondary)" />
                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Appearance</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand)', fontWeight: '700', fontSize: '12px' }}>
                {isDark ? 'DARK' : 'LIGHT'}
                <ChevronRight size={14} />
              </div>
            </button>
          </div>
        </div>

        {/* General Sections */}
        {generalSections.map(section => (
          <div key={section.title} className="menu-section" style={{ background: 'var(--surface)', borderRadius: '16px', padding: '4px 0', marginBottom: '16px', boxShadow: 'var(--shadow-sm)' }}>
            <div className="menu-section-title" style={{ padding: '12px 16px 4px', fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)', textTransform: 'none', letterSpacing: 'normal' }}>{section.title}</div>
            <div className="menu-list" style={{ border: 'none', background: 'transparent' }}>
              {section.items.map(item => {
                const Icon = item.icon
                return (
                  <button key={item.label} className="menu-item" style={{ padding: '16px' }}>
                    <Icon size={18} color="var(--text-secondary)" />
                    <span className="menu-item-label" style={{ fontSize: '14px', marginLeft: '4px' }}>{item.label}</span>
                    <ChevronRight size={16} className="menu-item-arrow" />
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {/* Logout (Redesigned) */}
        <div className="menu-section" style={{ background: 'var(--surface)', borderRadius: '16px', padding: '4px 0', marginBottom: '32px', boxShadow: 'var(--shadow-sm)' }}>
          <div className="menu-list" style={{ border: 'none', background: 'transparent' }}>
            <button className="menu-item" onClick={handleLogout} style={{ padding: '16px' }}>
              <LogOut size={18} color="var(--text-secondary)" />
              <span className="menu-item-label" style={{ fontSize: '14px', marginLeft: '4px' }}>Log out</span>
              <ChevronRight size={16} className="menu-item-arrow" />
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
