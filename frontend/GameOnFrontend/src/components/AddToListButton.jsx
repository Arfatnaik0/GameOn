import { useState, useRef, useEffect } from 'react'
import { Plus, Check, ChevronDown, Trash2 } from 'lucide-react'
import { useGameListStatus, useAddToList, useUpdateListStatus, useRemoveFromList } from '../hooks/useLists'

const STATUS_OPTIONS = [
  { value: 'want_to_play', label: 'Want to Play', color: '#a78bfa' },
  { value: 'playing',      label: 'Playing',      color: '#34d399' },
  { value: 'played',       label: 'Played',       color: '#dc1e3c' },
]

const AddToListButton = ({ gameId, session, compact = false, dropUp = false, listEntries = null }) => {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Only fire the individual query when listEntries is NOT provided (e.g. GameDetail page)
  const { data } = useGameListStatus(gameId, session, listEntries === null)

  // Derive status — from prop array if available, otherwise from query
  const currentEntry = listEntries !== null
    ? (listEntries.find(e => e.rawg_game_id === gameId) ?? null)
    : (data?.entry ?? null)

  const currentStatus = currentEntry?.status ?? null
  const currentOption = STATUS_OPTIONS.find(s => s.value === currentStatus)

  const addToList = useAddToList(session)
  const updateStatus = useUpdateListStatus(session)
  const removeFromList = useRemoveFromList(session)

  const isPending = addToList.isPending || updateStatus.isPending || removeFromList.isPending

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = async (status) => {
    setOpen(false)
    if (!currentEntry) {
      await addToList.mutateAsync({ rawg_game_id: gameId, status })
    } else {
      await updateStatus.mutateAsync({ rawgGameId: gameId, status })
    }
  }

  const handleRemove = async (e) => {
    e.stopPropagation()
    setOpen(false)
    await removeFromList.mutateAsync(gameId)
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={isPending}
        style={{
          display: 'flex', alignItems: 'center', gap: compact ? 4 : 6,
          padding: compact ? '5px 10px' : '9px 16px',
          borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
          border: currentStatus
            ? `1px solid ${currentOption.color}44`
            : '1px solid rgba(255,255,255,0.15)',
          background: currentStatus
            ? `${currentOption.color}18`
            : 'rgba(255,255,255,0.07)',
          color: currentStatus ? currentOption.color : '#fff',
          fontSize: compact ? 11 : 13, fontWeight: 600,
          opacity: isPending ? 0.6 : 1,
        }}
      >
        {currentStatus
          ? <Check size={compact ? 10 : 12} />
          : <Plus size={compact ? 10 : 12} />
        }
        {!compact && (currentOption?.label ?? 'Add to List')}
        <ChevronDown size={compact ? 9 : 11}
          style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          ...(dropUp
            ? { bottom: 'calc(100% + 6px)', top: 'auto' }
            : { top: 'calc(100% + 6px)' }
          ),
          left: 0,
          minWidth: 160, borderRadius: 12, zIndex: 200,
          background: 'rgba(20,8,10,0.98)',
          border: '1px solid rgba(220,30,60,0.2)',
          backdropFilter: 'blur(30px)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
          overflow: 'hidden',
        }}>
          {STATUS_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px',
                background: currentStatus === option.value ? `${option.color}15` : 'transparent',
                border: 'none', cursor: 'pointer', transition: 'background 0.15s',
                color: currentStatus === option.value ? option.color : 'rgba(255,255,255,0.7)',
                fontSize: 13,
              }}
              onMouseEnter={e => { if (currentStatus !== option.value) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { if (currentStatus !== option.value) e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: option.color, flexShrink: 0 }} />
              {option.label}
              {currentStatus === option.value && <Check size={11} style={{ marginLeft: 'auto' }} />}
            </button>
          ))}

          {currentStatus && (
            <>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
              <button
                onClick={handleRemove}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', background: 'transparent',
                  border: 'none', cursor: 'pointer', transition: 'background 0.15s',
                  color: '#dc1e3c', fontSize: 13,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,30,60,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Trash2 size={12} />
                Remove from List
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default AddToListButton