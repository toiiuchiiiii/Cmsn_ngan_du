import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { AuthModal } from '@/components/features/auth/auth-modal'
import { useAuthStore } from '@/stores/auth-store'
import { DiaryPage } from '@/components/features/diary/diary-page'
import { TestPage } from '@/components/features/test/test-page'
import { TestManagement } from '@/components/features/test/test-management'
import { AppointmentsPage } from '@/components/features/appointments/appointments-page'
import { CommunityPage } from '@/components/features/community/community-page'
import { PostDetail } from '@/components/features/community/post-detail'
import { ChatPage } from '@/components/features/chat/chat-page'
import { PageAgent } from '@/components/features/agent/page-agent'
import { ExpandableTabs } from '@/components/ui/expandable-tabs'
import { SVGFollower } from '@/components/ui/svg-follower'
import { BookOpen, ClipboardCheck, Users, Calendar, MessageCircle, Home, PlusCircle, UserCog, Library } from 'lucide-react'
import { RoleRequestPage } from '@/components/features/auth/role-request'
import { LibraryPage } from '@/components/features/library/library-page'
import { LibraryDetail } from '@/components/features/library/library-detail'
import { LibraryManage } from '@/components/features/library/library-manage'
import { NotificationBell } from '@/components/features/notifications/notification-bell'
import type { LucideIcon } from 'lucide-react'

const navTabs: ({ title: string; icon: LucideIcon } | { type: 'separator' })[] = [
  { title: 'Trang chủ', icon: Home },
  { type: 'separator' as const },
  { title: 'Nhật ký', icon: BookOpen },
  { title: 'Kiểm tra', icon: ClipboardCheck },
  { title: 'Thư viện', icon: Library },
  { title: 'Cộng đồng', icon: Users },
  { title: 'Lịch hẹn', icon: Calendar },
  { title: 'Tin nhắn', icon: MessageCircle },
]

const tabRoutes = ['/', '/diary', '/test', '/library', '/community', '/appointments', '/chat']

function NavBar() {
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const role = user?.role ?? 'patient'
  const canManageTests = role === 'therapist' || role === 'admin'
  return (
    <>
      <header className="border-b border-border bg-canvas/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-lg font-semibold text-fg-primary no-underline hover:text-accent-sage transition-colors">
            MindWell
          </Link>
          <ExpandableTabs
            tabs={navTabs}
            activeColor="text-accent-sage"
            onChange={(index) => {
              if (index === null) return
              const routeIdx = navTabs.slice(0, index + 1).filter(t => !('type' in t && t.type === 'separator')).length - 1
              navigate(tabRoutes[routeIdx])
            }}
          />
          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <>
                {canManageTests && (
                  <>
                    <Link
                      to="/test/manage"
                      className="hidden sm:inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-accent-sage font-medium hover:bg-accent-sage-surface transition-colors no-underline"
                    >
                      <PlusCircle size={14} />
                      Quản lý test
                    </Link>
                    <Link
                      to="/library/manage"
                      className="hidden sm:inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-accent-sage font-medium hover:bg-accent-sage-surface transition-colors no-underline"
                    >
                      <PlusCircle size={14} />
                      Đăng bài viết
                    </Link>
                  </>
                )}
                {role === 'patient' && (
                  <Link
                    to="/role-request"
                    className="hidden sm:inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-fg-secondary font-medium hover:bg-surface-hover transition-colors no-underline"
                  >
                    <UserCog size={14} />
                    Làm tư vấn viên
                  </Link>
                )}
                {role === 'admin' && (
                  <Link
                    to="/role-request"
                    className="hidden sm:inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-accent-sage font-medium hover:bg-accent-sage-surface transition-colors no-underline"
                  >
                    <UserCog size={14} />
                    Quản lý yêu cầu
                  </Link>
                )}
                <NotificationBell />
                <span className="text-sm text-fg-secondary mr-2 hidden sm:inline">{user.name}</span>
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
      <section className="text-center space-y-8">
        <span className="inline-block rounded-full bg-accent-sage-surface px-5 py-1.5 text-sm text-accent-sage font-medium tracking-wide">
          Dịch vụ Y tế Sinh viên
        </span>
        <h1 className="font-serif text-5xl md:text-6xl text-fg-primary leading-tight">
          Tâm trí bạn<br />
          <span className="italic font-light">Quan trọng ở đây</span>
        </h1>
        <p className="text-lg text-fg-secondary max-w-xl mx-auto leading-relaxed">
          Hỗ trợ sức khỏe tâm thần miễn phí, bảo mật cho mọi sinh viên.
          Bạn không bao giờ đơn độc.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link
            to="/test"
            className="rounded-full bg-accent-sage text-white px-8 py-3 font-medium hover:bg-accent-sage/90 transition-colors text-sm no-underline"
          >
            Kiểm tra sức khỏe
          </Link>
          <Link
            to="/chat"
            className="rounded-full border border-border px-8 py-3 text-sm text-fg-secondary font-medium hover:bg-surface-hover transition-colors no-underline"
          >
            Trò chuyện ngay
          </Link>
        </div>
      </section>

      <section className="mt-32 grid md:grid-cols-3 gap-6">
        {[
          { icon: ClipboardCheck, title: 'Bài kiểm tra', desc: 'Đánh giá sức khỏe tâm thần qua các bài kiểm tra chuẩn hóa', to: '/test' },
          { icon: BookOpen, title: 'Nhật ký cảm xúc', desc: 'Ghi lại cảm xúc hàng ngày và theo dõi sự thay đổi theo thời gian', to: '/diary' },
          { icon: MessageCircle, title: 'Tư vấn trực tuyến', desc: 'Trò chuyện bảo mật với chuyên gia tư vấn tâm lý', to: '/chat' },
        ].map((item) => (
          <Link key={item.title} to={item.to} className="block rounded-2xl border border-border bg-surface p-6 text-center hover:shadow-sm transition-shadow no-underline">
            <div className="w-12 h-12 rounded-xl bg-accent-sage-surface flex items-center justify-center mx-auto mb-4">
              <item.icon size={24} className="text-accent-sage" />
            </div>
            <h3 className="font-serif text-lg text-fg-primary mb-2">{item.title}</h3>
            <p className="text-sm text-fg-tertiary leading-relaxed">{item.desc}</p>
          </Link>
        ))}
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
    <div className="min-h-screen bg-canvas relative">
      <SVGFollower
        className="fixed inset-0 z-0 pointer-events-none"
        colors={["#a7c957", "#6a9c89", "#45b7d1", "#c9a7eb", "#f4a261"]}
        autoPlay
        width="100%"
        height="100%"
      />
      <div className="relative z-10">
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/diary" element={<DiaryPage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/test/manage" element={<TestManagement />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/:id" element={<PostDetail />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/role-request" element={<RoleRequestPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/library/:id" element={<LibraryDetail />} />
          <Route path="/library/manage" element={<LibraryManage />} />
        </Routes>
        <PageAgent />
      </div>
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
