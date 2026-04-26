import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useWindowSize } from '../hooks/useWindowSize'
import SocialsSection from '../components/SocialsSection'

const Socials = () => {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { isMobile } = useWindowSize()

  return (
    <div style={{ minHeight: '100vh', background: '#0a0608', color: '#fff', fontFamily: 'Outfit, sans-serif' }}>
      <div style={{
        padding: isMobile ? '14px 16px' : '16px 40px',
        borderBottom: '1px solid rgba(220,30,60,0.08)',
        background: 'rgba(10,6,8,0.9)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 12, cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(220,30,60,0.2)', color: '#fff', fontSize: 13, flexShrink: 0 }}
        >
          <ArrowLeft size={14} /> {!isMobile && 'Dashboard'}
        </button>
        <Users size={18} color="#fb7185" />
        <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: isMobile ? 18 : 22, color: '#fff' }}>
          Socials
        </h1>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '20px 16px' : '40px' }}>
        <SocialsSection session={session} />
      </div>
    </div>
  )
}

export default Socials
