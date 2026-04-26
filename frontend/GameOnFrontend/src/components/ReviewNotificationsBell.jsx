import { useEffect, useMemo, useRef, useState } from 'react'
import { Bell, Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useMyLikeNotifications } from '../hooks/useReviews'
import { useWindowSize } from '../hooks/useWindowSize'

const ReviewNotificationsBell = ({ session }) => {
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)
  const navigate = useNavigate()
  const { isMobile } = useWindowSize()
  const { data } = useMyLikeNotifications(session)

  const totalLikes = data?.total_likes ?? 0
  const notifications = useMemo(() => data?.notifications ?? [], [data?.notifications])
  const unreadBadge = Math.min(totalLikes, 99)

  const previewItems = useMemo(() => notifications.slice(0, 6), [notifications])

  useEffect(() => {
    const handler = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const openGame = (rawgGameId) => {
    if (!rawgGameId) return
    navigate(`/game/${rawgGameId}`)
    setOpen(false)
  }

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((value) => !value)}
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: open ? 'rgba(220,30,60,0.14)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${open ? 'rgba(220,30,60,0.45)' : 'rgba(220,30,60,0.12)'}`,
          cursor: 'pointer',
          transition: 'all 0.2s',
          position: 'relative',
        }}
      >
        <Bell size={15} color={open ? '#fff' : '#8a5a62'} />
        {unreadBadge > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -5,
              right: -5,
              minWidth: 18,
              height: 18,
              borderRadius: 999,
              background: 'linear-gradient(135deg, #f43f5e, #dc1e3c)',
              border: '1px solid rgba(255,255,255,0.22)',
              color: '#fff',
              fontSize: 10,
              fontWeight: 800,
              lineHeight: '16px',
              padding: '0 5px',
              textAlign: 'center',
            }}
          >
            {unreadBadge}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: isMobile ? 'fixed' : 'absolute',
            top: isMobile ? 64 : 'calc(100% + 8px)',
            right: isMobile ? 12 : 0,
            left: isMobile ? 12 : 'auto',
            width: isMobile ? 'auto' : 320,
            maxHeight: isMobile ? 'min(420px, calc(100vh - 84px))' : 360,
            overflowY: 'auto',
            borderRadius: isMobile ? 16 : 14,
            zIndex: 240,
            background: 'rgba(20,8,10,0.98)',
            border: '1px solid rgba(220,30,60,0.15)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
            backdropFilter: 'blur(30px)',
          }}
        >
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Review Notifications</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>
              {totalLikes > 0
                ? `${totalLikes} total likes on your reviews`
                : 'No likes on your reviews yet'}
            </p>
          </div>

          {previewItems.length === 0 ? (
            <div style={{ padding: '18px 16px', color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
              When someone likes your review, it will show up here.
            </div>
          ) : (
            <div>
              {previewItems.map((item) => (
                <button
                  key={item.review_id}
                  onClick={() => openGame(item.rawg_game_id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 16px',
                    border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    background: 'transparent',
                    cursor: item.rawg_game_id ? 'pointer' : 'default',
                    color: 'inherit',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Heart size={12} color="#fb7185" fill="#fb7185" />
                    <span style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>
                      {item.like_count} {item.like_count === 1 ? 'person liked' : 'people liked'} your review
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      lineHeight: 1.5,
                      color: 'rgba(255,255,255,0.6)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    "{item.review_excerpt}"
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ReviewNotificationsBell
