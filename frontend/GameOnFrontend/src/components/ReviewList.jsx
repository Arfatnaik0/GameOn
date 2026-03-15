import { Star, User } from 'lucide-react'

const ReviewList = ({ reviews, currentUserId }) => {
  if (!reviews?.length) return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 14 }}>No reviews yet. Be the first!</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {reviews.map(review => (
        <div key={review.id} style={{
          padding: '16px 20px', borderRadius: 14,
          background: review.user_id === currentUserId ? 'rgba(220,30,60,0.06)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${review.user_id === currentUserId ? 'rgba(220,30,60,0.2)' : 'rgba(255,255,255,0.06)'}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            {/* User info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {review.profiles?.avatar_url ? (
                <img src={review.profiles.avatar_url} alt="avatar"
                  style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #dc1e3c, #7b2d8b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={14} color="#fff" />
                </div>
              )}
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                  {review.profiles?.username ?? 'Anonymous'}
                  {review.user_id === currentUserId && (
                    <span style={{ marginLeft: 8, fontSize: 10, color: '#dc1e3c', fontWeight: 700 }}>YOU</span>
                  )}
                </p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                  {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Rating badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 20,
              background: 'rgba(220,30,60,0.12)', border: '1px solid rgba(220,30,60,0.25)',
            }}>
              <Star size={11} color="#dc1e3c" fill="#dc1e3c" />
              <span style={{ fontSize: 14, fontWeight: 800, color: '#fff', fontFamily: 'Rajdhani, sans-serif' }}>
                {review.rating}
              </span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>/10</span>
            </div>
          </div>

          {review.review_text && (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
              {review.review_text}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

export default ReviewList