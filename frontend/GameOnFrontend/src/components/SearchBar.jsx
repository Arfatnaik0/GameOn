import { Search } from 'lucide-react'

const SearchBar = ({ value, onChange }) => {
  return (
    <div className="flex-1 max-w-md relative group">
      <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
        style={{ color: value ? '#dc1e3c' : '#6b5a7a' }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search for games..."
        className="w-full pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-[#6b5a7a] outline-none transition-all duration-300 rounded-xl"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
        }}
        onFocus={e => {
          e.target.style.border = '1px solid rgba(220,30,60,0.4)'
          e.target.style.background = 'rgba(255,255,255,0.06)'
          e.target.style.boxShadow = '0 0 20px rgba(220,30,60,0.1)'
        }}
        onBlur={e => {
          e.target.style.border = '1px solid rgba(255,255,255,0.07)'
          e.target.style.background = 'rgba(255,255,255,0.04)'
          e.target.style.boxShadow = 'none'
        }}
      />
    </div>
  )
}

export default SearchBar