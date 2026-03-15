import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'
import GenreChip from './GenreChip'

const GameCard = ({ game }) => {
  const cardRef = useRef(null)
  const navigate = useNavigate()

  const handleMouseMove = (e) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const rotateX = ((y - rect.height / 2) / rect.height) * -10
    const rotateY = ((x - rect.width / 2) / rect.width) * 10
    card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.03)`
    card.style.boxShadow = `${-rotateY * 2}px ${rotateX * 2}px 40px rgba(0,0,0,0.7), 0 0 30px rgba(220,30,60,0.2)`
  }

  const handleMouseLeave = () => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = 'perspective(600px) rotateX(0) rotateY(0) translateY(0) scale(1)'
    card.style.boxShadow = 'none'
  }

  return (
    <div
      ref={cardRef}
      onClick={() => navigate(`/game/${game.id}`)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative', flexShrink: 0, width: '200px', height: '260px', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease', transformStyle: 'preserve-3d' }}
    >
      <img src={game.cover} alt={game.name}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />

      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(7,4,15,1) 0%, rgba(7,4,15,0.3) 50%, transparent 100%)' }} />

      <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 20, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <Star size={9} color="#facc15" fill="#facc15" />
        <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>{game.rating}</span>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'Rajdhani, sans-serif' }}>
          {game.name}
        </p>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {game.genres.slice(0, 2).map((genre) => <GenreChip key={genre} label={genre} />)}
        </div>
      </div>
    </div>
  )
}

export default GameCard