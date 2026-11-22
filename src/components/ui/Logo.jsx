export default function Logo({ compact = false }) {
  return (
    <span className="logo">
      <span className="logo__mark" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19V11M10 19V5M16 19v-6M22 19H2" />
        </svg>
      </span>
      {!compact && <span className="logo__text">Gestão Financeira</span>}
    </span>
  )
}
