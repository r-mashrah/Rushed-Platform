
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, UserCheck,
  FileQuestion, ClipboardList, MessageSquare, BarChart3,
  Calendar, Settings, LogOut, Menu, X, ChevronRight, ChevronLeft
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { schoolSettingsSupabaseAPI } from '../services/supabaseApi'
import { adminsAPI } from '../services/api'
import { getImageUrl } from '../lib/supabaseHelpers'

const menuItems = [
  { path: '/', label: 'لوحة التحكم', icon: LayoutDashboard },
  { path: '/teachers', label: 'إدارة المعلمين', icon: Users },
  { path: '/grades-sections', label: 'الصفوف والشعب', icon: GraduationCap },
  { path: '/subjects', label: 'إدارة المواد', icon: BookOpen },
  { path: '/students', label: 'إدارة الطلاب', icon: UserCheck },
  { path: '/question-bank', label: 'بنك الأسئلة', icon: FileQuestion },
  { path: '/exams', label: 'الاختبارات والنماذج', icon: ClipboardList },
  // { path: '/content-review', label: 'مراجعة المحتوى', icon: Eye },
  { path: '/parents', label: 'أولياء الأمور', icon: MessageSquare },
  { path: '/reports-grades', label: 'التقارير والدرجات', icon: BarChart3 },
  { path: '/attendance', label: 'الحضور والغياب', icon: Calendar },
  { path: '/settings', label: 'الإعدادات', icon: Settings },
]

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { admin, logout, adminProfileUrl, setAdminProfileUrl } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [schoolName, setSchoolName] = useState('نظام إدارة التعلم')
  const [schoolLogoUrl, setSchoolLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    schoolSettingsSupabaseAPI.getPublic()
      .then((s) => {
        setSchoolName(String(s?.school_name ?? 'نظام إدارة التعلم'))
        setSchoolLogoUrl(getImageUrl(s as any, 'logo'))
      })
      .catch(() => { /* keep default */ })
  }, [])

  useEffect(() => {
    if (!admin?.id) {
      setAdminProfileUrl(null)
      return
    }
    adminsAPI.getById(admin.id)
      .then((a) => setAdminProfileUrl(a.profile_image_url ?? getImageUrl(a as unknown as Record<string, unknown>, 'profile') ?? null))
      .catch(() => { /* لا نمسح الصورة عند فشل الجلب كي تبقى ظاهرة */ })
  }, [admin?.id, location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const sidebarWidth = sidebarCollapsed ? 'w-20' : 'w-72'
  const mainMargin = sidebarCollapsed ? 'mr-20' : 'mr-72'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" dir="rtl">
      {/* Top Bar */}
      <header className="bg-white/80 backdrop-blur-lg shadow-soft border-b border-gray-200/50 fixed top-0 left-0 right-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex items-center gap-3">
                {schoolLogoUrl && (
                  <div className="p-2 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl shadow-lg">
                    <img src={schoolLogoUrl} alt="شعار المدرسة" className="h-10 w-10 rounded-lg object-contain" />
                  </div>
                )}
                {/* <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                    {schoolName}
                  </h3>
                  <p className="text-xs text-black-500">                                   منصة رُشد التعليمية الذكية

                  </p>
                </div> */}
<div>
  <h3 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
    {schoolName}
  </h3>
  <p className="text-sm text-black-500">
    منصة رُشد التعليمية الذكية
  </p>
</div>
              </div>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-all duration-300 border border-slate-200"
                title={sidebarCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
              >
                {sidebarCollapsed ? (
                  <ChevronLeft size={24} className="transition-transform duration-300" />
                ) : (
                  <ChevronRight size={24} className="transition-transform duration-300" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div
                onClick={() => navigate('/settings')}
                className="hidden md:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl cursor-pointer hover:shadow-md transition-all duration-300"
              >
                {adminProfileUrl ? (
                  <img src={adminProfileUrl} alt={admin?.full_name} className="w-10 h-10 rounded-full object-cover border-2 border-primary-500 shadow-lg" />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {admin?.full_name?.charAt(0) || 'أ'}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">{admin?.full_name}</p>
                  <p className="text-xs text-gray-500">مدير النظام</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-20">
        {/* Sidebar - Fixed Position */}
        <aside
          className={`
            fixed inset-y-0 right-0 z-40
            ${sidebarWidth} bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl
            transform transition-all duration-300 ease-in-out
            ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            pt-20 lg:pt-20
            border-l border-slate-700/50
            overflow-hidden
          `}
        >
          <nav className="h-full overflow-y-auto py-6 px-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => {
                        navigate(item.path)
                        setMobileMenuOpen(false)
                      }}
                      className={`
                        w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-4'} px-4 py-3 rounded-xl
                        transition-all duration-300 text-right group relative
                        ${isActive
                          ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-lg shadow-primary-500/50'
                          : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                        }
                      `}
                      title={sidebarCollapsed ? item.label : ''}
                    >
                      <Icon
                        size={sidebarCollapsed ? 28 : 22}
                        className={`flex-shrink-0 transition-all duration-300 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}
                      />
                      {!sidebarCollapsed && (
                        <>
                          <span className="font-medium">{item.label}</span>
                          {isActive && (
                            <div className="mr-auto w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </>
                      )}
                      {sidebarCollapsed && isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 ${mainMargin} transition-all duration-300 ease-in-out`}>
          <div className="p-4 sm:p-6 lg:p-8 max-w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
