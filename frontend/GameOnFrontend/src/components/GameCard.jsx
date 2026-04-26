import { useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import GenreChip from './GenreChip'
import AddToListButton from './AddToListButton'
import { getGameCoverUrl } from '../api/games'

const GameCard = ({ game, listEntries = [] }) => {
  const navigate = useNavigate()
  const { session } = useAuth()

  return (
    <div
      onClick={() => navigate(`/game/${game.id}`)}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 18px 38px rgba(0,0,0,0.42), 0 0 24px rgba(220,30,60,0.16)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
      style={{ position: 'relative', flexShrink: 0, width: '200px', height: '260px', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.18s ease, box-shadow 0.18s ease', willChange: 'transform' }}
    >
      <img src={getGameCoverUrl(game.cover)} alt={game.name}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {game.genres.slice(0, 1).map((genre) => <GenreChip key={genre} label={genre} />)}
          </div>
          <div onClick={e => e.stopPropagation()} style={{ flexShrink: 0 }}>
            <AddToListButton gameId={game.id} session={session} compact={true} dropUp listEntries={listEntries} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameCard
