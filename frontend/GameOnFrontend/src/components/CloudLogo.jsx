import { useState } from 'react'
import { BRANDING } from '../config/branding'

const CloudLogo = ({ size = 36 }) => {
  const [hasError, setHasError] = useState(false)

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {!hasError ? (
        <img
          src={BRANDING.logoPath}
          alt={BRANDING.logoAlt}
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          onError={() => setHasError(true)}
        />
      ) : (
        <span style={{ color: '#fff', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: Math.max(12, size * 0.35) }}>
          GO
        </span>
      )}
    </div>
  )
}

export default CloudLogo