import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Gamepad2 } from 'lucide-react'
import GenreChip from './GenreChip'

const HeroCarousel = ({ games }) => {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)
  const navigate = useNavigate()

  const go = (index) => {
    if (animating) return
    setAnimating(true)
    setCurrent(index)
    setTimeout(() => setAnimating(false), 600)
  }

  const prev = () => go(current === 0 ? games.length - 1 : current - 1)
  const next = () => go(current === games.length - 1 ? 0 : current + 1)

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [current])

  if (!games?.length) return null
  const game = games[current]

  return (
    <div style={{
      position: 'relative', borderRadius: 20, overflow: 'hidden',
      height: '100%', flexShrink: 0,
      boxShadow: '0 25px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)',
    }}>
      {/* Background image */}
      <img
        key={game.id}
        src={game.cover}
        alt={game.name}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          transition: 'opacity 0.6s ease, transform 0.8s ease',
          opacity: animating ? 0.2 : 1,
          transform: animating ? 'scale(1.06)' : 'scale(1)',
        }}
      />

      {/* Gradients */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(7,4,15,0.96) 0%, rgba(7,4,15,0.55) 50%, rgba(7,4,15,0.05) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(7,4,15,0.98) 0%, transparent 50%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: 300, height: 160, background: 'radial-gradient(ellipse at bottom left, rgba(220,30,60,0.2) 0%, transparent 70%)' }} />

      {/* Bottom-left content block */}
      <div style={{
        position: 'absolute', bottom: 28, left: 32, right: 32,
        opacity: animating ? 0 : 1,
        transform: animating ? 'translateX(-12px)' : 'translateX(0)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}>
        {/* Popular badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 20, marginBottom: 10,
          background: 'rgba(255,195,0,0.12)', border: '1px solid rgba(255,195,0,0.25)',
        }}>
          <span style={{ fontSize: 11, color: '#fbbf24' }}>⭐</span>
          <span style={{ fontSize: 10, color: '#fbbf24', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Popular</span>
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily: 'Rajdhani, sans-serif', fontWeight: 800,
          fontSize: 32, lineHeight: 1.1, color: '#fff', marginBottom: 10,
          textShadow: '0 4px 20px rgba(0,0,0,0.8)',
          maxWidth: 400,
        }}>
          {game.name}
        </h2>

        {/* Genres + meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          {game.genres.slice(0, 2).map((g) => <GenreChip key={g} label={g} />)}
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
            {game.released} &nbsp;·&nbsp; ⭐ {game.rating}/5
          </span>
        </div>

        {/* Bottom row: CTA + nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* View Game button */}
          <button
            onClick={() => navigate(`/game/${game.id}`)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 22px', borderRadius: 12, cursor: 'pointer',
              background: 'linear-gradient(135deg, #dc1e3c, #9b0020)',
              border: 'none', color: '#fff', fontSize: 13, fontWeight: 600,
              boxShadow: '0 6px 25px rgba(220,30,60,0.45)',
              transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 35px rgba(220,30,60,0.65)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 25px rgba(220,30,60,0.45)' }}
          >
            <Gamepad2 size={14} />
            View Game
          </button>

          {/* Nav controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Arrows */}
            <div style={{ display: 'flex', gap: 6 }}>
              {[{ fn: prev, Icon: ChevronLeft }, { fn: next, Icon: ChevronRight }].map(({ fn, Icon }, i) => (
                <button key={i} onClick={fn}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(10px)', cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,30,60,0.35)'; e.currentTarget.style.borderColor = 'rgba(220,30,60,0.5)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}>
                  <Icon size={14} color="#fff" />
                </button>
              ))}
            </div>

            {/* Dots + counter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{current + 1}/{games.length}</span>
              <div style={{ display: 'flex', gap: 5 }}>
                {games.map((_, i) => (
                  <button key={i} onClick={() => go(i)}
                    style={{
                      borderRadius: 3, cursor: 'pointer', border: 'none',
                      height: 4,
                      width: i === current ? 20 : 4,
                      background: i === current ? '#dc1e3c' : 'rgba(255,255,255,0.2)',
                      boxShadow: i === current ? '0 0 8px rgba(220,30,60,0.8)' : 'none',
                      transition: 'all 0.3s',
                    }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroCarousel