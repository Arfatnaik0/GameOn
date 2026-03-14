const GenreChip = ({ label }) => (
  <span className="px-2.5 py-0.5 text-[10px] font-medium rounded-full whitespace-nowrap"
    style={{
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: 'rgba(255,255,255,0.5)',
    }}>
    {label}
  </span>
)

export default GenreChip