import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, Calendar, ChevronLeft, ChevronRight, PenLine, Edit2, LogIn, Sparkles } from 'lucide-react'
import { useGameDetail, useGameScreenshots } from '../hooks/useGames'
import { useGameReviews, useMyReviewForGame } from '../hooks/useReviews'
import { useUserProfile } from '../hooks/useProfile'
import { useAuth } from '../context/AuthContext'
import { useWindowSize } from '../hooks/useWindowSize'
import GenreChip from '../components/GenreChip'
import ReviewForm from '../components/ReviewForm'
import ReviewList from '../components/ReviewList'
import AddToListButton from '../components/AddToListButton'
import GuestBanner from '../components/GuestBanner'
import ReviewRecapPopup from '../components/ReviewRecapPopup'

const GameDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, session } = useAuth()
  const { isMobile, isTablet } = useWindowSize()
  const [screenshotIndex, setScreenshotIndex] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [reviewPopupPayload, setReviewPopupPayload] = useState(null)

  const { data: game, isLoading: loadingGame } = useGameDetail(id)
  const { data: screenshots } = useGameScreenshots(id)
  const { data: reviewsData, isLoading: loadingReviews } = useGameReviews(id, session)
  const { data: myReviewData } = useMyReviewForGame(id, session)
  const { data: profileData } = useUserProfile(user?.id)

  const shots = screenshots?.results ?? []
  const reviews = reviewsData?.results ?? []
  const myReview = myReviewData?.review ?? null

  const prevShot = () => setScreenshotIndex(i => (i === 0 ? shots.length - 1 : i - 1))
  const nextShot = () => setScreenshotIndex(i => (i === shots.length - 1 ? 0 : i + 1))

  if (loadingGame) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0608' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(220,30,60,0.2)', borderTopColor: '#dc1e3c', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (!game) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0608' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)' }}>Game not found</p>
    </div>
  )

  const genres = game.genres?.map(g => g.name) ?? []
  const platforms = game.platforms?.map(p => p.platform.name) ?? []
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const heroHeight = isMobile ? 320 : 480

  const createSnapshotPayload = ({ rating, reviewText }) => {
    const fullName = profileData?.username?.trim()
      || user?.user_metadata?.full_name?.trim()
      || user?.user_metadata?.name?.trim()
      || 'Player'
    const handleBase = user?.user_metadata?.preferred_username?.trim()
      || profileData?.username?.trim()
      || user?.email?.split('@')?.[0]
      || 'player'
    const handle = handleBase.toLowerCase().replace(/\s+/g, '_')
    return {
      gameName: game.name,
      gameCover: game.background_image,
      gameType: 'Game',
      released: game.released,
      rating,
      reviewText,
      userName: fullName,
      userHandle: `@${handle}`,
      userAvatar: profileData?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture,
    }
  }

  const handleReviewSubmitted = ({ rating, reviewText }) => {
    setReviewPopupPayload(createSnapshotPayload({ rating, reviewText }))
  }

  const handleManualSnapshotOpen = () => {
    if (!myReview) return
    setReviewPopupPayload(createSnapshotPayload({
      rating: myReview.rating,
      reviewText: myReview.review_text,
    }))
  }

  return (
    <div style={{ background: '#0a0608', color: '#fff', fontFamily: 'Outfit, sans-serif', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ position: 'relative', height: heroHeight, overflow: 'hidden' }}>
        <img src={game.background_image} alt={game.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0a0608 0%, rgba(10,6,8,0.5) 50%, rgba(10,6,8,0.2) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,6,8,0.8) 0%, transparent 60%)' }} />

        {/* Back */}
        <button onClick={() => navigate('/dashboard')}
          style={{ position: 'absolute', top: 20, left: isMobile ? 16 : 24, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 12, cursor: 'pointer', background: 'rgba(10,6,8,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(220,30,60,0.2)', color: '#fff', fontSize: 13, fontWeight: 500, transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(220,30,60,0.5)'; e.currentTarget.style.background = 'rgba(220,30,60,0.1)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(220,30,60,0.2)'; e.currentTarget.style.background = 'rgba(10,6,8,0.7)' }}>
          <ArrowLeft size={15} /> {!isMobile && 'Back'}
        </button>

        {/* Hero content */}
        <div style={{ position: 'absolute', bottom: isMobile ? 20 : 40, left: isMobile ? 16 : 48, right: isMobile ? 16 : 48, maxWidth: isMobile ? '100%' : 600 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
            {genres.slice(0, isMobile ? 2 : 4).map(g => <GenreChip key={g} label={g} />)}
          </div>
          <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 800, fontSize: isMobile ? 30 : 52, lineHeight: 1.1, marginBottom: isMobile ? 10 : 14, textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}>
            {game.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 20, marginBottom: isMobile ? 14 : 24, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Star size={13} color="#f59e0b" fill="#f59e0b" />
              <span style={{ fontSize: 14, fontWeight: 700 }}>{game.rating}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>/5 RAWG</span>
            </div>
            {avgRating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Star size={13} color="#dc1e3c" fill="#dc1e3c" />
                <span style={{ fontSize: 14, fontWeight: 700 }}>{avgRating}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>/10 ({reviews.length})</span>
              </div>
            )}
            {game.metacritic && (
              <div style={{ padding: '2px 8px', borderRadius: 8, background: 'rgba(100,200,100,0.15)', border: '1px solid rgba(100,200,100,0.3)' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#6fcf97' }}>MC {game.metacritic}</span>
              </div>
            )}
            {!isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={12} color="rgba(255,255,255,0.4)" />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{game.released}</span>
              </div>
            )}
          </div>

          {/* CTA */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowForm(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: isMobile ? '10px 18px' : '13px 28px', borderRadius: 14, cursor: 'pointer', background: 'linear-gradient(135deg, #dc1e3c, #9b0020)', border: 'none', color: '#fff', fontSize: isMobile ? 13 : 14, fontWeight: 600, boxShadow: '0 6px 25px rgba(220,30,60,0.45)', transition: 'all 0.2s' }}>
                {myReview ? <><Edit2 size={14} /> Edit Review</> : <><PenLine size={14} /> Write a Review</>}
              </button>
              {myReview && (
                <button
                  onClick={handleManualSnapshotOpen}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: isMobile ? '10px 14px' : '12px 18px',
                    borderRadius: 14,
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.16)',
                    color: '#fff',
                    fontSize: isMobile ? 12 : 13,
                    fontWeight: 600,
                    transition: 'all 0.2s',
                  }}
                >
                  <Sparkles size={14} />
                  View Snapshot
                </button>
              )}
              <AddToListButton gameId={Number(id)} session={session} dropUp />
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 14, cursor: 'pointer', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, transition: 'all 0.2s' }}>
              <LogIn size={14} /> Sign in to Review
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '24px 16px 60px' : '48px 48px 80px' }}>
        <div style={{ display: 'flex', gap: isMobile ? 0 : 48, flexDirection: isMobile || isTablet ? 'column' : 'row' }}>

          {/* Left column */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {showForm && (
              <div style={{ marginBottom: 32 }}>
                <ReviewForm
                  gameId={Number(id)}
                  session={session}
                  existingReview={myReview}
                  onSubmitted={handleReviewSubmitted}
                  onClose={() => setShowForm(false)}
                />
              </div>
            )}

            {!user && (
              <div style={{ marginBottom: 32 }}>
                <GuestBanner message="Sign in to write a review and add this game to your list" />
              </div>
            )}

            {/* Info card — show inline on mobile/tablet */}
            {(isMobile || isTablet) && (
              <div style={{ marginBottom: 32, borderRadius: 16, overflow: 'hidden', background: 'rgba(26,8,10,0.9)', border: '1px solid rgba(220,30,60,0.12)', backdropFilter: 'blur(20px)' }}>
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {[
                      { label: 'RAWG Rating', value: `⭐ ${game.rating} / 5` },
                      { label: 'User Score', value: avgRating ? `${avgRating}/10 (${reviews.length})` : 'No reviews yet' },
                      { label: 'Released', value: game.released },
                      { label: 'Metacritic', value: game.metacritic ?? 'N/A' },
                      { label: 'Platforms', value: platforms.slice(0, 2).join(', ') || 'N/A' },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ flex: '1 1 140px', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>{label}</p>
                        <p style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            {game.description_raw && (
              <div style={{ marginBottom: 40 }}>
                <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: isMobile ? 18 : 22, marginBottom: 14 }}>About</h2>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: 'rgba(255,255,255,0.55)' }}>
                  {game.description_raw.slice(0, 600)}{game.description_raw.length > 600 ? '...' : ''}
                </p>
              </div>
            )}

            {/* Screenshots */}
            {shots.length > 0 && (
              <div style={{ marginBottom: 40 }}>
                <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: isMobile ? 18 : 22, marginBottom: 14 }}>Screenshots</h2>
                <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', marginBottom: 10, aspectRatio: '16/9' }}>
                  <img src={shots[screenshotIndex]?.image} alt={`Screenshot ${screenshotIndex + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {shots.length > 1 && (
                    <>
                      <button onClick={prevShot} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                        <ChevronLeft size={15} color="#fff" />
                      </button>
                      <button onClick={nextShot} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                        <ChevronRight size={15} color="#fff" />
                      </button>
                    </>
                  )}
                  <div style={{ position: 'absolute', bottom: 10, right: 10, padding: '3px 9px', borderRadius: 20, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                    {screenshotIndex + 1} / {shots.length}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
                  {shots.map((shot, i) => (
                    <img key={shot.id} src={shot.image} alt={`thumb ${i}`} onClick={() => setScreenshotIndex(i)}
                      style={{ width: isMobile ? 80 : 100, height: isMobile ? 50 : 60, borderRadius: 8, objectFit: 'cover', flexShrink: 0, cursor: 'pointer', border: `2px solid ${i === screenshotIndex ? '#dc1e3c' : 'transparent'}`, opacity: i === screenshotIndex ? 1 : 0.5 }} />
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: isMobile ? 18 : 22 }}>
                  User Reviews
                  {reviews.length > 0 && <span style={{ marginLeft: 10, fontSize: 13, color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>({reviews.length})</span>}
                </h2>
                {avgRating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, background: 'rgba(220,30,60,0.1)', border: '1px solid rgba(220,30,60,0.2)' }}>
                    <Star size={11} color="#dc1e3c" fill="#dc1e3c" />
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#fff', fontFamily: 'Rajdhani, sans-serif' }}>{avgRating}</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>avg</span>
                  </div>
                )}
              </div>
              {loadingReviews ? (
                <div style={{ height: 80, borderRadius: 12, background: 'rgba(255,255,255,0.04)' }} />
              ) : (
                <ReviewList reviews={reviews} currentUserId={user?.id} session={session} />
              )}
            </div>
          </div>

          {/* Right — info card (desktop only) */}
          {!isMobile && !isTablet && (
            <div style={{ width: 280, flexShrink: 0 }}>
              <div style={{ borderRadius: 20, overflow: 'hidden', background: 'rgba(26,8,10,0.9)', border: '1px solid rgba(220,30,60,0.12)', backdropFilter: 'blur(20px)', position: 'sticky', top: 24 }}>
                <img src={game.background_image} alt={game.name}
                  style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                <div style={{ padding: 20 }}>
                  <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>{game.name}</h3>
                  {[
                    { label: 'RAWG Rating', value: `⭐ ${game.rating} / 5` },
                    { label: 'User Score', value: avgRating ? `${avgRating}/10 (${reviews.length} reviews)` : 'No reviews yet' },
                    { label: 'Released', value: game.released },
                    { label: 'Metacritic', value: game.metacritic ?? 'N/A' },
                    { label: 'Platforms', value: platforms.slice(0, 3).join(', ') || 'N/A' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{label}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', textAlign: 'right', maxWidth: 160 }}>{value}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 8 }}>Genres</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {genres.map(g => <GenreChip key={g} label={g} />)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ReviewRecapPopup
        open={!!reviewPopupPayload}
        payload={reviewPopupPayload}
        onClose={() => setReviewPopupPayload(null)}
      />
    </div>
  )
}

export default GameDetail