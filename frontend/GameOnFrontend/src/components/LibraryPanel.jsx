import { Star } from 'lucide-react'
import GenreChip from './GenreChip'

const LibraryPanel = ({ games }) => (
  <div style={{
    borderRadius: 16,
    background: 'rgba(26,8,10,0.9)',
    border: '1px solid rgba(220,30,60,0.12)',
    backdropFilter: 'blur(20px)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }}>
    <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
      <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 16, color: '#fff' }}>Recently Rated</h3>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc1e3c', boxShadow: '0 0 8px rgba(220,30,60,0.8)' }} />
    </div>
    <div style={{ overflowY: 'auto' }}>
      {games?.slice(0, 3).map((game) => (
        <div key={game.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <img src={game.cover} alt={game.name} style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{game.name}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <Star size={9} color="#f59e0b" fill="#f59e0b" />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{game.rating}</span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {game.genres.slice(0, 2).map(g => <GenreChip key={g} label={g} />)}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default LibraryPanel