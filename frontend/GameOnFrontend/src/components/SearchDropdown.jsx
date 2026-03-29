import { useNavigate } from 'react-router-dom'
import { Search, Star } from 'lucide-react'

const SkeletonRow = () => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 14px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 8,
      background: 'rgba(255,255,255,0.06)',
      flexShrink: 0,
      animation: 'pulse 2s ease-in-out infinite',
    }} />
    <div style={{ flex: 1 }}>
      <div style={{
        height: 12, width: '55%', borderRadius: 6,
        background: 'rgba(255,255,255,0.06)',
        marginBottom: 8,
        animation: 'pulse 2s ease-in-out infinite',
      }} />
      <div style={{
        height: 10, width: '30%', borderRadius: 6,
        background: 'rgba(255,255,255,0.04)',
        animation: 'pulse 2s ease-in-out infinite',
      }} />
    </div>
  </div>
)

const SearchDropdown = ({ query, results, isLoading, onSelect }) => {
  const navigate = useNavigate()

  const handleSelect = (game) => {
    navigate(`/game/${game.id}`)
    onSelect()
  }

  return (
    <div style={{
      position: 'absolute',
      top: 'calc(100% + 8px)',
      left: 0,
      right: 0,
      zIndex: 200,
      borderRadius: 14,
      background: 'rgba(16,5,8,0.98)',
      border: '1px solid rgba(220,30,60,0.2)',
      backdropFilter: 'blur(30px)',
      boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
      overflow: 'hidden',
      maxHeight: 420,
      overflowY: 'auto',
    }}>
      {isLoading ? (
        <>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </>
      ) : !results?.length ? (
        <div style={{ padding: '28px 16px', textAlign: 'center' }}>
          <Search size={22} color="rgba(255,255,255,0.12)" style={{ marginBottom: 10 }} />
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
            No games found for{' '}
            <span style={{ color: 'rgba(220,30,60,0.7)' }}>"{query}"</span>
          </p>
        </div>
      ) : (
        results.map((game, index) => (
          <button
            key={game.id}
            onClick={() => handleSelect(game)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              background: 'transparent',
              border: 'none',
              borderBottom: index < results.length - 1
                ? '1px solid rgba(255,255,255,0.04)'
                : 'none',
              cursor: 'pointer',
              transition: 'background 0.15s',
              textAlign: 'left',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,30,60,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {game.cover ? (
              <img
                src={game.cover}
                alt={game.name}
                style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
              />
            ) : (
              <div style={{
                width: 44, height: 44, borderRadius: 8,
                background: 'rgba(255,255,255,0.06)', flexShrink: 0,
              }} />
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: 13, fontWeight: 600, color: '#fff',
                marginBottom: 4,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                fontFamily: 'Outfit, sans-serif',
              }}>
                {game.name}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {game.genres?.[0] && (
                  <span style={{
                    fontSize: 10, color: 'rgba(255,255,255,0.35)',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '1px 6px', borderRadius: 20,
                  }}>
                    {game.genres[0]}
                  </span>
                )}
                {game.released && (
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
                    {game.released.slice(0, 4)}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <Star size={9} color="#facc15" fill="#facc15" />
              <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>
                {game.rating}
              </span>
            </div>
          </button>
        ))
      )}
    </div>
  )
}

export default SearchDropdown