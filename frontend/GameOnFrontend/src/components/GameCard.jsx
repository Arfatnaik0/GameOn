import { useRef } from 'react'
import { Star } from 'lucide-react'
import GenreChip from './GenreChip'

const GameCard = ({ game, onClick }) => {
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -8
    const rotateY = ((x - centerX) / centerX) * 8
    card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) scale(1.02)`
    card.style.boxShadow = `${-rotateY * 2}px ${rotateX * 2}px 40px rgba(0,0,0,0.6), 0 0 30px rgba(220,30,60,0.2)`
  }

  const handleMouseLeave = () => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = 'perspective(600px) rotateX(0) rotateY(0) translateY(0) scale(1)'
    card.style.boxShadow = 'none'
  }

  return (
    <div
      ref={cardRef}
      onClick={() => onClick?.(game)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex-shrink-0 w-56 h-72 rounded-2xl overflow-hidden cursor-pointer"
      style={{ transition: 'transform 0.15s ease, box-shadow 0.15s ease', transformStyle: 'preserve-3d' }}
    >
      {/* Cover image */}
      <img
        src={game.cover}
        alt={game.name}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient layers */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/40" />

      {/* Shine overlay */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%)' }} />

      {/* Rating badge */}
      <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <Star size={9} className="text-yellow-400 fill-yellow-400" />
        <span className="text-[10px] text-white font-semibold">{game.rating}</span>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {/* Glass info panel */}
        <div className="rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="font-display font-bold text-sm text-white leading-tight mb-2 truncate">
            {game.name}
          </h3>
          <div className="flex flex-wrap gap-1">
            {game.genres.slice(0, 2).map((genre) => (
              <GenreChip key={genre} label={genre} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameCard