import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Gamepad2 } from 'lucide-react'
import GenreChip from './GenreChip'

const HeroCarousel = ({ games }) => {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

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
    <div className="relative rounded-2xl overflow-hidden h-80 flex-shrink-0"
      style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)' }}>

      {/* BG image */}
      <img
        key={game.id}
        src={game.cover}
        alt={game.name}
        className="absolute inset-0 w-100 h-100 object-cover"
        style={{
          transition: 'opacity 0.6s ease, transform 0.8s ease',
          opacity: animating ? 0.2 : 1,
          transform: animating ? 'scale(1.06)' : 'scale(1)',
        }}
      />

      {/* Gradients */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to right, rgba(7,4,15,0.97) 0%, rgba(7,4,15,0.65) 45%, rgba(7,4,15,0.05) 100%)'
      }} />
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to top, rgba(7,4,15,0.95) 0%, transparent 55%)'
      }} />

      {/* Red light bleed bottom-left */}
      <div className="absolute bottom-0 left-0 w-72 h-20" style={{
        background: 'radial-gradient(ellipse at bottom left, rgba(220,30,60,0.25) 0%, transparent 70%)'
      }} />

      {/* Content */}
      <div className="absolute inset-0 pl-8 p-2 flex flex-col justify-between">
        <div style={{
          opacity: animating ? 0 : 1,
          transform: animating ? 'translateX(-12px)' : 'translateX(0)',
          transition: 'opacity 0.4s ease, transform 0.4s ease'
        }}>
          {/* Popular badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
            style={{ background: 'rgba(255,195,0,0.12)', border: '1px solid rgba(255,195,0,0.25)' }}>
            <span className="text-yellow-400 text-xs">⭐</span>
            <span className="text-yellow-400 text-xs font-bold tracking-widest uppercase">Popular</span>
          </div>

          <h2 className="font-display font-bold text-4xl text-white leading-tight max-w-sm mb-3 glow-text">
            {game.name}
          </h2>

          <div className="flex gap-2 mb-3">
            {game.genres.slice(0, 3).map((g) => (
              <GenreChip key={g} label={g} />
            ))}
          </div>

          <p className="text-xs font-medium mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Released {game.released} &nbsp;·&nbsp; ⭐ {game.rating} / 5
          </p>

          {/* CTA Button */}
          <button
            className="relative overflow-hidden flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #dc1e3c 0%, #9b0020 100%)',
              boxShadow: '0 6px 25px rgba(220,30,60,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 8px 35px rgba(220,30,60,0.7), inset 0 1px 0 rgba(255,255,255,0.2)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 6px 25px rgba(220,30,60,0.5), inset 0 1px 0 rgba(255,255,255,0.15)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <div className="absolute inset-0 shine" />
            <Gamepad2 size={15} className="relative z-10" />
            <span className="relative z-10">View Game</span>
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {[
              { fn: prev, Icon: ChevronLeft },
              { fn: next, Icon: ChevronRight }
            ].map(({ fn, Icon }, i) => (
              <button key={i} onClick={fn}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(220,30,60,0.35)'
                  e.currentTarget.style.borderColor = 'rgba(220,30,60,0.5)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                }}>
                <Icon size={16} className="text-white" />
              </button>
            ))}
          </div>

          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {current + 1}/{games.length}
            </span>
            <div className="flex gap-1.5">
              {games.map((_, i) => (
                <button key={i} onClick={() => go(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === current ? '22px' : '6px',
                    height: '6px',
                    background: i === current ? '#dc1e3c' : 'rgba(255,255,255,0.2)',
                    boxShadow: i === current ? '0 0 12px rgba(220,30,60,0.8)' : 'none'
                  }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroCarousel