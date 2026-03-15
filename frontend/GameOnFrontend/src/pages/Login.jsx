import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const { signInWithGoogle, user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) navigate('/dashboard')
  }, [user, loading])

  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0a0608', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(160,10,25,0.2) 0%, transparent 70%)',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28,
        padding: '48px 56px', borderRadius: 24,
        background: 'rgba(26,8,10,0.9)',
        border: '1px solid rgba(220,30,60,0.15)',
        backdropFilter: 'blur(30px)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
        minWidth: 360,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'linear-gradient(135deg, #dc1e3c, #7b0020)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(220,30,60,0.4)',
          }}>
            <span style={{ color: '#fff', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 20 }}>G</span>
          </div>
          <span style={{ color: '#fff', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 28, letterSpacing: 1 }}>
            GameOn
          </span>
        </div>

        {/* Text */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 24, color: '#fff', marginBottom: 8 }}>
            Welcome
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
            Sign in to review games, track your<br />library and connect with players
          </p>
        </div>

        {/* Google button */}
        <button
          onClick={signInWithGoogle}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            padding: '13px 24px', borderRadius: 14, cursor: 'pointer',
            background: 'linear-gradient(135deg, #dc1e3c, #9b0020)',
            border: 'none', color: '#fff', fontSize: 14, fontWeight: 600,
            boxShadow: '0 6px 25px rgba(220,30,60,0.45)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 35px rgba(220,30,60,0.6)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 25px rgba(220,30,60,0.45)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="rgba(255,255,255,0.8)" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="rgba(255,255,255,0.6)" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="rgba(255,255,255,0.9)" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
        </div>

        {/* Guest button */}
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '12px 24px', borderRadius: 14, cursor: 'pointer',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 500,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
        >
          Browse as Guest
        </button>

        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
          By signing in you agree to our Terms of Service
        </p>
      </div>
    </div>
  )
}

export default Login