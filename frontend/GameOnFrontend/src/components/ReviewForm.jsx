import { useState, useEffect } from 'react'
import { Star, Send, Trash2 } from 'lucide-react'
import { useCreateReview, useUpdateReview, useDeleteReview } from '../hooks/useReviews'

const ReviewForm = ({ gameId, session, existingReview, onClose }) => {
  const [rating, setRating] = useState(existingReview?.rating ?? 0)
  const [hovered, setHovered] = useState(0)
  const [text, setText] = useState(existingReview?.review_text ?? '')

  const isEditing = !!existingReview
  const createReview = useCreateReview(session)
  const updateReview = useUpdateReview(session, String(gameId))
  const deleteReview = useDeleteReview(session, String(gameId))

  const handleSubmit = async () => {
    if (rating === 0) return
    if (isEditing) {
      await updateReview.mutateAsync({ reviewId: existingReview.id, data: { rating, review_text: text } })
    } else {
      await createReview.mutateAsync({ rawg_game_id: gameId, rating, review_text: text })
    }
    onClose?.()
  }

  const handleDelete = async () => {
    await deleteReview.mutateAsync(existingReview.id)
    onClose?.()
  }

  const isPending = createReview.isPending || updateReview.isPending

  return (
    <div style={{
      borderRadius: 16, padding: 24,
      background: 'rgba(26,8,10,0.95)',
      border: '1px solid rgba(220,30,60,0.15)',
      backdropFilter: 'blur(20px)',
    }}>
      <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 20 }}>
        {isEditing ? 'Edit Your Review' : 'Write a Review'}
      </h3>

      {/* Star rating */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>
          Your Rating <span style={{ color: '#dc1e3c' }}>*</span>
        </p>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {[1,2,3,4,5,6,7,8,9,10].map(i => (
            <button
              key={i}
              onClick={() => setRating(i)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(0)}
              style={{
                width: 32, height: 32, borderRadius: 8, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i <= (hovered || rating) ? 'rgba(220,30,60,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${i <= (hovered || rating) ? 'rgba(220,30,60,0.4)' : 'rgba(255,255,255,0.08)'}`,
                transition: 'all 0.15s',
              }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: i <= (hovered || rating) ? '#dc1e3c' : 'rgba(255,255,255,0.3)' }}>
                {i}
              </span>
            </button>
          ))}
          {rating > 0 && (
            <span style={{ marginLeft: 8, fontSize: 13, color: '#dc1e3c', fontWeight: 600 }}>
              {rating}/10
            </span>
          )}
        </div>
      </div>

      {/* Text area */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Review (optional)</p>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Share your thoughts about this game..."
          rows={4}
          style={{
            width: '100%', borderRadius: 12, padding: '12px 14px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#fff', fontSize: 13, resize: 'vertical',
            fontFamily: 'Outfit, sans-serif', outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(220,30,60,0.4)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || isPending}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 10, cursor: rating === 0 ? 'not-allowed' : 'pointer',
              background: rating === 0 ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #dc1e3c, #9b0020)',
              border: 'none', color: '#fff', fontSize: 13, fontWeight: 600,
              opacity: isPending ? 0.7 : 1,
              boxShadow: rating > 0 ? '0 4px 15px rgba(220,30,60,0.35)' : 'none',
              transition: 'all 0.2s',
            }}>
            <Send size={13} />
            {isPending ? 'Submitting...' : isEditing ? 'Update' : 'Submit Review'}
          </button>

          {onClose && (
            <button onClick={onClose} style={{ padding: '10px 16px', borderRadius: 10, cursor: 'pointer', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: 13, transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
              Cancel
            </button>
          )}
        </div>

        {isEditing && (
          <button onClick={handleDelete} disabled={deleteReview.isPending}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, cursor: 'pointer', background: 'rgba(220,30,60,0.1)', border: '1px solid rgba(220,30,60,0.2)', color: '#dc1e3c', fontSize: 13, transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,30,60,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(220,30,60,0.1)'}>
            <Trash2 size={13} />
            Delete
          </button>
        )}
      </div>
    </div>
  )
}

export default ReviewForm