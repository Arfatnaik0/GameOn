import { LayoutDashboard, List, LogOut, LogIn } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Sidebar = () => {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()

  const navItems = [
    { icon: LayoutDashboard, label: 'My Dashboard', path: '/dashboard' },
    { icon: List, label: "Game's List", path: '/lists' },
  ]

  return (
    <aside style={{
      width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column',
      height: '100vh', background: 'rgba(36,10,14,0.95)',
      borderRight: '1px solid rgba(220,30,60,0.1)', backdropFilter: 'blur(20px)',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, #dc1e3c, #7b0020)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(220,30,60,0.4)',
          }}>
            <span style={{ color: '#fff', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 14 }}>G</span>
          </div>
          <span style={{ color: '#fff', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 18, letterSpacing: 1 }}>
            GameOn
          </span>
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, padding: '16px 12px' }} className="stagger">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = window.location.pathname === path
          return (
            <button key={label} onClick={() => navigate(path)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 14, marginBottom: 4,
              border: active ? '1px solid rgba(220,30,60,0.3)' : '1px solid transparent',
              background: active ? 'linear-gradient(135deg, rgba(220,30,60,0.7), rgba(140,10,25,0.6))' : 'transparent',
              boxShadow: active ? '0 4px 20px rgba(220,30,60,0.25)' : 'none',
              color: active ? '#fff' : 'rgba(255,255,255,0.35)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; e.currentTarget.style.background = 'transparent' } }}>
              {active && <div className="shine" style={{ position: 'absolute', inset: 0 }} />}
              <Icon size={15} style={{ position: 'relative', zIndex: 1 }} />
              <span style={{ position: 'relative', zIndex: 1 }}>{label}</span>
            </button>
          )
        })}
      </div>

      {/* Bottom — sign out or sign in depending on auth state */}
      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {user ? (
          <button
            onClick={signOut}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 14,
              background: 'transparent', border: 'none',
              color: 'rgba(255,255,255,0.3)', fontSize: 13, cursor: 'pointer', transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
            <LogOut size={15} />
            Log Out
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(220,30,60,0.2), rgba(140,10,25,0.2))',
              border: '1px solid rgba(220,30,60,0.3)',
              color: '#dc1e3c', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(220,30,60,0.35), rgba(140,10,25,0.35))' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(220,30,60,0.2), rgba(140,10,25,0.2))' }}>
            <LogIn size={15} />
            Sign In
          </button>
        )}
      </div>
    </aside>
  )
}

export default Sidebar