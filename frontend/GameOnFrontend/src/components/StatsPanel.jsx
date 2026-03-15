import { TrendingUp } from 'lucide-react'

const StatsPanel = ({ reviewCount = 0 }) => {
  const maxReviews = 20
  const circumference = 2 * Math.PI * 48
  const progress = Math.min(reviewCount / maxReviews, 1)
  const dashArray = `${progress * circumference} ${circumference}`

  return (
    <div style={{
      flexShrink: 0,
      height: '100%',
      borderRadius: 20,
      overflow: 'hidden',
      background: 'rgba(26,8,10,0.9)',
      border: '1px solid rgba(220,30,60,0.12)',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 18px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 17, color: '#fff' }}>
          Your Statistics
        </h3>
        <TrendingUp size={15} color="#dc1e3c" />
      </div>

      {/* Ring */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 14 }}>
          <svg viewBox="0 0 110 110" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            {/* Track */}
            <circle cx="55" cy="55" r="48" fill="none" stroke="rgba(220,30,60,0.1)" strokeWidth="7" />
            {/* Progress */}
            <circle
              cx="55" cy="55" r="48"
              fill="none"
              stroke="url(#reviewGrad)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={dashArray}
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
            <defs>
              <linearGradient id="reviewGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#dc1e3c" />
                <stop offset="100%" stopColor="#ff6b35" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center text */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 30, fontWeight: 800, color: '#fff', lineHeight: 1, fontFamily: 'Rajdhani, sans-serif' }}>
              {reviewCount}
            </span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>Reviews</span>
          </div>
        </div>

        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
          {reviewCount === 0 ? 'Start reviewing games!' : reviewCount < 5 ? 'Keep going!' : 'Great reviewer!'}
        </p>
      </div>
    </div>
  )
}

export default StatsPanel