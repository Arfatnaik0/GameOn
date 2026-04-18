import { useState, useEffect, useRef } from 'react'
import { X, User, Mail, Shield, Trash2, Save, AlertTriangle,Download,Smartphone} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { updateMyProfile, deleteMyAccount, fetchUserProfile } from '../api/users'
import { useQueryClient } from '@tanstack/react-query'
import { useWindowSize } from '../hooks/useWindowSize'

const SettingsDrawer = ({ open, onClose, canInstall, isInstalled, isIOS, triggerInstall }) => {
  const { user, session, signOut } = useAuth()
  const queryClient = useQueryClient()
  const drawerRef = useRef(null)
  const { isMobile } = useWindowSize()

  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  // Populate fields when drawer opens
  useEffect(() => {
    if (open && user) {
      setUsername(user.user_metadata?.full_name ?? '')
      setBio('')
      setError('')
      setDeleteConfirm('')
      setSaveSuccess(false)
      // Fetch current profile to get bio
      fetchUserProfile(user.id)
        .then(data => {
          setUsername(data.username ?? user.user_metadata?.full_name ?? '')
          setBio(data.bio ?? '')
        })
        .catch(() => {})
    }
  }, [open, user])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        onClose()
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const handleSave = async () => {
    if (!session) return
    setSaving(true)
    setError('')
    try {
      await updateMyProfile({ username, bio }, session)
      queryClient.invalidateQueries({ queryKey: ['profile', user.id] })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2500)
    } catch {
      setError('Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (deleteConfirm !== 'DELETE') return
    setDeleting(true)
    setError('')
    try {
      await deleteMyAccount(session)
      await signOut()
    } catch {
      setError('Failed to delete account. Try again.')
      setDeleting(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 400,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'all' : 'none',
        transition: 'opacity 0.3s ease',
      }} />

      {/* Drawer */}
      <div
        ref={drawerRef}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: isMobile ? '100vw' : 420, zIndex: 500,
          background: 'rgba(16,5,8,0.98)',
          borderLeft: '1px solid rgba(220,30,60,0.15)',
          backdropFilter: 'blur(30px)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.7)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 28px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 22, color: '#fff' }}>
            Settings
          </h2>
          <button onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,30,60,0.15)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ flex: 1, padding: '28px', display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* Section: Account Info */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Shield size={14} color="#dc1e3c" />
              <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 14, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>
                Account Info
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '20px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {/* Avatar + name row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="avatar"
                    style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(220,30,60,0.3)' }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #dc1e3c, #7b2d8b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={20} color="#fff" />
                  </div>
                )}
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                    {user?.user_metadata?.full_name ?? 'Player'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }} />
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Connected via Google</span>
                  </div>
                </div>
              </div>

              {/* Email row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Mail size={13} color="rgba(255,255,255,0.3)" />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{user?.email ?? '—'}</span>
                <span style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 20 }}>
                  Read only
                </span>
              </div>
            </div>
          </section>

          {/* PWA Install Section */}
{!isInstalled && (canInstall || isIOS) && (
  <section>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <Smartphone size={14} color="#dc1e3c" />
      <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 14, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>
        Install App
      </h3>
    </div>

    <div style={{ padding: '20px', borderRadius: 16, background: 'rgba(220,30,60,0.04)', border: '1px solid rgba(220,30,60,0.15)' }}>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 12, lineHeight: 1.6 }}>
        Add GameOn to your home screen for quick access — works like a native app.
      </p>

      {isIOS ? (
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7 }}>
          Tap the <strong style={{ color: 'rgba(255,255,255,0.5)' }}>Share</strong> button in Safari, then choose{' '}
          <strong style={{ color: 'rgba(255,255,255,0.5)' }}>"Add to Home Screen"</strong>.
        </p>
      ) : (
        <button
          onClick={triggerInstall}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '11px 20px', borderRadius: 10, cursor: 'pointer',
            background: 'linear-gradient(135deg, #dc1e3c, #9b0020)',
            border: 'none', color: '#fff', fontSize: 13, fontWeight: 600,
            boxShadow: '0 4px 15px rgba(220,30,60,0.3)',
          }}>
          <Download size={13} />
          Add to Home Screen
        </button>
      )}
    </div>
  </section>
)}

          {/* Section: Edit Profile */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <User size={14} color="#dc1e3c" />
              <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 14, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>
                Edit Profile
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6 }}>Username</label>
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Your username"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#fff', fontSize: 14, outline: 'none',
                    fontFamily: 'Outfit, sans-serif',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(220,30,60,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6 }}>Bio</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell people a bit about yourself..."
                  rows={3}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#fff', fontSize: 14, outline: 'none',
                    fontFamily: 'Outfit, sans-serif', resize: 'vertical',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(220,30,60,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>

              {error && (
                <p style={{ fontSize: 12, color: '#dc1e3c' }}>{error}</p>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '11px 20px', borderRadius: 10, cursor: saving ? 'not-allowed' : 'pointer',
                  background: saveSuccess
                    ? 'linear-gradient(135deg, #34d399, #059669)'
                    : 'linear-gradient(135deg, #dc1e3c, #9b0020)',
                  border: 'none', color: '#fff', fontSize: 13, fontWeight: 600,
                  opacity: saving ? 0.7 : 1,
                  transition: 'all 0.3s',
                  boxShadow: saveSuccess
                    ? '0 4px 15px rgba(52,211,153,0.3)'
                    : '0 4px 15px rgba(220,30,60,0.3)',
                }}>
                <Save size={13} />
                {saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          </section>

          {/* Section: Danger Zone */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <AlertTriangle size={14} color="#dc1e3c" />
              <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 14, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>
                Danger Zone
              </h3>
            </div>

            <div style={{ padding: '20px', borderRadius: 16, background: 'rgba(220,30,60,0.04)', border: '1px solid rgba(220,30,60,0.2)' }}>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
                Delete your account
              </p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6, marginBottom: 16 }}>
                This permanently deletes your account, all your reviews, and your game list. This action cannot be undone.
              </p>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6 }}>
                  Type <span style={{ color: '#dc1e3c', fontWeight: 700 }}>DELETE</span> to confirm
                </label>
                <input
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder="DELETE"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    background: 'rgba(220,30,60,0.06)',
                    border: `1px solid ${deleteConfirm === 'DELETE' ? 'rgba(220,30,60,0.6)' : 'rgba(220,30,60,0.2)'}`,
                    color: '#fff', fontSize: 14, outline: 'none',
                    fontFamily: 'Outfit, sans-serif',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                />
              </div>

              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== 'DELETE' || deleting}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', padding: '11px 20px', borderRadius: 10,
                  cursor: deleteConfirm !== 'DELETE' || deleting ? 'not-allowed' : 'pointer',
                  background: deleteConfirm === 'DELETE' ? 'rgba(220,30,60,0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${deleteConfirm === 'DELETE' ? 'rgba(220,30,60,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  color: deleteConfirm === 'DELETE' ? '#dc1e3c' : 'rgba(255,255,255,0.2)',
                  fontSize: 13, fontWeight: 600,
                  opacity: deleting ? 0.7 : 1,
                  transition: 'all 0.2s',
                }}>
                <Trash2 size={13} />
                {deleting ? 'Deleting...' : 'Delete My Account'}
              </button>
            </div>
          </section>

        </div>
      </div>
    </>
  )
}

export default SettingsDrawer