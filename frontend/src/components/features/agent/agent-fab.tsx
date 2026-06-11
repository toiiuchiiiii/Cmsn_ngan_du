interface AgentFabProps {
  isOpen: boolean
  onClick: () => void
}

export function AgentFab({ isOpen, onClick }: AgentFabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? 'Đóng trợ lý' : 'Mở trợ lý MindWell'}
      aria-expanded={isOpen}
      className="fixed bottom-6 right-6 z-40 rounded-full bg-accent-sage text-white p-4 shadow-lg transition-all hover:bg-accent-sage/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage focus-visible:ring-offset-2 animate-fade-in"
      style={{
        animation: 'pulse-gentle 3s ease-in-out infinite',
      }}
    >
      {isOpen ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 6L6 18" />
          <path d="M6 6l12 12" />
        </svg>
      ) : (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )}
      <style>{`
        @keyframes pulse-gentle {
          0%, 100% { box-shadow: 0 4px 20px rgba(143,168,141,0.3); }
          50% { box-shadow: 0 4px 28px rgba(143,168,141,0.5); }
        }
        @media (prefers-reduced-motion: reduce) {
          button[style] { animation: none !important; }
        }
      `}</style>
    </button>
  )
}
