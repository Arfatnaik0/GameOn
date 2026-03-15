import { LayoutDashboard, List, LogOut, LogIn, X, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWindowSize } from '../hooks/useWindowSize'

const Sidebar = ({ mobileOpen, onClose }) => {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const { isMobile } = useWindowSize()

  const navItems = [
    { icon: LayoutDashboard, label: 'My Dashboard', path: '/dashboard' },
    { icon: List, label: "Game's List", path: '/lists' },
  ]

  const handleNav = (path) => {
    navigate(path)
    if (isMobile) onClose?.()
  }

  const sidebarContent = (
    <aside style={{
      width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column',
      height: '100%', background: 'rgba(36,10,14,0.98)',
      borderRight: isMobile ? 'none' : '1px solid rgba(220,30,60,0.1)',
      backdropFilter: 'blur(20px)',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
        {isMobile && (
          <button onClick={onClose}
            style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <div style={{ flex: 1, padding: '16px 12px' }} className="stagger">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = window.location.pathname === path
          return (
            <button key={label} onClick={() => handleNav(path)} style={{
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

      {/* Bottom */}
      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {user ? (
          <button onClick={signOut} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 14px', borderRadius: 14,
            background: 'transparent', border: 'none',
            color: 'rgba(255,255,255,0.3)', fontSize: 13, cursor: 'pointer', transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
            <LogOut size={15} /> Log Out
          </button>
        ) : (
          <button onClick={() => handleNav('/login')} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 14px', borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(220,30,60,0.2), rgba(140,10,25,0.2))',
            border: '1px solid rgba(220,30,60,0.3)',
            color: '#dc1e3c', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
          }}>
            <LogIn size={15} /> Sign In
          </button>
        )}
      </div>
    </aside>
  )

  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            opacity: mobileOpen ? 1 : 0,
            pointerEvents: mobileOpen ? 'all' : 'none',
            transition: 'opacity 0.3s',
          }}
        />
        {/* Drawer */}
        <div style={{
          position: 'fixed', top: 0, left: 0, bottom: 0,
          width: 220, zIndex: 400,
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}>
          {sidebarContent}
        </div>
      </>
    )
  }

  return sidebarContent
}

export default Sidebar