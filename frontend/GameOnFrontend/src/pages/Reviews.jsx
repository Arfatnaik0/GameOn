import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAllReviews } from '../hooks/useReviews'
import { useGameDetailsBatch } from '../hooks/useGames'
import { useWindowSize } from '../hooks/useWindowSize'

const Reviews = () => {
  const navigate = useNavigate()
  const { isMobile } = useWindowSize()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useAllReviews(page)
  const reviews = data?.results ?? []
  const totalPages = data?.total_pages ?? 1

  const ids = reviews.map(r => r.rawg_game_id)
  const { data: gameDetails } = useGameDetailsBatch(ids)

  const enriched = reviews.map((review, i) => ({
    ...review,
    gameName: gameDetails[i]?.name ?? '...',
    gameCover: gameDetails[i]?.background_image ?? null,
    gameId: gameDetails[i]?.id,
  }))

  return (
    <div style={{ minHeight: '100vh', background: '#0a0608', color: '#fff', fontFamily: 'Outfit, sans-serif' }}>

      {/* Header */}
      <div style={{
        padding: isMobile ? '14px 16px' : '16px 40px',
        borderBottom: '1px solid rgba(220,30,60,0.08)',
        background: 'rgba(10,6,8,0.9)', backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <button onClick={() => navigate('/dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 12, cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(220,30,60,0.2)', color: '#fff', fontSize: 13, flexShrink: 0 }}>
          <ArrowLeft size={14} /> {!isMobile && 'Dashboard'}
        </button>
        <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: isMobile ? 18 : 22, color: '#fff' }}>
          All Reviews
        </h1>
        {data?.count > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
            {data.count} total
          </span>
        )}
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '20px 16px' : '40px' }}>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: 100, borderRadius: 14, background: 'rgba(255,255,255,0.04)', animation: 'pulse 2s infinite' }} />
            ))}
          </div>
        ) : enriched.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>No reviews yet</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>Be the first to review a game!</p>
            <button onClick={() => navigate('/dashboard')}
              style={{ marginTop: 24, padding: '10px 24px', borderRadius: 12, cursor: 'pointer', background: 'linear-gradient(135deg, #dc1e3c, #9b0020)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600 }}>
              Browse Games
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {enriched.map(review => (
                <div
                  key={review.id}
                  style={{
                    display: 'flex', gap: isMobile ? 12 : 16, padding: isMobile ? '14px' : '18px 20px',
                    borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s',
                    background: 'rgba(26,8,10,0.9)',
                    border: '1px solid rgba(220,30,60,0.1)',
                    backdropFilter: 'blur(20px)',
                  }}
                  onClick={() => review.gameId && navigate(`/game/${review.gameId}`)}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(220,30,60,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(220,30,60,0.1)'}
                >
                  {/* Game cover */}
                  {review.gameCover ? (
                    <img src={review.gameCover} alt={review.gameName}
                      style={{ width: isMobile ? 56 : 72, height: isMobile ? 56 : 72, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: isMobile ? 56 : 72, height: isMobile ? 56 : 72, borderRadius: 12, background: 'rgba(255,255,255,0.05)', flexShrink: 0 }} />
                  )}

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Top row: game name + rating */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                      <p style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: isMobile ? 15 : 17, color: '#fff', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                        {review.gameName}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, background: 'rgba(220,30,60,0.12)', border: '1px solid rgba(220,30,60,0.25)', flexShrink: 0 }}>
                        <Star size={10} color="#dc1e3c" fill="#dc1e3c" />
                        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 800, fontSize: 14, color: '#fff' }}>
                          {review.rating}
                        </span>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>/10</span>
                      </div>
                    </div>

                    {/* Review text */}
                    {review.review_text && (
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: isMobile ? 1 : 2, WebkitBoxOrient: 'vertical' }}>
                        {review.review_text}
                      </p>
                    )}

                    {/* Bottom row: reviewer + date */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {review.profiles?.avatar_url ? (
                        <img src={review.profiles.avatar_url} alt="avatar"
                          style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg, #dc1e3c, #7b2d8b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={10} color="#fff" />
                        </div>
                      )}
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
                        {review.profiles?.username ?? 'Anonymous'}
                      </span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>·</span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
                        {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: page === 1 ? 'not-allowed' : 'pointer', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', opacity: page === 1 ? 0.4 : 1, transition: 'all 0.2s' }}
                  onMouseEnter={e => { if (page > 1) e.currentTarget.style.borderColor = 'rgba(220,30,60,0.4)' }}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
                  <ChevronLeft size={16} color="#fff" />
                </button>

                <div style={{ display: 'flex', gap: 6 }}>
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    const p = i + 1
                    return (
                      <button key={p} onClick={() => setPage(p)}
                        style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s', border: 'none', background: page === p ? 'linear-gradient(135deg, #dc1e3c, #9b0020)' : 'rgba(255,255,255,0.06)', color: page === p ? '#fff' : 'rgba(255,255,255,0.4)', boxShadow: page === p ? '0 4px 12px rgba(220,30,60,0.35)' : 'none' }}>
                        {p}
                      </button>
                    )
                  })}
                  {totalPages > 5 && (
                    <span style={{ color: 'rgba(255,255,255,0.3)', alignSelf: 'center', fontSize: 13 }}>...</span>
                  )}
                </div>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: page === totalPages ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #dc1e3c, #8b0020)', border: 'none', opacity: page === totalPages ? 0.4 : 1, boxShadow: '0 4px 12px rgba(220,30,60,0.35)', transition: 'all 0.2s' }}>
                  <ChevronRight size={16} color="#fff" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Reviews