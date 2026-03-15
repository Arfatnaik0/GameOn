import { useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'

const GuestBanner = ({ message = 'Sign in to access this feature' }) => {
  const navigate = useNavigate()

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 20px', borderRadius: 14,
      background: 'rgba(220,30,60,0.06)',
      border: '1px solid rgba(220,30,60,0.2)',
    }}>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{message}</p>
      <button
        onClick={() => navigate('/login')}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '8px 16px', borderRadius: 10, cursor: 'pointer',
          background: 'linear-gradient(135deg, #dc1e3c, #9b0020)',
          border: 'none', color: '#fff', fontSize: 12, fontWeight: 600,
          boxShadow: '0 4px 12px rgba(220,30,60,0.35)',
          flexShrink: 0,
        }}>
        <LogIn size={12} />
        Sign In
      </button>
    </div>
  )
}

export default GuestBanner