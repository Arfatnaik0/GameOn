import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, Gamepad2, Library, Star } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useMyList } from '../hooks/useLists'
import { useGameDetailsBatch } from '../hooks/useGames'
import { useWindowSize } from '../hooks/useWindowSize'
import AddToListButton from '../components/AddToListButton'
import { getGameCoverUrl } from '../api/games'

const LIST_PAGE_SIZE = 10

const STATUS_CONFIG = {
  want_to_play: { label: 'Want to Play', shortLabel: 'Want', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.24)' },
  playing: { label: 'Playing', shortLabel: 'Playing', color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.24)' },
  played: { label: 'Played', shortLabel: 'Played', color: '#dc1e3c', bg: 'rgba(220,30,60,0.1)', border: 'rgba(220,30,60,0.24)' },
}

const STATUS_KEYS = Object.keys(STATUS_CONFIG)

const Lists = () => {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { isMobile, isTablet } = useWindowSize()
  const isCompact = isMobile || isTablet
  const [activeTab, setActiveTab] = useState('want_to_play')
  const [pages, setPages] = useState({
    want_to_play: 1,
    playing: 1,
    played: 1,
  })

  const { data: listData, isLoading: loadingList } = useMyList(session)
  const entries = useMemo(() => listData?.results ?? [], [listData?.results])

  const groupedEntries = useMemo(() => {
    const groups = {
      want_to_play: [],
      playing: [],
      played: [],
    }

    entries.forEach((entry) => {
      if (groups[entry.status]) groups[entry.status].push(entry)
    })

    return groups
  }, [entries])

  useEffect(() => {
    setPages((current) => {
      let changed = false
      const next = { ...current }

      STATUS_KEYS.forEach((status) => {
        const totalPages = Math.max(1, Math.ceil(groupedEntries[status].length / LIST_PAGE_SIZE))
        if (next[status] > totalPages) {
          next[status] = totalPages
          changed = true
        }
      })

      return changed ? next : current
    })
  }, [groupedEntries])

  const visibleEntriesByStatus = useMemo(() => (
    STATUS_KEYS.reduce((acc, status) => {
      const start = (pages[status] - 1) * LIST_PAGE_SIZE
      acc[status] = groupedEntries[status].slice(start, start + LIST_PAGE_SIZE)
      return acc
    }, {})
  ), [groupedEntries, pages])

  const visibleEntries = useMemo(() => (
    isCompact
      ? visibleEntriesByStatus[activeTab]
      : STATUS_KEYS.flatMap((status) => visibleEntriesByStatus[status])
  ), [activeTab, isCompact, visibleEntriesByStatus])

  const visibleIds = useMemo(() => visibleEntries.map(entry => entry.rawg_game_id), [visibleEntries])
  const { data: gameDetails, isLoading: loadingGames } = useGameDetailsBatch(visibleIds)
  const isLoading = loadingList || loadingGames

  const gameByRawgId = useMemo(() => {
    const map = {}
    visibleIds.forEach((id, index) => {
      map[id] = gameDetails[index]
    })
    return map
  }, [gameDetails, visibleIds])

  const buildGames = (status) => visibleEntriesByStatus[status].map((entry) => {
    const game = gameByRawgId[entry.rawg_game_id]
    return {
      ...entry,
      gameName: game?.name ?? 'Unknown Game',
      gameCover: game?.background_image ?? null,
      gameId: game?.id ?? entry.rawg_game_id,
      rating: game?.rating,
      released: game?.released,
      genres: game?.genres?.map(genre => genre.name) ?? [],
    }
  })

  const setPage = (status, page) => {
    setPages((current) => ({ ...current, [status]: page }))
  }

  const totalGames = entries.length

  const renderPagination = (status) => {
    const total = groupedEntries[status].length
    const totalPages = Math.max(1, Math.ceil(total / LIST_PAGE_SIZE))
    const page = pages[status]
    if (total <= LIST_PAGE_SIZE) return null

    const start = (page - 1) * LIST_PAGE_SIZE + 1
    const end = Math.min(page * LIST_PAGE_SIZE, total)

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingTop: 12 }}>
        <button
          onClick={() => setPage(status, Math.max(1, page - 1))}
          disabled={page === 1}
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)',
            color: '#fff',
            opacity: page === 1 ? 0.4 : 1,
            cursor: page === 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeft size={14} />
        </button>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', textAlign: 'center' }}>
          {start}-{end} of {total}
        </span>
        <button
          onClick={() => setPage(status, Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)',
            color: '#fff',
            opacity: page === totalPages ? 0.4 : 1,
            cursor: page === totalPages ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    )
  }

  const renderGameCard = (game, config) => (
    <article
      key={game.id}
      onClick={() => navigate(`/game/${game.gameId}`)}
      style={{
        display: 'grid',
        gridTemplateColumns: isCompact ? '74px 1fr' : '86px 1fr',
        gap: 12,
        minHeight: isCompact ? 96 : 110,
        padding: 10,
        borderRadius: 14,
        background: 'rgba(255,255,255,0.035)',
        border: '1px solid rgba(255,255,255,0.07)',
        cursor: 'pointer',
        transition: 'border-color 0.2s, background 0.2s, transform 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = config.border
        e.currentTarget.style.background = 'rgba(255,255,255,0.055)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
        e.currentTarget.style.background = 'rgba(255,255,255,0.035)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.06)' }}>
        {game.gameCover ? (
          <img
            src={getGameCoverUrl(game.gameCover)}
            alt={game.gameName}
            style={{ width: '100%', height: '100%', minHeight: isCompact ? 76 : 90, objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ minHeight: isCompact ? 76 : 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Gamepad2 size={20} color="rgba(255,255,255,0.18)" />
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,6,8,0.74), transparent 60%)' }} />
      </div>

      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: isCompact ? 16 : 18, lineHeight: 1.05, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 6 }}>
            {game.gameName}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            {game.rating && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'rgba(255,255,255,0.66)', fontSize: 11 }}>
                <Star size={10} color="#facc15" fill="#facc15" /> {game.rating}
              </span>
            )}
            {game.released && (
              <span style={{ color: 'rgba(255,255,255,0.32)', fontSize: 11 }}>{String(game.released).slice(0, 4)}</span>
            )}
            {game.genres.slice(0, 1).map((genre) => (
              <span key={genre} style={{ color: config.color, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: config.bg, border: `1px solid ${config.border}` }}>
                {genre}
              </span>
            ))}
          </div>
        </div>
        <div onClick={e => e.stopPropagation()}>
          <AddToListButton gameId={game.gameId} session={session} dropUp listEntries={entries} />
        </div>
      </div>
    </article>
  )

  const renderLane = (status) => {
    const config = STATUS_CONFIG[status]
    const games = buildGames(status)
    const total = groupedEntries[status].length
    const page = pages[status]
    const totalPages = Math.max(1, Math.ceil(total / LIST_PAGE_SIZE))

    return (
      <section key={status} style={{ minWidth: 0 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 12,
          paddingBottom: 10,
          borderBottom: `1px solid ${config.border}`,
        }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: config.color, boxShadow: `0 0 12px ${config.color}` }} />
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 800, fontSize: 18, color: '#fff', lineHeight: 1 }}>
              {config.label}
            </h2>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', marginTop: 3 }}>
              Page {page} of {totalPages}
            </p>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 800, padding: '4px 9px', borderRadius: 999, background: config.bg, border: `1px solid ${config.border}`, color: config.color }}>
            {total}
          </span>
        </div>

        {games.length === 0 ? (
          <div style={{ minHeight: 140, borderRadius: 16, border: `1px dashed ${config.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 18 }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.26)' }}>No games here yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {games.map(game => renderGameCard(game, config))}
          </div>
        )}

        {renderPagination(status)}
      </section>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0608', color: '#fff', fontFamily: 'Outfit, sans-serif' }}>
      <div style={{
        padding: isMobile ? '14px 16px' : '16px 40px',
        borderBottom: '1px solid rgba(220,30,60,0.08)',
        background: 'rgba(10,6,8,0.9)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 12, cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(220,30,60,0.2)', color: '#fff', fontSize: 13, flexShrink: 0 }}
        >
          <ArrowLeft size={14} /> {!isMobile && 'Dashboard'}
        </button>
        <Library size={18} color="#dc1e3c" />
        <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 800, fontSize: isMobile ? 20 : 24, color: '#fff', lineHeight: 1 }}>
          Game's List
        </h1>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,255,0.38)', flexShrink: 0 }}>
          {totalGames} {totalGames === 1 ? 'game' : 'games'}
        </span>
      </div>

      <main style={{ maxWidth: 1320, margin: '0 auto', padding: isMobile ? '20px 16px' : '34px 32px 48px' }}>
        <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: 16, marginBottom: 22, flexDirection: isMobile ? 'column' : 'row' }}>
          <div>
            <p style={{ color: '#fb7185', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.6, fontWeight: 800, marginBottom: 6 }}>Library Board</p>
            <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: isMobile ? 28 : 36, lineHeight: 1, fontWeight: 800, color: '#fff' }}>
              Track what matters next
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {STATUS_KEYS.map((status) => {
              const config = STATUS_CONFIG[status]
              return (
                <span key={status} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 10px', borderRadius: 999, background: config.bg, border: `1px solid ${config.border}`, color: config.color, fontSize: 12, fontWeight: 800 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: config.color }} />
                  {groupedEntries[status].length} {config.shortLabel}
                </span>
              )
            })}
          </div>
        </div>

        {loadingList ? (
          <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr' : 'repeat(3, minmax(0, 1fr))', gap: 18 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 360, borderRadius: 18, background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : totalGames === 0 ? (
          <div style={{ textAlign: 'center', padding: isMobile ? '56px 12px' : '80px 0', borderRadius: 18, border: '1px dashed rgba(220,30,60,0.22)', background: 'rgba(255,255,255,0.025)' }}>
            <Gamepad2 size={48} color="rgba(255,255,255,0.14)" style={{ marginBottom: 16 }} />
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.72)', marginBottom: 8, fontWeight: 700 }}>Your list is empty</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Browse games and hit Add to List to start tracking.</p>
            <button
              onClick={() => navigate('/dashboard')}
              style={{ marginTop: 24, padding: '10px 24px', borderRadius: 12, cursor: 'pointer', background: 'linear-gradient(135deg, #dc1e3c, #9b0020)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700 }}
            >
              Browse Games
            </button>
          </div>
        ) : isCompact ? (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
              {STATUS_KEYS.map((status) => {
                const config = STATUS_CONFIG[status]
                const active = activeTab === status
                return (
                  <button
                    key={status}
                    onClick={() => setActiveTab(status)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '9px 14px',
                      borderRadius: 999,
                      cursor: 'pointer',
                      flexShrink: 0,
                      background: active ? config.bg : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${active ? config.border : 'rgba(255,255,255,0.08)'}`,
                      color: active ? config.color : 'rgba(255,255,255,0.46)',
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    {config.label}
                    <span style={{ fontSize: 11, opacity: 0.72 }}>({groupedEntries[status].length})</span>
                  </button>
                )
              })}
            </div>
            {isLoading && !buildGames(activeTab).length ? (
              <div style={{ height: 320, borderRadius: 18, background: 'rgba(255,255,255,0.04)' }} />
            ) : (
              renderLane(activeTab)
            )}
          </>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 18, alignItems: 'start' }}>
            {STATUS_KEYS.map(renderLane)}
          </div>
        )}
      </main>
    </div>
  )
}

export default Lists
