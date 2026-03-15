import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Gamepad2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useMyList } from '../hooks/useLists'
import { useGameDetailsBatch } from '../hooks/useGames'
import AddToListButton from '../components/AddToListButton'

const STATUS_CONFIG = {
  want_to_play: { label: 'Want to Play', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)' },
  playing:      { label: 'Playing',      color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.2)' },
  played:       { label: 'Played',       color: '#dc1e3c', bg: 'rgba(220,30,60,0.1)',   border: 'rgba(220,30,60,0.2)' },
}

const Lists = () => {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { data: listData, isLoading: loadingList } = useMyList(session)

  const entries = listData?.results ?? []
  const ids = entries.map(e => e.rawg_game_id)
  const { data: gameDetails, isLoading: loadingGames } = useGameDetailsBatch(ids)

  const isLoading = loadingList || loadingGames

  const enriched = entries.map((entry, i) => ({
    ...entry,
    gameName: gameDetails[i]?.name ?? 'Unknown',
    gameCover: gameDetails[i]?.background_image ?? null,
    gameId: gameDetails[i]?.id,
  }))

  const byStatus = (status) => enriched.filter(e => e.status === status)

  return (
    <div style={{ minHeight: '100vh', background: '#0a0608', color: '#fff', fontFamily: 'Outfit, sans-serif' }}>
      {/* Top bar */}
      <div style={{
        padding: '16px 40px', borderBottom: '1px solid rgba(220,30,60,0.08)',
        background: 'rgba(10,6,8,0.9)', backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <button onClick={() => navigate('/dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 12, cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(220,30,60,0.2)', color: '#fff', fontSize: 13 }}>
          <ArrowLeft size={14} /> Dashboard
        </button>
        <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 22, color: '#fff' }}>
          My Game List
        </h1>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
          {entries.length} {entries.length === 1 ? 'game' : 'games'}
        </span>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', gap: 24 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ flex: 1, height: 400, borderRadius: 20, background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Gamepad2 size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: 16 }} />
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>Your list is empty</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>Browse games and hit "Add to List" to start tracking</p>
            <button onClick={() => navigate('/dashboard')}
              style={{ marginTop: 24, padding: '10px 24px', borderRadius: 12, cursor: 'pointer', background: 'linear-gradient(135deg, #dc1e3c, #9b0020)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600 }}>
              Browse Games
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            {Object.entries(STATUS_CONFIG).map(([status, config]) => {
              const games = byStatus(status)
              return (
                <div key={status} style={{ flex: 1, minWidth: 0 }}>
                  {/* Column header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: config.color, boxShadow: `0 0 8px ${config.color}` }} />
                    <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 17, color: '#fff' }}>
                      {config.label}
                    </h2>
                    <span style={{
                      marginLeft: 'auto', fontSize: 11, fontWeight: 700,
                      padding: '2px 8px', borderRadius: 20,
                      background: config.bg, border: `1px solid ${config.border}`,
                      color: config.color,
                    }}>
                      {games.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {games.length === 0 ? (
                      <div style={{ padding: '32px 16px', borderRadius: 16, border: `1px dashed ${config.border}`, textAlign: 'center' }}>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>No games here yet</p>
                      </div>
                    ) : games.map(game => (
                      <div
                        key={game.id}
                        style={{ borderRadius: 16, background: 'rgba(26,8,10,0.9)', border: '1px solid rgba(220,30,60,0.1)', backdropFilter: 'blur(20px)', transition: 'border-color 0.2s', cursor: 'pointer' }}
                        onClick={() => navigate(`/game/${game.gameId}`)}
                        onMouseEnter={e => e.currentTarget.style.borderColor = `${config.color}44`}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(220,30,60,0.1)'}
                      >
                        {game.gameCover && (
                          <div style={{ position: 'relative', height: 110, overflow: 'hidden', borderRadius: '16px 16px 0 0' }}>
                            <img src={game.gameCover} alt={game.gameName}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,8,10,1) 0%, transparent 60%)' }} />
                          </div>
                        )}
                        <div style={{ padding: '12px 14px' }}>
                          <p style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {game.gameName}
                          </p>
                          <div onClick={e => e.stopPropagation()}>
                            <AddToListButton gameId={game.gameId} session={session} dropUp />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Lists