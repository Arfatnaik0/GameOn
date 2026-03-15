import { Star } from 'lucide-react'
import GenreChip from './GenreChip'
import { useMyReviews } from '../hooks/useReviews'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useGameDetailsBatch } from '../hooks/useGames'

const LibraryPanel = () => {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { data: reviewsData } = useMyReviews(session)

  const reviews = reviewsData?.results?.slice(0, 5) ?? []
  const ids = reviews.map(r => r.rawg_game_id)
  const { data: gameDetails } = useGameDetailsBatch(ids)

  const games = gameDetails
    .map((game, i) => game ? ({
      id: game.id,
      name: game.name,
      cover: game.background_image,
      genres: game.genres?.map(g => g.name) ?? [],
      userRating: reviews[i]?.rating,
    }) : null)
    .filter(Boolean)

  return (
    <div style={{
      borderRadius: 16, background: 'rgba(26,8,10,0.9)',
      border: '1px solid rgba(220,30,60,0.12)', backdropFilter: 'blur(20px)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%',
    }}>
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 16, color: '#fff' }}>Recently Rated</h3>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc1e3c', boxShadow: '0 0 8px rgba(220,30,60,0.8)' }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {!games.length ? (
          <div style={{ padding: '20px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>No reviews yet</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', marginTop: 4 }}>Review a game to see it here</p>
          </div>
        ) : (
          games.map((game) => (
            <div key={game.id}
              onClick={() => navigate(`/game/${game.id}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <img src={game.cover} alt={game.name} style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{game.name}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                  <Star size={9} color="#f59e0b" fill="#f59e0b" />
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{game.userRating}/10</span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {game.genres.slice(0, 2).map(g => <GenreChip key={g} label={g} />)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default LibraryPanel