import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { AuthModal } from '@/components/features/auth/auth-modal'
import { useAuthStore } from '@/stores/auth-store'
import { DiaryPage } from '@/components/features/diary/diary-page'
import { TestPage } from '@/components/features/test/test-page'
import { AppointmentsPage } from '@/components/features/appointments/appointments-page'
import { CommunityPage } from '@/components/features/community/community-page'
import { PostDetail } from '@/components/features/community/post-detail'
import { ChatPage } from '@/components/features/chat/chat-page'
import { PageAgent } from '@/components/features/agent/page-agent'

function NavBar() {
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')
  const { isAuthenticated, user, logout } = useAuthStore()
  const location = useLocation()

  return (
    <>
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-lg font-semibold text-fg-primary no-underline hover:text-accent-sage transition-colors">
            MindWell
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              to="/diary"
              className={`text-sm transition-colors ${
                location.pathname === '/diary'
                  ? 'text-accent-sage font-medium'
                  : 'text-fg-secondary hover:text-fg-primary'
              }`}
            >
              Nhật ký
            </Link>
            <Link
              to="/test"
              className={`text-sm transition-colors ${
                location.pathname === '/test'
                  ? 'text-accent-sage font-medium'
                  : 'text-fg-secondary hover:text-fg-primary'
              }`}
            >
              Kiểm tra
            </Link>
            <Link
              to="/community"
              className={`text-sm transition-colors ${
                location.pathname === '/community' || location.pathname.startsWith('/community/')
                  ? 'text-accent-sage font-medium'
                  : 'text-fg-secondary hover:text-fg-primary'
              }`}
            >
              Cộng đồng
            </Link>
            <Link
              to="/appointments"
              className={`text-sm transition-colors ${
                location.pathname === '/appointments'
                  ? 'text-accent-sage font-medium'
                  : 'text-fg-secondary hover:text-fg-primary'
              }`}
            >
              Lịch hẹn
            </Link>
            <Link
              to="/chat"
              className={`text-sm transition-colors ${
                location.pathname === '/chat'
                  ? 'text-accent-sage font-medium'
                  : 'text-fg-secondary hover:text-fg-primary'
              }`}
            >
              Tin nhắn
            </Link>
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-fg-secondary">{user.name}</span>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full border border-border px-4 py-1.5 text-sm text-fg-secondary hover:bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage"
                >
                  Thoát
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setAuthTab('login'); setAuthOpen(true) }}
                  className="rounded-full border border-border px-4 py-1.5 text-sm text-fg-secondary hover:bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage"
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthTab('register'); setAuthOpen(true) }}
                  className="rounded-full bg-accent-sage text-white px-4 py-1.5 text-sm font-medium hover:bg-accent-sage/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage focus-visible:ring-offset-2"
                >
                  Đăng ký
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        defaultTab={authTab}
      />
    </>
  )
}

function HomePage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-24">
      <section className="text-center space-y-6">
        <span className="inline-block rounded-full bg-accent-sage-surface px-4 py-1 text-sm text-accent-sage font-medium">
          Dịch vụ Y tế Sinh viên
        </span>
        <h1 className="font-serif text-5xl text-fg-primary leading-tight">
          Tâm trí bạn<br />
          <span className="italic">Quan trọng ở đây</span>
        </h1>
        <p className="text-lg text-fg-secondary max-w-lg mx-auto leading-relaxed">
          Hỗ trợ sức khỏe tâm thần miễn phí, bảo mật cho mọi sinh viên.
          Bạn không bao giờ đơn độc.
        </p>
      </section>
    </main>
  )
}

function AppLayout() {
  const { refreshToken, fetchMe } = useAuthStore()

  useEffect(() => {
    const init = async () => {
      try {
        await refreshToken()
      } catch {
        /* not logged in */
      }
      fetchMe()
    }
    init()
  }, [])

  return (
    <div className="min-h-screen bg-canvas">
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/diary" element={<DiaryPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/community/:id" element={<PostDetail />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
      <PageAgent />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App
