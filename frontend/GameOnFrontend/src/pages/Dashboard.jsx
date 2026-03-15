import { useState, useRef, useEffect } from 'react'
import { Settings, ChevronDown, User, LogOut, LogIn } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import SearchBar from '../components/SearchBar'
import HeroCarousel from '../components/HeroCarousel'
import HorizontalScroller from '../components/HorizontalScroller'
import LibraryPanel from '../components/LibraryPanel'
import StatsPanel from '../components/StatsPanel'
import SettingsDrawer from '../components/SettingsDrawer'
import GuestBanner from '../components/GuestBanner'
import { useFeaturedGames, useSearchGames, usePopularGames } from '../hooks/useGames'
import { useDebounce } from '../hooks/useDebounce'
import { useAuth } from '../context/AuthContext'
import { useMyReviewCount } from '../hooks/useReviews'
import { useMyList } from '../hooks/useLists'

const Dashboard = () => {
  const [query, setQuery] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const { user, signOut, session } = useAuth()
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  const { data: popular } = usePopularGames()
  const { data: featured, isLoading } = useFeaturedGames()
  const { data: searchResults } = useSearchGames(debouncedQuery)
  const { data: reviewCountData } = useMyReviewCount(session)
  const { data: listData } = useMyList(session)

  const reviewCount = reviewCountData?.count ?? 0
  const listEntries = listData?.results ?? []
  const games = debouncedQuery.length >= 2 ? searchResults?.results : popular?.results

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{getGreeting()}, </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
              {user?.user_metadata?.full_name?.split(' ')[0] ?? 'Guest'}
            </span>
          </div>

          <SearchBar value={query} onChange={setQuery} />

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            {user ? (
              <>
                {/* Profile chip + dropdown */}
                <div ref={dropdownRef} style={{ position: 'relative' }}>
                  <div
                    onClick={() => setDropdownOpen(o => !o)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: `1px solid ${dropdownOpen ? 'rgba(220,30,60,0.4)' : 'rgba(220,30,60,0.12)'}`, cursor: 'pointer', transition: 'border-color 0.2s', userSelect: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(220,30,60,0.4)'}
                    onMouseLeave={e => { if (!dropdownOpen) e.currentTarget.style.borderColor = 'rgba(220,30,60,0.12)' }}>
                    {user?.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="avatar"
                        style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #dc1e3c, #7b2d8b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                        {user?.user_metadata?.full_name?.[0] ?? 'G'}
                      </div>
                    )}
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', lineHeight: 1 }}>
                        {user?.user_metadata?.full_name ?? 'Player'}
                      </p>
                      <p style={{ fontSize: 10, color: '#8a5a62', lineHeight: 1, marginTop: 3 }}>
                        {user?.email ?? ''}
                      </p>
                    </div>
                    <ChevronDown size={12} color="#8a5a62"
                      style={{ transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                  </div>

                  {dropdownOpen && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                      width: 200, borderRadius: 14, overflow: 'hidden', zIndex: 100,
                      background: 'rgba(20,8,10,0.98)',
                      border: '1px solid rgba(220,30,60,0.15)',
                      backdropFilter: 'blur(30px)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
                    }}>
                      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{user?.user_metadata?.full_name}</p>
                        <p style={{ fontSize: 11, color: '#8a5a62', marginTop: 2 }}>{user?.email}</p>
                      </div>

                      {[
                        { icon: User, label: 'Your Profile', onClick: () => { navigate(`/profile/${user.id}`); setDropdownOpen(false) } },
                      ].map(({ icon: Icon, label, onClick }) => (
                        <button key={label} onClick={onClick} style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                          padding: '11px 16px', background: 'transparent', border: 'none',
                          color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,30,60,0.08)'; e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}>
                          <Icon size={14} />{label}
                        </button>
                      ))}

                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <button onClick={signOut} style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                          padding: '11px 16px', background: 'transparent', border: 'none',
                          color: '#dc1e3c', fontSize: 13, cursor: 'pointer', transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,30,60,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Settings */}
                <button
                  onClick={() => setSettingsOpen(true)}
                  style={{ width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(220,30,60,0.12)', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(220,30,60,0.5)'; e.currentTarget.style.background = 'rgba(220,30,60,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(220,30,60,0.12)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}>
                  <Settings size={15} color="#8a5a62" />
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 18px', borderRadius: 12, cursor: 'pointer',
                  background: 'linear-gradient(135deg, #dc1e3c, #9b0020)',
                  border: 'none', color: '#fff', fontSize: 13, fontWeight: 600,
                  boxShadow: '0 4px 15px rgba(220,30,60,0.35)',
                }}>
                <LogIn size={14} /> Sign In
              </button>
            )}
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
              {!user && (
                <GuestBanner message="Sign in to track your library, write reviews and build your game list" />
              )}

              <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <HeroCarousel games={featured?.results} />
                </div>
                {user && (
                  <>
                    <div style={{ width: 240, flexShrink: 0 }}>
                      <LibraryPanel />
                    </div>
                    <div style={{ width: 200, flexShrink: 0 }}>
                      <StatsPanel reviewCount={reviewCount} />
                    </div>
                  </>
                )}
              </div>

              <div style={{ paddingBottom: 24 }}>
                <HorizontalScroller
                  title="Games"
                  games={games}
                  onGameClick={() => {}}
                  listEntries={listEntries}
                />
              </div>
            </>
          )}
        </main>
      </div>

      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}

export default Dashboard