import { useNavigate } from 'react-router-dom'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { useClearReviewReaction, useSetReviewReaction } from '../hooks/useReviews'

const ReviewReactionButtons = ({ review, session, compact = false }) => {
  const navigate = useNavigate()
  const setReaction = useSetReviewReaction(session)
  const clearReaction = useClearReviewReaction(session)

  const likeCount = review?.like_count ?? 0
  const dislikeCount = review?.dislike_count ?? 0
  const currentReaction = review?.current_user_reaction ?? null
  const loading = setReaction.isPending || clearReaction.isPending

  const handleReaction = async (reaction, event) => {
    event?.stopPropagation?.()
    if (!session?.access_token) {
      navigate('/login')
      return
    }

    if (!review?.id || loading) return

    if (currentReaction === reaction) {
      await clearReaction.mutateAsync({ reviewId: review.id })
      return
    }

    await setReaction.mutateAsync({ reviewId: review.id, reaction })
  }

  const buttonBaseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: compact ? 4 : 6,
    padding: compact ? '4px 9px' : '6px 10px',
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.04)',
    color: 'rgba(255,255,255,0.72)',
    fontSize: compact ? 11 : 12,
    fontWeight: 600,
    lineHeight: 1,
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: loading ? 0.7 : 1,
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 6 : 8 }}>
      <button
        onClick={(event) => handleReaction('like', event)}
        disabled={loading}
        style={{
          ...buttonBaseStyle,
          borderColor: currentReaction === 'like' ? 'rgba(52,211,153,0.45)' : 'rgba(255,255,255,0.14)',
          background: currentReaction === 'like' ? 'rgba(16,185,129,0.16)' : buttonBaseStyle.background,
          color: currentReaction === 'like' ? '#6ee7b7' : buttonBaseStyle.color,
        }}
      >
        <ThumbsUp size={compact ? 12 : 13} />
        <span>{likeCount}</span>
      </button>

      <button
        onClick={(event) => handleReaction('dislike', event)}
        disabled={loading}
        style={{
          ...buttonBaseStyle,
          borderColor: currentReaction === 'dislike' ? 'rgba(251,113,133,0.45)' : 'rgba(255,255,255,0.14)',
          background: currentReaction === 'dislike' ? 'rgba(244,63,94,0.16)' : buttonBaseStyle.background,
          color: currentReaction === 'dislike' ? '#fda4af' : buttonBaseStyle.color,
        }}
      >
        <ThumbsDown size={compact ? 12 : 13} />
        <span>{dislikeCount}</span>
      </button>
    </div>
  )
}

export default ReviewReactionButtons
