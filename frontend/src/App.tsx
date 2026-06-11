import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { AuthModal } from '@/components/features/auth/auth-modal'
import { useAuthStore } from '@/stores/auth-store'
import { DiaryPage } from '@/components/features/diary/diary-page'
import { TestPage } from '@/components/features/test/test-page'
import { AppointmentsPage } from '@/components/features/appointments/appointments-page'
import { CommunityPage } from '@/components/features/community/community-page'
import { PostDetail } from '@/components/features/community/post-detail'
import { ChatPage } from '@/components/features/chat/chat-page'
import { PageAgent } from '@/components/features/agent/page-agent'
import { ExpandableTabs } from '@/components/ui/expandable-tabs'
import { BookOpen, ClipboardCheck, Users, Calendar, MessageCircle, Home } from 'lucide-react'

const navTabs = [
  { title: 'Trang chủ', icon: Home },
  { type: 'separator' as const },
  { title: 'Nhật ký', icon: BookOpen },
  { title: 'Kiểm tra', icon: ClipboardCheck },
  { title: 'Cộng đồng', icon: Users },
  { title: 'Lịch hẹn', icon: Calendar },
  { title: 'Tin nhắn', icon: MessageCircle },
]

const tabRoutes = ['/', '/diary', '/test', '/community', '/appointments', '/chat']
const tabIndexByPath: Record<string, number> = {}
tabRoutes.forEach((path, i) => { tabIndexByPath[path] = i })

function NavBar() {
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()
  return (
    <>
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-lg font-semibold text-fg-primary no-underline hover:text-accent-sage transition-colors">
            MindWell
          </Link>
          <ExpandableTabs
            tabs={navTabs}
            activeColor="text-accent-sage"
            onChange={(index) => {
              if (index !== null) navigate(tabRoutes[index])
            }}
          />
          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <>
                <span className="text-sm text-fg-secondary mr-2">{user.name}</span>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full border border-border px-4 py-1.5 text-sm text-fg-secondary hover:bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage"
                >
                  Thoát
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
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
