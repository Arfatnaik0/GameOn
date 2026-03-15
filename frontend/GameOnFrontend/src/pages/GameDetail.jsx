import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGameDetail, useGameScreenshots } from '../hooks/useGames'
import { useGameReviews, useMyReviewForGame } from '../hooks/useReviews'
import { useAuth } from '../context/AuthContext'
import GenreChip from '../components/GenreChip'
import ReviewForm from '../components/ReviewForm'
import ReviewList from '../components/ReviewList'
import AddToListButton from '../components/AddToListButton'
import GuestBanner from '../components/GuestBanner'
import { ArrowLeft, Star, Calendar, ChevronLeft, ChevronRight, PenLine, Edit2, LogIn } from 'lucide-react'

const GameDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, session } = useAuth()
  const [screenshotIndex, setScreenshotIndex] = useState(0)
  const [showForm, setShowForm] = useState(false)

  const { data: game, isLoading: loadingGame } = useGameDetail(id)
  const { data: screenshots } = useGameScreenshots(id)
  const { data: reviewsData, isLoading: loadingReviews } = useGameReviews(id)
  const { data: myReviewData } = useMyReviewForGame(id, session)

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

  // Average user rating from reviews
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="page-scrollable" style={{ background: '#0a0608', color: '#fff', fontFamily: 'Outfit, sans-serif' }}>

      {/* Hero */}
      <div style={{ position: 'relative', height: 480, overflow: 'hidden' }}>
        <img src={game.background_image} alt={game.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0a0608 0%, rgba(10,6,8,0.5) 50%, rgba(10,6,8,0.2) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,6,8,0.8) 0%, transparent 60%)' }} />

        {/* Back */}
        <button onClick={() => navigate('/dashboard')}
          style={{ position: 'absolute', top: 24, left: 24, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, cursor: 'pointer', background: 'rgba(10,6,8,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(220,30,60,0.2)', color: '#fff', fontSize: 13, fontWeight: 500, transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(220,30,60,0.5)'; e.currentTarget.style.background = 'rgba(220,30,60,0.1)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(220,30,60,0.2)'; e.currentTarget.style.background = 'rgba(10,6,8,0.7)' }}>
          <ArrowLeft size={15} /> Back to Dashboard
        </button>

        {/* Hero content */}
        <div style={{ position: 'absolute', bottom: 40, left: 48, maxWidth: 600 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {genres.slice(0, 4).map(g => <GenreChip key={g} label={g} />)}
          </div>
          <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 800, fontSize: 52, lineHeight: 1.1, marginBottom: 14, textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}>
            {game.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Star size={14} color="#f59e0b" fill="#f59e0b" />
              <span style={{ fontSize: 15, fontWeight: 700 }}>{game.rating}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>/5 RAWG</span>
            </div>
            {avgRating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Star size={14} color="#dc1e3c" fill="#dc1e3c" />
                <span style={{ fontSize: 15, fontWeight: 700 }}>{avgRating}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>/10 Users ({reviews.length})</span>
              </div>
            )}
            {game.metacritic && (
              <div style={{ padding: '3px 10px', borderRadius: 8, background: 'rgba(100,200,100,0.15)', border: '1px solid rgba(100,200,100,0.3)' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#6fcf97' }}>MC {game.metacritic}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={13} color="rgba(255,255,255,0.4)" />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{game.released}</span>
            </div>
          </div>

          {/* CTA */}
          {user ? (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <button
      onClick={() => setShowForm(true)}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 28px', borderRadius: 14, cursor: 'pointer', background: 'linear-gradient(135deg, #dc1e3c, #9b0020)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, boxShadow: '0 6px 25px rgba(220,30,60,0.45)', transition: 'all 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 35px rgba(220,30,60,0.6)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 25px rgba(220,30,60,0.45)' }}>
      {myReview ? <><Edit2 size={16} /> Edit Your Review</> : <><PenLine size={16} /> Write a Review</>}
    </button>
    <AddToListButton gameId={Number(id)} session={session} dropUp />
  </div>
) : (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <button
      onClick={() => navigate('/login')}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 28px', borderRadius: 14, cursor: 'pointer', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 600, transition: 'all 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(220,30,60,0.4)'; e.currentTarget.style.color = '#fff' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}>
      <LogIn size={16} /> Sign in to Review
    </button>
  </div>
)}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 48px 80px' }}>
        <div style={{ display: 'flex', gap: 48 }}>

          {/* Left column */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Review form */}
            {showForm && (
              <div style={{ marginBottom: 40 }}>
                <ReviewForm
                  gameId={Number(id)}
                  session={session}
                  existingReview={myReview}
                  onClose={() => setShowForm(false)}
                />
              </div>
            )}

            {/* Description */}
            {game.description_raw && (
              <div style={{ marginBottom: 48 }}>
                <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 22, marginBottom: 16 }}>About</h2>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: 'rgba(255,255,255,0.55)', maxWidth: 680 }}>
                  {game.description_raw.slice(0, 600)}{game.description_raw.length > 600 ? '...' : ''}
                </p>
              </div>
            )}

            {/* Screenshots */}
            {shots.length > 0 && (
              <div style={{ marginBottom: 48 }}>
                <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 22, marginBottom: 16 }}>Screenshots</h2>
                <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', marginBottom: 12, aspectRatio: '16/9' }}>
                  <img src={shots[screenshotIndex]?.image} alt={`Screenshot ${screenshotIndex + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s' }} />
                  {shots.length > 1 && (
                    <>
                      <button onClick={prevShot} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                        <ChevronLeft size={16} color="#fff" />
                      </button>
                      <button onClick={nextShot} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                        <ChevronRight size={16} color="#fff" />
                      </button>
                    </>
                  )}
                  <div style={{ position: 'absolute', bottom: 12, right: 12, padding: '4px 10px', borderRadius: 20, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                    {screenshotIndex + 1} / {shots.length}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
                  {shots.map((shot, i) => (
                    <img key={shot.id} src={shot.image} alt={`thumb ${i}`} onClick={() => setScreenshotIndex(i)}
                      style={{ width: 100, height: 60, borderRadius: 8, objectFit: 'cover', flexShrink: 0, cursor: 'pointer', transition: 'all 0.2s', border: `2px solid ${i === screenshotIndex ? '#dc1e3c' : 'transparent'}`, opacity: i === screenshotIndex ? 1 : 0.5 }} />
                  ))}
                </div>
              </div>
            )}

            {/* Reviews section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 22 }}>
                  User Reviews
                  {reviews.length > 0 && (
                    <span style={{ marginLeft: 10, fontSize: 14, color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>
                      ({reviews.length})
                    </span>
                  )}
                </h2>
                {avgRating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: 'rgba(220,30,60,0.1)', border: '1px solid rgba(220,30,60,0.2)' }}>
                    <Star size={12} color="#dc1e3c" fill="#dc1e3c" />
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', fontFamily: 'Rajdhani, sans-serif' }}>{avgRating}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>avg</span>
                  </div>
                )}
              </div>
              {loadingReviews ? (
                <div style={{ height: 80, borderRadius: 12, background: 'rgba(255,255,255,0.04)', animation: 'pulse 2s infinite' }} />
              ) : (
                <ReviewList reviews={reviews} currentUserId={user?.id} />
              )}
            </div>
          </div>

          {/* Right — info card */}
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

        </div>
      </div>
    </div>
  )
}

export default GameDetail