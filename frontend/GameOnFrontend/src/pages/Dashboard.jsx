import { useState } from 'react'
import { Bell, Settings, ChevronDown } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import SearchBar from '../components/SearchBar'
import HeroCarousel from '../components/HeroCarousel'
import HorizontalScroller from '../components/HorizontalScroller'
import LibraryPanel from '../components/LibraryPanel'
import StatsPanel from '../components/StatsPanel'
import { useFeaturedGames, useSearchGames } from '../hooks/useGames'
import { useDebounce } from '../hooks/useDebounce'

const Dashboard = () => {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  const { data: featured, isLoading } = useFeaturedGames()
  const { data: searchResults } = useSearchGames(debouncedQuery)

  const games = debouncedQuery.length >= 2 ? searchResults?.results : featured?.results
  const reviewCount = 0

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0608', overflow: 'hidden' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Topbar */}
        <header style={{
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '14px 24px', flexShrink: 0, zIndex: 10,
          borderBottom: '1px solid rgba(220,30,60,0.08)',
          background: 'rgba(10,6,8,0.9)', backdropFilter: 'blur(20px)',
        }}>
          <div style={{ marginRight: 4 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Good evening, </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Player</span>
          </div>

          <SearchBar value={query} onChange={setQuery} />

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <button style={{ width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(220,30,60,0.12)', cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(220,30,60,0.5)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(220,30,60,0.12)'}>
              <Bell size={15} color="#8a5a62" />
              <span style={{ position: 'absolute', top: 7, right: 7, width: 6, height: 6, borderRadius: '50%', background: '#dc1e3c', boxShadow: '0 0 6px rgba(220,30,60,0.9)' }} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(220,30,60,0.12)', cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(220,30,60,0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(220,30,60,0.12)'}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #dc1e3c, #7b2d8b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', boxShadow: '0 0 12px rgba(220,30,60,0.4)' }}>A</div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', lineHeight: 1 }}>Alex Ryan</p>
                <p style={{ fontSize: 10, color: '#8a5a62', lineHeight: 1, marginTop: 3 }}>@alex.gg</p>
              </div>
              <ChevronDown size={12} color="#8a5a62" />
            </div>

            <button style={{ width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(220,30,60,0.12)', cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(220,30,60,0.5)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(220,30,60,0.12)'}>
              <Settings size={15} color="#8a5a62" />
            </button>
          </div>
        </header>

        {/* Body */}
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {isLoading ? (
            <>
              <div style={{ height: 340, borderRadius: 20, background: 'rgba(255,255,255,0.04)' }} />
              <div style={{ height: 300, borderRadius: 20, background: 'rgba(255,255,255,0.03)' }} />
            </>
          ) : (
            <>
              {/* Top row — all panels share the same height */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>

                {/* Hero — fills remaining width */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <HeroCarousel games={featured?.results} />
                </div>

                {/* Recently Rated — fixed width, natural height */}
                <div style={{ width: 240, flexShrink: 0 }}>
                  <LibraryPanel games={featured?.results} />
                </div>

                {/* Stats — fixed width, stretches to match siblings */}
                <div style={{ width: 200, flexShrink: 0 }}>
                  <StatsPanel reviewCount={reviewCount} />
                </div>
              </div>

              {/* Popular Games */}
              <div style={{ paddingBottom: 24 }}>
                <HorizontalScroller
                  title="Popular Games"
                  games={games}
                  onGameClick={() => {}}
                />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default Dashboard