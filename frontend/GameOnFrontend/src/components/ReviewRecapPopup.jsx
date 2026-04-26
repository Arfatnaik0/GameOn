import { useEffect, useRef, useState } from 'react'
import { X, Star, User } from 'lucide-react'
import CloudLogo from './CloudLogo'

const ReviewRecapPopup = ({ open, onClose, payload }) => {
  const cardRef = useRef(null)
  const [coverFailed, setCoverFailed] = useState(false)
  const [avatarFailed, setAvatarFailed] = useState(false)

  useEffect(() => {
    setCoverFailed(false)
    setAvatarFailed(false)
  }, [payload])

  if (!open || !payload) return null

  const {
    gameName,
    gameCover,
    gameType = 'Game',
    released,
    rating,
    reviewText,
    userName,
    userHandle,
    userAvatar,
  } = payload

  const year = released ? String(released).slice(0, 4) : 'N/A'
  const hasValidAvatar = Boolean(userAvatar) && !avatarFailed

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(5, 4, 10, 0.78)',
        backdropFilter: 'blur(8px)',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        ref={cardRef}
        style={{
          width: '100%',
          maxWidth: 520,
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: 22,
          padding: 18,
          background: 'linear-gradient(180deg, rgba(18,14,26,0.98), rgba(12,10,20,0.98))',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 25px 90px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: 1.2, textTransform: 'uppercase' }}>
            Your Review Snapshot
          </span>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={onClose}
              style={{
                width: 30,
                height: 30,
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          {!coverFailed && gameCover ? (
            <img
              src={gameCover}
              alt={gameName}
              style={{ width: 82, height: 112, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }}
              onError={() => setCoverFailed(true)}
            />
          ) : (
            <div
              style={{
                width: 82,
                height: 112,
                borderRadius: 12,
                flexShrink: 0,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'linear-gradient(160deg, rgba(220,30,60,0.18), rgba(30,18,46,0.85))',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: 8,
              }}
            >
              <CloudLogo size={24} />
              <span style={{ fontSize: 9, textAlign: 'center', color: 'rgba(255,255,255,0.7)', lineHeight: 1.2 }}>
                Cover unavailable
              </span>
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 20, color: '#fff', lineHeight: 1.2, marginBottom: 6 }}>
              {gameName}
            </h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 12 }}>
              {gameType} • {year}
            </p>

            {/* Rating strip replaces the old "Go For It" area */}
            <div style={{
              borderRadius: 999,
              minHeight: 38,
              padding: '8px 14px',
              background: 'linear-gradient(135deg, #dc1e3c, #7c0b2f)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
            }}>
              <span style={{ fontSize: 11, letterSpacing: 1.2, fontWeight: 700, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase' }}>
                Your Rating
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Star size={14} fill="#fff" color="#fff" />
                <span style={{ fontSize: 14, fontWeight: 800, color: '#fff', fontFamily: 'Rajdhani, sans-serif' }}>
                  {rating}/10
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {hasValidAvatar ? (
              <img
                src={userAvatar}
                alt="avatar"
                onError={() => setAvatarFailed(true)}
                style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={16} color="#fff" />
              </div>
            )}
            <div>
              <p style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{userName}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{userHandle}</p>
            </div>
          </div>
          <CloudLogo size={30} />
        </div>

        <div style={{
          borderRadius: 14,
          padding: 14,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: 'rgba(255,255,255,0.9)', whiteSpace: 'pre-wrap' }}>
            {reviewText?.trim() || 'No written review provided.'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ReviewRecapPopup
