import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Star, Edit2, Save, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useUserProfile, useUserReviews, useUpdateProfile } from '../hooks/useProfile'
import { useGameDetailsBatch } from '../hooks/useGames'
import { useWindowSize } from '../hooks/useWindowSize'

const Profile = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user, session } = useAuth()
  const { isMobile } = useWindowSize()
  const isOwnProfile = user?.id === userId

  const [editing, setEditing] = useState(false)
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')

  const { data: profile, isLoading: loadingProfile } = useUserProfile(userId)
  const { data: reviewsData } = useUserReviews(userId)
  const updateProfile = useUpdateProfile(userId)

  const reviews = reviewsData?.results ?? []
  const ids = reviews.map(r => r.rawg_game_id)
  const { data: gameDetails } = useGameDetailsBatch(ids)

  const enrichedReviews = reviews.map((review, i) => ({
    ...review,
    gameName: gameDetails[i]?.name ?? 'Unknown',
    gameCover: gameDetails[i]?.background_image ?? null,
    gameId: gameDetails[i]?.id,
  }))

  useEffect(() => {
    if (profile) {
      setUsername(profile.username ?? '')
      setBio(profile.bio ?? '')
    }
  }, [profile])

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const handleSave = async () => {
    await updateProfile.mutateAsync({ data: { username, bio }, session })
    setEditing(false)
  }

  if (loadingProfile) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0608' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(220,30,60,0.2)', borderTopColor: '#dc1e3c', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (!profile) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0608' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)' }}>Profile not found</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0608', color: '#fff', fontFamily: 'Outfit, sans-serif' }}>
      {/* Top bar */}
      <div style={{ padding: isMobile ? '14px 16px' : '20px 40px', borderBottom: '1px solid rgba(220,30,60,0.08)', background: 'rgba(10,6,8,0.9)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => navigate('/dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 12, cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(220,30,60,0.2)', color: '#fff', fontSize: 13, flexShrink: 0 }}>
          <ArrowLeft size={14} /> {!isMobile && 'Dashboard'}
        </button>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Profile</span>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '24px 16px' : '48px 40px' }}>
        {/* Profile header */}
        <div style={{ display: 'flex', alignItems: isMobile ? 'center' : 'flex-start', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 16 : 28, marginBottom: 32, padding: isMobile ? '20px 16px' : 32, borderRadius: 20, background: 'rgba(26,8,10,0.9)', border: '1px solid rgba(220,30,60,0.12)', backdropFilter: 'blur(20px)', textAlign: isMobile ? 'center' : 'left' }}>
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="avatar"
              style={{ width: isMobile ? 72 : 80, height: isMobile ? 72 : 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(220,30,60,0.3)', flexShrink: 0 }} />
          ) : (
            <div style={{ width: isMobile ? 72 : 80, height: isMobile ? 72 : 80, borderRadius: '50%', background: 'linear-gradient(135deg, #dc1e3c, #7b2d8b)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={28} color="#fff" />
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0, width: isMobile ? '100%' : 'auto' }}>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(220,30,60,0.3)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'Outfit, sans-serif', width: '100%', boxSizing: 'border-box' }} />
                <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Write a short bio..." rows={3}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(220,30,60,0.3)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'Outfit, sans-serif', width: '100%', boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', gap: 10, justifyContent: isMobile ? 'center' : 'flex-start' }}>
                  <button onClick={handleSave} disabled={updateProfile.isPending}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, cursor: 'pointer', background: 'linear-gradient(135deg, #dc1e3c, #9b0020)', border: 'none', color: '#fff', fontSize: 13 }}>
                    <Save size={13} /> {updateProfile.isPending ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setEditing(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, cursor: 'pointer', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                    <X size={13} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, justifyContent: isMobile ? 'center' : 'flex-start', flexWrap: 'wrap' }}>
                  <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: isMobile ? 22 : 28, color: '#fff' }}>
                    {profile.username || 'Anonymous Player'}
                  </h1>
                  {isOwnProfile && (
                    <button onClick={() => setEditing(true)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', background: 'rgba(220,30,60,0.1)', border: '1px solid rgba(220,30,60,0.25)', color: '#dc1e3c', fontSize: 12 }}>
                      <Edit2 size={11} /> Edit
                    </button>
                  )}
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 6, lineHeight: 1.5 }}>
                  {profile.bio || (isOwnProfile ? 'No bio yet — click Edit to add one.' : 'No bio.')}
                </p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
                  Member since {new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 36 }}>
          {[
            { label: 'Total Reviews', value: reviews.length },
            { label: 'Avg Rating Given', value: avgRating ? `${avgRating} / 10` : '—' },
          ].map(({ label, value }) => (
            <div key={label} style={{ flex: 1, padding: isMobile ? '16px' : '20px 24px', borderRadius: 16, background: 'rgba(26,8,10,0.9)', border: '1px solid rgba(220,30,60,0.12)', backdropFilter: 'blur(20px)', textAlign: isMobile ? 'center' : 'left' }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</p>
              <p style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: isMobile ? 26 : 32, color: '#fff' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Reviews list */}
        <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: isMobile ? 18 : 22, marginBottom: 18 }}>
          Reviews {reviews.length > 0 && <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>({reviews.length})</span>}
        </h2>

        {enrichedReviews.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 14 }}>No reviews yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {enrichedReviews.map(review => (
              <div key={review.id}
                onClick={() => review.gameId && navigate(`/game/${review.gameId}`)}
                style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 16, padding: isMobile ? '12px 14px' : '16px 20px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', cursor: review.gameId ? 'pointer' : 'default', transition: 'background 0.2s' }}
                onMouseEnter={e => { if (review.gameId) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                {review.gameCover && (
                  <img src={review.gameCover} alt={review.gameName}
                    style={{ width: isMobile ? 44 : 56, height: isMobile ? 44 : 56, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: isMobile ? 13 : 14, color: '#fff', marginBottom: 3 }}>{review.gameName}</p>
                  {!isMobile && review.review_text && (
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {review.review_text}
                    </p>
                  )}
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 3 }}>
                    {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: 'rgba(220,30,60,0.12)', border: '1px solid rgba(220,30,60,0.25)', flexShrink: 0 }}>
                  <Star size={10} color="#dc1e3c" fill="#dc1e3c" />
                  <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 800, fontSize: 14, color: '#fff' }}>{review.rating}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>/10</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile