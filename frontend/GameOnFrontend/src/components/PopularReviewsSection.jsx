import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Star, User } from 'lucide-react'
import { getGameCoverUrl } from '../api/games'
import { usePopularReviews } from '../hooks/useReviews'
import { useGameDetailsBatch } from '../hooks/useGames'
import ReviewReactionButtons from './ReviewReactionButtons'

const PopularReviewsSection = ({ session }) => {
  const [page, setPage] = useState(1)
  const navigate = useNavigate()

  const { data, isLoading } = usePopularReviews(page, 5, session)
  const reviews = data?.results ?? []
  const totalPages = data?.total_pages ?? 1

  const gameIds = useMemo(() => reviews.map((review) => review.rawg_game_id), [reviews])
  const { data: gameDetails } = useGameDetailsBatch(gameIds)

  const enrichedReviews = reviews.map((review, index) => ({
    ...review,
    gameId: gameDetails?.[index]?.id,
    gameName: gameDetails?.[index]?.name ?? `RAWG #${review.rawg_game_id}`,
    gameCover: getGameCoverUrl(gameDetails?.[index]?.background_image),
    gameReleasedYear: gameDetails?.[index]?.released ? String(gameDetails[index].released).slice(0, 4) : null,
  }))

  const renderStars = (rating) => {
    const starCount = Math.max(1, Math.min(5, Math.round((rating ?? 0) / 2)))
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            size={12}
            fill={index < starCount ? '#22c55e' : 'transparent'}
            color={index < starCount ? '#22c55e' : 'rgba(255,255,255,0.25)'}
          />
        ))}
      </div>
    )
  }

  const handleOpenGame = (gameId) => {
    if (!gameId) return
    navigate(`/game/${gameId}`)
  }

  return (
    <section
      style={{
        borderRadius: 18,
        padding: '18px 18px 10px',
        border: '1px solid rgba(108,168,228,0.18)',
        background: 'linear-gradient(180deg, rgba(8,16,28,0.96), rgba(7,13,24,0.94))',
        boxShadow: '0 16px 46px rgba(0,0,0,0.45)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ color: 'rgba(180,205,236,0.9)', fontSize: 14, letterSpacing: 2.2, textTransform: 'uppercase' }}>
          Popular Reviews This Week
        </p>
        <span style={{ color: 'rgba(180,205,236,0.7)', fontSize: 12 }}>
          Page {page} of {totalPages}
        </span>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 8 }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} style={{ height: 82, borderRadius: 12, background: 'rgba(255,255,255,0.04)' }} />
          ))}
        </div>
      ) : enrichedReviews.length === 0 ? (
        <div style={{ padding: '18px 0', color: 'rgba(255,255,255,0.45)', textAlign: 'center' }}>
          No reviews yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {enrichedReviews.map((review, index) => (
            <article
              key={review.id}
              onClick={() => handleOpenGame(review.gameId)}
              style={{
                display: 'grid',
                gridTemplateColumns: '74px 1fr',
                gap: 12,
                padding: '12px 0',
                borderTop: index === 0 ? '1px solid rgba(108,168,228,0.2)' : '1px solid rgba(108,168,228,0.14)',
                cursor: review.gameId ? 'pointer' : 'default',
              }}
            >
              {review.gameCover ? (
                <img
                  src={review.gameCover}
                  alt={review.gameName}
                  style={{ width: 74, height: 98, borderRadius: 8, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              ) : (
                <div style={{ width: 74, height: 98, borderRadius: 8, background: 'rgba(255,255,255,0.06)' }} />
              )}

              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                  <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 24, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                    {review.gameName}
                  </h3>
                  {review.gameReleasedYear && (
                    <span style={{ fontSize: 12, color: 'rgba(200,221,245,0.7)' }}>{review.gameReleasedYear}</span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  {review.profiles?.avatar_url ? (
                    <img
                      src={review.profiles.avatar_url}
                      alt="avatar"
                      style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.15)' }}
                    />
                  ) : (
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={12} color="#fff" />
                    </div>
                  )}
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(220,235,255,0.9)' }}>
                    {review.profiles?.username ?? 'Anonymous'}
                  </span>
                  {renderStars(review.rating)}
                </div>

                <p style={{ fontSize: 15, lineHeight: 1.55, color: 'rgba(208,222,245,0.88)', marginBottom: 10 }}>
                  {review.review_text?.trim() || 'No written review.'}
                </p>

                <ReviewReactionButtons review={review} session={session} compact />
              </div>
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0 4px' }}>
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.18)',
              background: 'rgba(255,255,255,0.04)',
              color: '#d7e8ff',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              opacity: page === 1 ? 0.45 : 1,
            }}
          >
            <ChevronLeft size={14} /> Prev
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {Array.from({ length: totalPages }).slice(0, 7).map((_, index) => {
              const pageNumber = index + 1
              return (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    background: page === pageNumber ? 'linear-gradient(135deg, #2d8bff, #1659c6)' : 'rgba(255,255,255,0.05)',
                    color: page === pageNumber ? '#fff' : 'rgba(215,232,255,0.72)',
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  {pageNumber}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.18)',
              background: 'rgba(255,255,255,0.04)',
              color: '#d7e8ff',
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
              opacity: page === totalPages ? 0.45 : 1,
            }}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </section>
  )
}

export default PopularReviewsSection
