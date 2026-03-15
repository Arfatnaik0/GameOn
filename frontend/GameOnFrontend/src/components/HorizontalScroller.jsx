import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import GameCard from './GameCard'

const HorizontalScroller = ({ title, games, onGameClick, listEntries = [] }) => {
  const ref = useRef(null)
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * 220, behavior: 'smooth' })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 20, color: '#fff', letterSpacing: 1 }}>
          {title}
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { dir: -1, Icon: ChevronLeft, accent: false },
            { dir: 1, Icon: ChevronRight, accent: true },
          ].map(({ dir, Icon, accent }, i) => (
            <button key={i} onClick={() => scroll(dir)}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
                background: accent ? 'linear-gradient(135deg, #dc1e3c, #8b0020)' : 'rgba(255,255,255,0.05)',
                border: accent ? 'none' : '1px solid rgba(255,255,255,0.08)',
                boxShadow: accent ? '0 4px 15px rgba(220,30,60,0.4)' : 'none',
              }}>
              <Icon size={14} color="#fff" />
            </button>
          ))}
        </div>
      </div>

      <div
        ref={ref}
        style={{
          display: 'flex', gap: 16,
          overflowX: 'auto', overflowY: 'visible',
          paddingBottom: 8,
          scrollbarWidth: 'none', msOverflowStyle: 'none',
        }}
      >
        {games?.map((game) => (
          <GameCard key={game.id} game={game} onClick={onGameClick} listEntries={listEntries} />
        ))}
      </div>
    </div>
  )
}

export default HorizontalScroller