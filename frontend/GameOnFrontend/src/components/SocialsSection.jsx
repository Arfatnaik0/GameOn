import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronLeft, ChevronRight, Clock, Search, Star, Trash2, User, UserPlus, Users, X } from 'lucide-react'
import { getGameCoverUrl } from '../api/games'
import { useGameDetailsBatch } from '../hooks/useGames'
import { useDebounce } from '../hooks/useDebounce'
import { useWindowSize } from '../hooks/useWindowSize'
import {
  useAcceptFriendRequest,
  useDeleteFriendRequest,
  useFriendReviews,
  useProfileSearch,
  useRemoveFriend,
  useSendFriendRequest,
  useSocialSummary,
} from '../hooks/useSocials'
import ReviewReactionButtons from './ReviewReactionButtons'

const ProfileAvatar = ({ profile, size = 28 }) => (
  profile?.avatar_url ? (
    <img
      src={profile.avatar_url}
      alt="avatar"
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.14)' }}
    />
  ) : (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, #dc1e3c, #7b2d8b)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <User size={Math.max(12, size - 14)} color="#fff" />
    </div>
  )
)

const SocialsSection = ({ session }) => {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const { isMobile, isTablet } = useWindowSize()
  const debouncedQuery = useDebounce(query, 250)

  const { data: summaryData, isLoading: loadingSummary } = useSocialSummary(session)
  const { data: searchData } = useProfileSearch(debouncedQuery, session)
  const { data: reviewsData, isLoading: loadingReviews } = useFriendReviews(page, 8, session)
  const sendRequest = useSendFriendRequest(session)
  const acceptRequest = useAcceptFriendRequest(session)
  const deleteRequest = useDeleteFriendRequest(session)
  const removeFriend = useRemoveFriend(session)

  const friends = useMemo(() => summaryData?.friends ?? [], [summaryData?.friends])
  const incomingRequests = useMemo(() => summaryData?.incoming_requests ?? [], [summaryData?.incoming_requests])
  const outgoingRequests = useMemo(() => summaryData?.outgoing_requests ?? [], [summaryData?.outgoing_requests])
  const reviews = useMemo(() => reviewsData?.results ?? [], [reviewsData?.results])
  const totalPages = reviewsData?.total_pages ?? 1

  const relatedProfileIds = useMemo(() => new Set([
    ...friends.map(item => item.profile_id),
    ...incomingRequests.map(item => item.profile_id),
    ...outgoingRequests.map(item => item.profile_id),
  ]), [friends, incomingRequests, outgoingRequests])

  const gameIds = useMemo(() => reviews.map(review => review.rawg_game_id), [reviews])
  const { data: gameDetails } = useGameDetailsBatch(gameIds)
  const enrichedReviews = reviews.map((review, index) => ({
    ...review,
    gameId: gameDetails?.[index]?.id,
    gameName: gameDetails?.[index]?.name ?? `RAWG #${review.rawg_game_id}`,
    gameCover: getGameCoverUrl(gameDetails?.[index]?.background_image),
  }))

  const actionStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 30,
    padding: '0 10px',
    borderRadius: 9,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
  }

  const handleMutation = async (mutation, payload, successText) => {
    setMessage('')
    try {
      await mutation.mutateAsync(payload)
      setMessage(successText)
    } catch (error) {
      setMessage(error?.response?.data?.detail || 'Something went wrong')
    }
  }

  if (!session?.access_token) {
    return (
      <section style={{ borderRadius: 18, padding: isMobile ? 16 : 18, border: '1px solid rgba(220,30,60,0.16)', background: 'rgba(26,8,10,0.78)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Users size={18} color="#fb7185" />
          <div>
            <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: isMobile ? 18 : 20, color: '#fff' }}>Socials</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>Sign in to add friends and see reviews from only your circle.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section style={{ borderRadius: 18, padding: isMobile ? 14 : 18, border: '1px solid rgba(220,30,60,0.14)', background: 'linear-gradient(180deg, rgba(24,8,12,0.94), rgba(12,7,12,0.96))', boxShadow: '0 16px 46px rgba(0,0,0,0.34)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: 12, flexDirection: isMobile ? 'column' : 'row', marginBottom: 14 }}>
        <div>
          <p style={{ color: '#fb7185', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.6, fontWeight: 800, marginBottom: 4 }}>Socials</p>
          <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: isMobile ? 20 : 24, color: '#fff', lineHeight: 1 }}>Friend Reviews</h2>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.05)' }}>{friends.length} friends</span>
          {incomingRequests.length > 0 && (
            <span style={{ fontSize: 12, color: '#fecdd3', padding: '6px 10px', borderRadius: 999, background: 'rgba(220,30,60,0.16)' }}>{incomingRequests.length} requests</span>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile || isTablet ? '1fr' : '340px 1fr', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ borderRadius: 14, padding: 12, background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 11px', borderRadius: 10, background: 'rgba(0,0,0,0.22)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Search size={14} color="rgba(255,255,255,0.38)" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search username"
                style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 13, fontFamily: 'Outfit, sans-serif' }}
              />
            </label>
            {message && <p style={{ color: message.includes('wrong') || message.includes('already') ? '#fda4af' : '#86efac', fontSize: 11, marginTop: 8 }}>{message}</p>}
            {debouncedQuery.trim().length >= 2 && (
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(searchData?.results ?? []).length === 0 ? (
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>No players found.</p>
                ) : (
                  searchData.results.map(profile => {
                    const related = relatedProfileIds.has(profile.id)
                    return (
                      <div key={profile.id} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <ProfileAvatar profile={profile} size={28} />
                        <button onClick={() => navigate(`/profile/${profile.id}`)} style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer' }}>
                          <p style={{ color: '#fff', fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.username || 'Anonymous'}</p>
                        </button>
                        <button
                          disabled={related || sendRequest.isPending}
                          onClick={() => handleMutation(sendRequest, profile.id, 'Request sent')}
                          style={{ ...actionStyle, opacity: related ? 0.45 : 1, cursor: related ? 'default' : 'pointer' }}
                        >
                          <UserPlus size={13} /> {related ? 'Added' : 'Add'}
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {(incomingRequests.length > 0 || outgoingRequests.length > 0 || friends.length > 0 || loadingSummary) && (
            <div style={{ borderRadius: 14, padding: 12, background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 800, marginBottom: 10 }}>Connections</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {incomingRequests.map(request => (
                  <div key={request.id} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <ProfileAvatar profile={request.profile} size={28} />
                    <span style={{ flex: 1, color: '#fff', fontSize: 13, fontWeight: 700 }}>{request.profile?.username || 'Player'}</span>
                    <button onClick={() => handleMutation(acceptRequest, request.id, 'Friend added')} style={{ ...actionStyle, color: '#bbf7d0' }}><Check size={13} /></button>
                    <button onClick={() => handleMutation(deleteRequest, request.id, 'Request declined')} style={{ ...actionStyle, color: '#fda4af' }}><X size={13} /></button>
                  </div>
                ))}
                {outgoingRequests.map(request => (
                  <div key={request.id} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <ProfileAvatar profile={request.profile} size={28} />
                    <span style={{ flex: 1, color: 'rgba(255,255,255,0.72)', fontSize: 13 }}>{request.profile?.username || 'Player'}</span>
                    <Clock size={13} color="rgba(255,255,255,0.38)" />
                  </div>
                ))}
                {friends.map(friend => (
                  <div key={friend.id} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <ProfileAvatar profile={friend.profile} size={28} />
                    <button onClick={() => navigate(`/profile/${friend.profile_id}`)} style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', color: '#fff', textAlign: 'left', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      {friend.profile?.username || 'Player'}
                    </button>
                    <button onClick={() => handleMutation(removeFriend, friend.profile_id, 'Friend removed')} style={{ ...actionStyle, color: 'rgba(255,255,255,0.48)' }}><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ minWidth: 0 }}>
          {loadingReviews ? (
            <div style={{ height: 160, borderRadius: 14, background: 'rgba(255,255,255,0.04)' }} />
          ) : enrichedReviews.length === 0 ? (
            <div style={{ minHeight: 160, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13 }}>Add friends to see only their latest reviews here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {enrichedReviews.map(review => (
                <article key={review.id} onClick={() => review.gameId && navigate(`/game/${review.gameId}`)} style={{ display: 'grid', gridTemplateColumns: isMobile ? '54px 1fr' : '62px 1fr', gap: 12, padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.07)', cursor: review.gameId ? 'pointer' : 'default' }}>
                  {review.gameCover ? (
                    <img src={review.gameCover} alt={review.gameName} style={{ width: isMobile ? 54 : 62, height: isMobile ? 72 : 82, borderRadius: 8, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: isMobile ? 54 : 62, height: isMobile ? 72 : 82, borderRadius: 8, background: 'rgba(255,255,255,0.06)' }} />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 5 }}>
                      <ProfileAvatar profile={review.profiles} size={22} />
                      <span style={{ color: 'rgba(255,255,255,0.82)', fontSize: 12, fontWeight: 700 }}>{review.profiles?.username || 'Anonymous'}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: '#fff', fontSize: 12, fontWeight: 800 }}>
                        <Star size={10} color="#dc1e3c" fill="#dc1e3c" /> {review.rating}/10
                      </span>
                    </div>
                    <h3 style={{ fontFamily: 'Rajdhani, sans-serif', color: '#fff', fontSize: isMobile ? 17 : 19, lineHeight: 1.1, marginBottom: 5 }}>{review.gameName}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.58)', fontSize: isMobile ? 12 : 13, lineHeight: 1.55, marginBottom: 9, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {review.review_text?.trim() || 'No written review.'}
                    </p>
                    <ReviewReactionButtons review={review} session={session} compact />
                  </div>
                </article>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10 }}>
              <button onClick={() => setPage(prev => Math.max(1, prev - 1))} disabled={page === 1} style={{ ...actionStyle, opacity: page === 1 ? 0.45 : 1 }}>
                <ChevronLeft size={13} /> Prev
              </button>
              <span style={{ color: 'rgba(255,255,255,0.42)', fontSize: 12 }}>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(prev => Math.min(totalPages, prev + 1))} disabled={page === totalPages} style={{ ...actionStyle, opacity: page === totalPages ? 0.45 : 1 }}>
                Next <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default SocialsSection
