import { useState, useRef, useEffect } from 'react'
import { Settings, ChevronDown, User, LogOut, LogIn, Menu, Download } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import SearchBar from '../components/SearchBar'
import SearchDropdown from '../components/SearchDropdown'
import HeroCarousel from '../components/HeroCarousel'
import HorizontalScroller from '../components/HorizontalScroller'
import LibraryPanel from '../components/LibraryPanel'
import StatsPanel from '../components/StatsPanel'
import SettingsDrawer from '../components/SettingsDrawer'
import GuestBanner from '../components/GuestBanner'
import PopularReviewsSection from '../components/PopularReviewsSection'
import ReviewNotificationsBell from '../components/ReviewNotificationsBell'
import { useFeaturedGames, useSearchGames, usePopularGames } from '../hooks/useGames'
import { useDebounce } from '../hooks/useDebounce'
import { useAuth } from '../context/AuthContext'
import { useMyReviewCount } from '../hooks/useReviews'
import { useMyList } from '../hooks/useLists'
import { useUserProfile } from '../hooks/useProfile'
import { useWindowSize } from '../hooks/useWindowSize'
import { usePWAInstall } from '../hooks/usePWAInstall'

const Dashboard = () => {
  const [query, setQuery] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const { user, signOut, session } = useAuth()
  const dropdownRef = useRef(null)
  const searchWrapperRef = useRef(null)
  const navigate = useNavigate()
  const { isMobile, isTablet } = useWindowSize()
  const { canInstall, isInstalled, isIOS, triggerInstall } = usePWAInstall()

  const { data: popular } = usePopularGames()
  const { data: featured, isLoading } = useFeaturedGames()
  const { data: searchResults, isFetching: isSearching } = useSearchGames(debouncedQuery)
  const { data: reviewCountData } = useMyReviewCount(session)
  const { data: listData } = useMyList(session)
  const { data: profileData } = useUserProfile(user?.id)

  const reviewCount = reviewCountData?.count ?? 0
  const listEntries = listData?.results ?? []
  const displayName = profileData?.username?.trim()
    || user?.user_metadata?.full_name?.trim()
    || user?.user_metadata?.name?.trim()
    || 'Player'
  const displayFirstName = displayName.split(' ')[0] || 'Player'
  const avatarUrl = profileData?.avatar_url
    || user?.user_metadata?.avatar_url
    || user?.user_metadata?.picture
    || null
  const showAvatarImage = Boolean(avatarUrl) && !avatarLoadFailed

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  // Close user dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    setAvatarLoadFailed(false)
  }, [avatarUrl])

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0608', overflow: 'hidden' }}>
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Topbar */}
        <header style={{
          display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 16,
          padding: isMobile ? '12px 16px' : '14px 24px',
          flexShrink: 0, zIndex: 10,
          borderBottom: '1px solid rgba(220,30,60,0.08)',
          background: 'rgba(10,6,8,0.9)', backdropFilter: 'blur(20px)',
          overflow: 'visible',
        }}>
          {/* Hamburger on mobile */}
          {isMobile && (
            <button onClick={() => setSidebarOpen(true)}
              style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(220,30,60,0.12)', cursor: 'pointer', flexShrink: 0 }}>
              <Menu size={16} color="#8a5a62" />
            </button>
          )}

          {!isMobile && (
            <div style={{ marginRight: 4, flexShrink: 0 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{getGreeting()}, </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                {user ? displayFirstName : 'Guest'}
              </span>
            </div>
          )}

          {/* Search bar wrapper — positions the dropdown relative to the input */}
          <div ref={searchWrapperRef} style={{ flex: 1, maxWidth: 448, position: 'relative' }}>
            <SearchBar value={query} onChange={setQuery} />
            {debouncedQuery.length >= 2 && (
              <SearchDropdown
                query={debouncedQuery}
                results={searchResults?.results}
                isLoading={isSearching}
                onSelect={() => setQuery('')}
              />
            )}
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {!isInstalled && canInstall && (
              <button
                onClick={triggerInstall}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: isMobile ? '8px 10px' : '8px 14px',
                  borderRadius: 12, cursor: 'pointer',
                  background: 'linear-gradient(135deg, #dc1e3c, #9b0020)',
                  border: 'none', color: '#fff', fontSize: 12, fontWeight: 700,
                  boxShadow: '0 4px 15px rgba(220,30,60,0.35)',
                  flexShrink: 0,
                }}>
                <Download size={13} />
                {!isMobile && 'Install App'}
              </button>
            )}

            {user ? (
              <>
                <ReviewNotificationsBell session={session} />
                <div ref={dropdownRef} style={{ position: 'relative' }}>
                  <div
                    onClick={() => setDropdownOpen(o => !o)}
                    style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10, padding: isMobile ? '6px 10px' : '8px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: `1px solid ${dropdownOpen ? 'rgba(220,30,60,0.4)' : 'rgba(220,30,60,0.12)'}`, cursor: 'pointer', transition: 'border-color 0.2s', userSelect: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(220,30,60,0.4)'}
                    onMouseLeave={e => { if (!dropdownOpen) e.currentTarget.style.borderColor = 'rgba(220,30,60,0.12)' }}>
                    {showAvatarImage ? (
                      <img src={avatarUrl} alt="avatar"
                        onError={() => setAvatarLoadFailed(true)}
                        style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #dc1e3c, #7b2d8b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                        {displayName?.[0]?.toUpperCase() ?? 'G'}
                      </div>
                    )}
                    {!isMobile && (
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', lineHeight: 1 }}>
                          {displayName}
                        </p>
                        <p style={{ fontSize: 10, color: '#8a5a62', lineHeight: 1, marginTop: 3 }}>
                          {user?.email ?? ''}
                        </p>
                      </div>
                    )}
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
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{displayName}</p>
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

                {!isMobile && (
                  <button
                    onClick={() => setSettingsOpen(true)}
                    style={{ width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(220,30,60,0.12)', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(220,30,60,0.5)'; e.currentTarget.style.background = 'rgba(220,30,60,0.08)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(220,30,60,0.12)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}>
                    <Settings size={15} color="#8a5a62" />
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: isMobile ? '8px 12px' : '8px 18px',
                  borderRadius: 12, cursor: 'pointer',
                  background: 'linear-gradient(135deg, #dc1e3c, #9b0020)',
                  border: 'none', color: '#fff', fontSize: 13, fontWeight: 600,
                  boxShadow: '0 4px 15px rgba(220,30,60,0.35)',
                }}>
                <LogIn size={14} />
                {!isMobile && 'Sign In'}
              </button>
            )}
          </div>
        </header>

        {/* Body */}
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', overscrollBehavior: 'contain', WebkitOverflowScrolling: isMobile ? 'touch' : 'auto', scrollBehavior: 'auto', contain: 'layout paint', padding: isMobile ? '16px' : '20px 24px', display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : 24 }}>
          {isLoading ? (
            <>
              <div style={{ height: isMobile ? 220 : 340, borderRadius: 20, background: 'rgba(255,255,255,0.04)' }} />
              <div style={{ height: 200, borderRadius: 20, background: 'rgba(255,255,255,0.03)' }} />
            </>
          ) : (
            <>
              {!user && (
                <GuestBanner message="Sign in to track your library, write reviews and build your game list" />
              )}

              {/* Hero + panels */}
              {isMobile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 0, height: '100%' }}>
                    <HeroCarousel games={featured?.results} />
                  </div>
                  {user && (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0, height: 220 }}>
                        <LibraryPanel />
                      </div>
                      <div style={{ width: 140, height: 220, flexShrink: 0 }}>
                        <StatsPanel reviewCount={reviewCount} />
                      </div>
                    </div>
                  )}
                </div>
              ) : isTablet ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ height: 320 }}>
                    <HeroCarousel games={featured?.results} />
                  </div>
                  {user && (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <LibraryPanel />
                      </div>
                      <div style={{ width: 180, flexShrink: 0 }}>
                        <StatsPanel reviewCount={reviewCount} />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 10, alignItems: 'stretch', height: 340 }}>
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
              )}

              {/* Games section — always shows top 20 popular, never search results */}
              <div style={{ paddingBottom: isMobile ? 2 : 4 }}>
                <HorizontalScroller
                  title="Games"
                  games={popular?.results}
                  onGameClick={() => {}}
                  listEntries={listEntries}
                />
              </div>

              <PopularReviewsSection session={session} />
            </>
          )}
        </main>
      </div>

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        canInstall={canInstall}
        isInstalled={isInstalled}
        isIOS={isIOS}
        triggerInstall={triggerInstall}
      />
    </div>
  )
}

export default Dashboard
