import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, User, Package, LogOut, ChevronRight, Settings, ShoppingBag, Bike, Moon, Sun, Wallet, HelpCircle, FileText, Heart, MapPin, Bell, Shield, Share2, Info, X } from 'lucide-react'
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
  const [activeModal, setActiveModal] = useState(null) // 'about' | 'privacy' | 'notifications' | 'address' | 'wishlist' | 'recipes'
  const [notifPrefs, setNotifPrefs] = useState({
    orders: true,
    promotions: true,
    delivery: true,
    recommendations: false,
  })

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
    // Load saved notification prefs
    const saved = localStorage.getItem('notifPrefs')
    if (saved) setNotifPrefs(JSON.parse(saved))
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

  const handleShare = async () => {
    const shareData = {
      title: 'Go To Mart',
      text: 'Order groceries, fresh fruits & veggies with 8-minute delivery! Try Go To Mart now 🛒',
      url: 'https://www.gotomart.live/'
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText('https://www.gotomart.live/')
        alert('Link copied to clipboard!')
      }
    } catch (err) {
      // User cancelled share
    }
  }

  const toggleNotifPref = (key) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] }
    setNotifPrefs(updated)
    localStorage.setItem('notifPrefs', JSON.stringify(updated))
  }

  const displayName = profile?.full_name || 'Customer'
  const displayPhone = profile?.phone || user?.phone || ''
  const displayEmail = profile?.email || user?.email || ''

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
  const visibleSecureSections = secureSections.filter(s => s.items.length > 0)

  const infoItems = [
    { icon: MapPin, label: 'Address book', action: () => setActiveModal('address') },
    { icon: FileText, label: 'Bookmarked recipes', action: () => setActiveModal('recipes') },
    { icon: Heart, label: 'Your wishlist', action: () => setActiveModal('wishlist') },
  ]

  const otherItems = [
    { icon: Share2, label: 'Share the app', action: handleShare },
    { icon: Info, label: 'About us', action: () => setActiveModal('about') },
    { icon: Shield, label: 'Account privacy', action: () => setActiveModal('privacy') },
    { icon: Bell, label: 'Notification preferences', action: () => setActiveModal('notifications') },
  ]

  // ---- Modal overlay style ----
  const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }
  const modalContent = { background: 'var(--surface)', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: '480px', maxHeight: '80vh', overflowY: 'auto', padding: '24px 20px 32px', color: 'var(--text-primary)' }
  const modalHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }
  const modalTitle = { fontSize: '18px', fontWeight: '800' }
  const closeBtn = { background: 'var(--surface-3)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }
  const sectionText = { fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '16px' }

  return (
    <div className="page-content" style={{ paddingBottom: '80px', background: 'var(--surface-3)' }}>
      {/* Top Header */}
      <div style={{ padding: '16px', display: 'flex', alignItems: 'center' }}>
        <button className="back-btn" onClick={() => navigate(-1)} style={{ color: 'var(--text-primary)', background: 'var(--surface)', padding: '8px', borderRadius: '50%', boxShadow: 'var(--shadow-sm)' }}>
          <ArrowLeft size={18} color="currentColor" />
        </button>
      </div>

      {/* Profile Info */}
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
          <Link to="/support" style={{ textDecoration: 'none', background: 'var(--surface)', borderRadius: '12px', padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={20} color="#16a34a" />
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', textAlign: 'center' }}>Wallet Money</span>
          </Link>
          <Link to="/support" style={{ textDecoration: 'none', background: 'var(--surface)', borderRadius: '12px', padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HelpCircle size={20} color="#e11d48" />
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', textAlign: 'center' }}>Need help?</span>
          </Link>
        </div>

        {/* Secure Admin/Staff Sections */}
        {visibleSecureSections.map(section => (
          <div key={section.title} className="menu-section" style={{ background: 'var(--surface)', borderRadius: '16px', padding: '4px 0', marginBottom: '16px', boxShadow: 'var(--shadow-sm)' }}>
            <div className="menu-section-title" style={{ padding: '12px 16px 4px', fontSize: '12px', fontWeight: '800', color: 'var(--brand)', textTransform: 'none', letterSpacing: 'normal' }}>{section.title}</div>
            <div className="menu-list" style={{ border: 'none', background: 'transparent' }}>
              {section.items.map(item => {
                const Icon = item.icon
                return (
                  <Link key={item.label} to={item.link} className="menu-item" style={{ textDecoration: 'none' }}>
                    <div className="menu-item-icon" style={{ background: item.color }}><Icon size={16} color={item.iconColor} /></div>
                    <span className="menu-item-label">{item.label}</span>
                    <ChevronRight size={16} className="menu-item-arrow" />
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        {/* Theme Toggle */}
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

        {/* Your Information */}
        <div className="menu-section" style={{ background: 'var(--surface)', borderRadius: '16px', padding: '4px 0', marginBottom: '16px', boxShadow: 'var(--shadow-sm)' }}>
          <div className="menu-section-title" style={{ padding: '12px 16px 4px', fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>Your information</div>
          <div className="menu-list" style={{ border: 'none', background: 'transparent' }}>
            {infoItems.map(item => {
              const Icon = item.icon
              return (
                <button key={item.label} className="menu-item" onClick={item.action} style={{ padding: '16px' }}>
                  <Icon size={18} color="var(--text-secondary)" />
                  <span className="menu-item-label" style={{ fontSize: '14px', marginLeft: '4px' }}>{item.label}</span>
                  <ChevronRight size={16} className="menu-item-arrow" />
                </button>
              )
            })}
          </div>
        </div>

        {/* Other Information */}
        <div className="menu-section" style={{ background: 'var(--surface)', borderRadius: '16px', padding: '4px 0', marginBottom: '16px', boxShadow: 'var(--shadow-sm)' }}>
          <div className="menu-section-title" style={{ padding: '12px 16px 4px', fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>Other information</div>
          <div className="menu-list" style={{ border: 'none', background: 'transparent' }}>
            {otherItems.map(item => {
              const Icon = item.icon
              return (
                <button key={item.label} className="menu-item" onClick={item.action} style={{ padding: '16px' }}>
                  <Icon size={18} color="var(--text-secondary)" />
                  <span className="menu-item-label" style={{ fontSize: '14px', marginLeft: '4px' }}>{item.label}</span>
                  <ChevronRight size={16} className="menu-item-arrow" />
                </button>
              )
            })}
          </div>
        </div>

        {/* Logout */}
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

      {/* ===== MODALS ===== */}

      {/* About Us */}
      {activeModal === 'about' && (
        <div style={modalOverlay} onClick={() => setActiveModal(null)}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <div style={modalHeader}>
              <span style={modalTitle}>About Go To Mart</span>
              <button style={closeBtn} onClick={() => setActiveModal(null)}><X size={16} color="var(--text-primary)" /></button>
            </div>
            <p style={sectionText}>
              <strong>Go To Mart</strong> is your neighborhood quick-commerce app delivering groceries, fresh fruits, vegetables, dairy, snacks, personal care, and household essentials in as fast as <strong>8 minutes</strong>.
            </p>
            <p style={sectionText}>
              We partner with local stores and delivery riders to bring you the freshest products at the best prices — right to your doorstep. Our mission is to make everyday shopping <strong>fast, fresh, and effortless</strong>.
            </p>
            <div style={{ background: 'var(--surface-3)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>📍 Based in India</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>🌐 www.gotomart.live</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>📧 support@gotomart.live</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>📱 App Version 1.0.0</div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
              Made with ❤️ by the Go To Mart team<br />© 2026 Go To Mart. All rights reserved.
            </p>
          </div>
        </div>
      )}

      {/* Account Privacy */}
      {activeModal === 'privacy' && (
        <div style={modalOverlay} onClick={() => setActiveModal(null)}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <div style={modalHeader}>
              <span style={modalTitle}>Account Privacy</span>
              <button style={closeBtn} onClick={() => setActiveModal(null)}><X size={16} color="var(--text-primary)" /></button>
            </div>
            <p style={sectionText}>
              Your privacy matters to us. Here's how we protect your data:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              {[
                { title: '🔒 Secure Authentication', desc: 'We use Google OAuth 2.0 for secure, password-free sign-in. We never store your Google password.' },
                { title: '📦 Order Data', desc: 'Your order history is stored securely and only accessible by you and our admin team for support.' },
                { title: '📍 Location Data', desc: 'Location is used only for delivery estimation and is never shared with third parties.' },
                { title: '💳 Payment Info', desc: 'We do not store any payment card details. All transactions are processed through secure payment gateways.' },
                { title: '🗑️ Data Deletion', desc: 'You can request complete deletion of your account and data by contacting support@gotomart.live.' },
              ].map(item => (
                <div key={item.title} style={{ background: 'var(--surface-3)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>{item.title}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notification Preferences */}
      {activeModal === 'notifications' && (
        <div style={modalOverlay} onClick={() => setActiveModal(null)}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <div style={modalHeader}>
              <span style={modalTitle}>Notification Preferences</span>
              <button style={closeBtn} onClick={() => setActiveModal(null)}><X size={16} color="var(--text-primary)" /></button>
            </div>
            <p style={{ ...sectionText, marginBottom: '20px' }}>Choose which notifications you'd like to receive:</p>
            {[
              { key: 'orders', label: 'Order updates', desc: 'Status changes, delivery confirmations' },
              { key: 'delivery', label: 'Delivery alerts', desc: 'Rider assigned, out for delivery, delivered' },
              { key: 'promotions', label: 'Offers & promotions', desc: 'Deals, discounts, and seasonal offers' },
              { key: 'recommendations', label: 'Personalized picks', desc: 'Product suggestions based on your orders' },
            ].map(item => (
              <button key={item.key} onClick={() => toggleNotifPref(item.key)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '14px 0', borderBottom: '1px solid var(--border)', background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', textAlign: 'left' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>{item.label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>
                <div style={{
                  width: '44px', height: '24px', borderRadius: '12px', padding: '2px',
                  background: notifPrefs[item.key] ? '#10b981' : 'rgba(148,163,184,0.3)',
                  transition: 'background 0.2s', display: 'flex', alignItems: 'center',
                  justifyContent: notifPrefs[item.key] ? 'flex-end' : 'flex-start',
                }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'all 0.2s' }} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Address Book */}
      {activeModal === 'address' && (
        <div style={modalOverlay} onClick={() => setActiveModal(null)}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <div style={modalHeader}>
              <span style={modalTitle}>Address Book</span>
              <button style={closeBtn} onClick={() => setActiveModal(null)}><X size={16} color="var(--text-primary)" /></button>
            </div>
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <MapPin size={48} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>No saved addresses yet</p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Your delivery addresses will appear here once you place your first order.</p>
              <button onClick={() => { setActiveModal(null); navigate('/') }} style={{ padding: '12px 24px', background: 'var(--brand)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>
                Start Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wishlist */}
      {activeModal === 'wishlist' && (
        <div style={modalOverlay} onClick={() => setActiveModal(null)}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <div style={modalHeader}>
              <span style={modalTitle}>Your Wishlist</span>
              <button style={closeBtn} onClick={() => setActiveModal(null)}><X size={16} color="var(--text-primary)" /></button>
            </div>
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <Heart size={48} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>Your wishlist is empty</p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Tap the ♡ on products to save them here for later.</p>
              <button onClick={() => { setActiveModal(null); navigate('/') }} style={{ padding: '12px 24px', background: 'var(--brand)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>
                Browse Products
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bookmarked Recipes */}
      {activeModal === 'recipes' && (
        <div style={modalOverlay} onClick={() => setActiveModal(null)}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <div style={modalHeader}>
              <span style={modalTitle}>Bookmarked Recipes</span>
              <button style={closeBtn} onClick={() => setActiveModal(null)}><X size={16} color="var(--text-primary)" /></button>
            </div>
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <FileText size={48} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>No recipes saved yet</p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Recipe bookmarking is coming soon! You'll be able to save your favorite recipes and order all ingredients in one tap.</p>
              <div style={{ display: 'inline-block', padding: '8px 16px', background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed', borderRadius: '8px', fontSize: '13px', fontWeight: '700' }}>
                🚀 Coming Soon
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
