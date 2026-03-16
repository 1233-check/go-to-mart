import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, UserCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signInWithGoogle, user, profile, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')

  const from = location.state?.from || '/'

  // Determine if we are waiting on profile data or need to ask for a name
  const needsName = user && profile && (!profile.full_name || profile.full_name.trim() === '')

  useEffect(() => {
    // If user is fully logged in and has a name, redirect to the previous page
    if (user && profile && profile.full_name && profile.full_name.trim() !== '') {
      navigate(from, { replace: true })
    }
  }, [user, profile, navigate, from])

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google')
      setLoading(false)
    }
  }

  const handleSaveName = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }
    setLoading(true)
    try {
      await updateProfile({ full_name: name.trim() })
      // Next render will have profile.full_name set, which triggers the useEffect redirect
    } catch (err) {
      setError(err.message || 'Failed to save name')
      setLoading(false)
    }
  }

  if (needsName) {
    return (
      <div className="page-content">
        <div className="login-page">
          <div className="login-header">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} color="var(--text-primary)" />
            </button>
          </div>
          <div className="login-brand">
            <img src="/logo.jpg" alt="Go To Mart" className="login-logo" />
            <h1>Go To Mart</h1>
          </div>
          <form onSubmit={handleSaveName} className="login-form">
            <h2><UserCircle size={20} /> Welcome!</h2>
            <p className="login-subtitle">
              Tell us your name to get started
            </p>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="otp-input"
              autoFocus
              style={{ textAlign: 'left', letterSpacing: 'normal', fontSize: '15px' }}
            />
            {error && <p className="login-error">{error}</p>}
            <button type="submit" className="login-btn" disabled={loading || !name.trim()}>
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content">
      <div className="login-page">
        <div className="login-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} color="#333" />
          </button>
        </div>

        <div className="login-brand">
          <img src="/logo.jpg" alt="Go To Mart" className="login-logo" />
          <h1>Go To Mart</h1>
          <p>Fast, Fresh, Everyday Essentials</p>
        </div>

        <div className="login-form">
          <h2>Login or Sign Up</h2>
          <p className="login-subtitle">Continue with your Google account</p>

          {error && <p className="login-error">{error}</p>}

          <button 
            type="button" 
            className="login-btn" 
            onClick={handleGoogleLogin} 
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'white', color: '#333', border: '1px solid #ddd' }}
          >
            {loading ? 'Connecting...' : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 18, height: 18 }} />
                Continue with Google
              </>
            )}
          </button>

          <p className="login-terms">
            By continuing, you agree to our Terms of Service & Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
