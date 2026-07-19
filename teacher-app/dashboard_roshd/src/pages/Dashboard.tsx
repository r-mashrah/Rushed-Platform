
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardAPI } from '../services/apiDashboard'
import { supabase } from '../lib/supabase'
import {
  Users, GraduationCap, BookOpen, FileQuestion,
  MessageSquare, TrendingUp,
  ArrowUpRight, CheckCircle2, BarChart3, Clock,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'

interface DashboardStats {
  totalStudents: number; totalTeachers: number
  totalSubjects: number; totalQuestions: number
  pendingExams: number;  unreadMessages: number
}
interface WeeklyActivity { day: string; students: number; teachers: number }
interface SubjectAverage  { name: string; average: number }
interface RealStats {
  publishedExams: number; attendanceRate: number
  avgGrade: number;       reportsToday: number
}

async function fetchRealStats(): Promise<RealStats> {
  try {
    const today = new Date().toISOString().split('T')[0]
    const [{ count: pub }, { data: att }, { data: gr }, { count: rep }] = await Promise.all([
      supabase.from('exams').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('attendance').select('status').eq('attendance_date', today),
      supabase.from('exam_results').select('percentage').eq('status', 'completed'),
      supabase.from('reports').select('*', { count: 'exact', head: true }).gte('sent_at', `${today}T00:00:00`),
    ])
    const attArr = att || []
    const present = attArr.filter((a: any) => a.status === 'present').length
    const grArr = gr || []
    return {
      publishedExams:  pub || 0,
      attendanceRate:  attArr.length > 0 ? Math.round(present / attArr.length * 100) : 0,
      avgGrade:        grArr.length > 0 ? Math.round(grArr.reduce((s: number, r: any) => s + (r.percentage || 0), 0) / grArr.length) : 0,
      reportsToday:    rep || 0,
    }
  } catch { return { publishedExams: 0, attendanceRate: 0, avgGrade: 0, reportsToday: 0 } }
}

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 shadow-xl rounded-xl px-3 py-2.5 text-xs">
      <p className="font-semibold text-gray-400 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-400">{p.name}</span>
          <span className="font-black text-gray-900 mr-auto">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

const BAR_COLORS = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899']

export default function Dashboard() {
  const navigate = useNavigate()

  const [stats,   setStats]   = useState<DashboardStats | null>(null)
  const [weekly,  setWeekly]  = useState<WeeklyActivity[]>([])
  const [subjAvg, setSubjAvg] = useState<SubjectAverage[]>([])
  const [real,    setReal]    = useState<RealStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
    const t = setInterval(load, 300_000)
    return () => clearInterval(t)
  }, [])

  const load = async () => {
    try {
      setLoading(true)
      const [s, w, a, r] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getWeeklyActivity(),
        dashboardAPI.getAverageGradesBySubject(),
        fetchRealStats(),
      ])
      setStats(s); setWeekly(w); setSubjAvg(a); setReal(r)
    } finally { setLoading(false) }
  }

  const dateAr = new Date().toLocaleDateString('ar-SA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const chartD = weekly.map(d => ({
    name: d.day.slice(0, 3), 'تسجيلات الدخول': d.students, معلمين: d.teachers,
  }))

  // ✅ 4 بطاقات فقط — حُذفت "اختبارات معلقة"
  const mainCards = [
    { label: 'الطلاب',      value: stats?.totalStudents  ?? 0, sub: 'إجمالي الطلاب النشطين', path: '/students',      icon: Users,         accent: '#6366f1', light: '#eef2ff' },
    { label: 'المعلمون',    value: stats?.totalTeachers  ?? 0, sub: 'أعضاء هيئة التدريس',    path: '/teachers',      icon: GraduationCap, accent: '#8b5cf6', light: '#f5f3ff' },
    { label: 'المواد',      value: stats?.totalSubjects  ?? 0, sub: 'المواد الدراسية النشطة', path: '/subjects',      icon: BookOpen,      accent: '#06b6d4', light: '#ecfeff' },
    { label: 'بنك الأسئلة', value: stats?.totalQuestions ?? 0, sub: 'أسئلة معتمدة',           path: '/question-bank', icon: FileQuestion,  accent: '#10b981', light: '#ecfdf5' },
  ]

  const liveCards = [
    { label: 'حضور اليوم',      value: `${real?.attendanceRate ?? 0}%`, icon: CheckCircle2, color: (real?.attendanceRate ?? 0) >= 80 ? '#10b981' : (real?.attendanceRate ?? 0) >= 60 ? '#f59e0b' : '#ef4444' },
    { label: 'اختبارات منشورة', value: real?.publishedExams ?? 0,       icon: BarChart3,    color: '#6366f1' },
    { label: 'متوسط الدرجات',   value: `${real?.avgGrade ?? 0}%`,       icon: TrendingUp,   color: (real?.avgGrade ?? 0) >= 70 ? '#10b981' : '#f59e0b' },
    { label: 'تقارير اليوم',    value: real?.reportsToday ?? 0,         icon: Clock,        color: '#8b5cf6' },
  ]

  const unread = stats?.unreadMessages ?? 0

  if (loading && !stats) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500 animate-pulse" />
        <p className="text-gray-400 text-sm">جاري التحميل...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 max-w-7xl" dir="rtl">

      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-bold text-indigo-500 tracking-[0.2em] uppercase mb-1">لوحة التحكم</p>
          <h3 className="text-[1.875rem] font-black text-gray-900 tracking-tight leading-none">مرحباً بك </h3>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-4 py-2.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {/* <p className="text-sm text-gray-400 mt-1.5">{dateAr}</p> */}
                          <p className="text-sm font-bold text-gray-900 mt-1.5">{dateAr}</p>

        </div>
      </div>

      {/* ✅ 4 بطاقات رئيسية قابلة للضغط */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {mainCards.map(({ label, value, sub, path, icon: Icon, accent, light }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-right hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl"
              style={{ background: light }} />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                  style={{ background: light }}>
                  <Icon size={17} style={{ color: accent }} />
                </div>
                <ArrowUpRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
                  style={{ color: accent }} />
              </div>
              <p className="text-2xl font-black text-gray-900 leading-none">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              <p className="text-xs font-bold text-gray-700 mt-1.5 leading-tight">{label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight hidden lg:block">{sub}</p>
            </div>
          </button>
        ))}
      </div>

      {/* مقاييس حية + رسائل */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {liveCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
              style={{ background: `${color}18` }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p className="text-xl font-black leading-none" style={{ color }}>{value}</p>
              <p className="text-xs text-gray-500 font-medium mt-1">{label}</p>
            </div>
          </div>
        ))}

        {/* رسائل غير مقروءة */}
        <button
          onClick={() => navigate('/parents')}
          className="group bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-all duration-200 text-right"
        >
          <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
            style={{ background: unread > 0 ? '#fef2f2' : '#f9fafb' }}>
            <MessageSquare size={18} style={{ color: unread > 0 ? '#ef4444' : '#9ca3af' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xl font-black leading-none" style={{ color: unread > 0 ? '#ef4444' : '#111827' }}>
              {unread}
            </p>
            <p className="text-xs text-gray-500 font-medium mt-1 truncate">رسائل غير مقروءة</p>
          </div>
          <ArrowUpRight size={13} className="text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors" />
        </button>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">نشاط الأسبوع</h3>
              <p className="text-xs text-gray-400 mt-0.5">تسجيل الدخول أسبوعياً</p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              {[{ c: '#6366f1', l: 'الطلاب' }, { c: '#a78bfa', l: 'معلمين' }].map(({ c, l }) => (
                <div key={l} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: c }} />
                  <span className="text-gray-400">{l}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartD} margin={{ top: 4, right: 4, bottom: 0, left: -25 }}>
              <defs>
                {[['gS', '#6366f1'], ['gT', '#a78bfa']].map(([id, c]) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={c} stopOpacity={0.12} />
                    <stop offset="100%" stopColor={c} stopOpacity={0}    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} />
              <Area type="monotone" dataKey="تسجيلات الدخول" stroke="#6366f1" strokeWidth={2.5} fill="url(#gS)" dot={false} activeDot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} />
              <Area type="monotone" dataKey="معلمين" stroke="#a78bfa" strokeWidth={2.5} fill="url(#gT)" dot={false} activeDot={{ r: 4, fill: '#a78bfa', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="mb-5">
            <h3 className="font-bold text-gray-900 text-sm">متوسط الدرجات</h3>
            <p className="text-xs text-gray-400 mt-0.5">حسب المادة الدراسية</p>
          </div>
          {subjAvg.length === 0 ? (
            <div className="flex items-center justify-center h-[200px]">
              <p className="text-gray-300 text-sm">لا توجد بيانات</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={subjAvg} margin={{ top: 4, right: 4, bottom: 28, left: -25 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" />
                <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="average" radius={[5, 5, 0, 0]} maxBarSize={28}>
                  {subjAvg.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}