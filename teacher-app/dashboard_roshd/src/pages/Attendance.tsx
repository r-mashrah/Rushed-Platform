
import { useState, useEffect } from 'react'
import { attendanceAPI } from '../services/apiOthers'
import Table from '../components/Table'
import {
  ChevronRight, ChevronLeft,
  CalendarDays,
} from 'lucide-react'
import type { Attendance, AttendanceStatus } from '../types'

// ── helpers ────────────────────────────────────────────────────────────────
// const toStr   = (d: Date) => d.toISOString().split('T')[0]
const toStr = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
const DAYS    = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
const MONTHS  = ['يناير','فبراير','مارس','إبريل','مايو','يونيو',
                 'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']

function buildCalendar(year: number, month: number): (Date | null)[] {
  const first      = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startDay   = first.getDay()          // 0 = Sun
  const cells: (Date | null)[] = []
  for (let i = 0; i < startDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

// ── component ──────────────────────────────────────────────────────────────
export default function AttendancePage() {
  const today = new Date()

  const [calYear,  setCalYear]  = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [selected, setSelected] = useState<Date>(today)
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  const cells = buildCalendar(calYear, calMonth)

  useEffect(() => { load() }, [selected])

  const load = async () => {
    try {
      setLoading(true); setError(null)
      const data = await attendanceAPI.getByDate(selected)
      setAttendance(data ?? [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'حدث خطأ')
      setAttendance([])
    } finally { setLoading(false) }
  }

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11) }
    else setCalMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0) }
    else setCalMonth(m => m + 1)
  }

  const pickDate = (d: Date) => {
    setSelected(d)
    setCalYear(d.getFullYear())
    setCalMonth(d.getMonth())
  }

  // stats
  const total   = attendance.length
  const present = attendance.filter(a => a.status === 'present').length
  const absent  = attendance.filter(a => a.status === 'absent').length
  const late    = attendance.filter(a => a.status === 'late').length
  const rate    = total > 0 ? Math.round((present / total) * 100) : 0

  const STATS = [
    { label: 'الإجمالي', value: total,   t: 'text-violet-600',  bg: 'bg-violet-50',  ring: 'ring-violet-100' },
    { label: 'حاضر',     value: present, t: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-100' },
    { label: 'غائب',     value: absent,  t: 'text-red-600',     bg: 'bg-red-50',     ring: 'ring-red-100' },
    { label: 'متأخر',    value: late,    t: 'text-amber-600',   bg: 'bg-amber-50',   ring: 'ring-amber-100' },
  ]

  const STATUS_CFG: Record<AttendanceStatus,{text:string;cls:string;dot:string}> = {
    present: { text:'حاضر',  cls:'bg-emerald-50 text-emerald-700 border border-emerald-200', dot:'bg-emerald-400' },
    absent:  { text:'غائب',  cls:'bg-red-50 text-red-700 border border-red-200',             dot:'bg-red-400' },
    late:    { text:'متأخر', cls:'bg-amber-50 text-amber-700 border border-amber-200',       dot:'bg-amber-400' },
    excused: { text:'معذور', cls:'bg-blue-50 text-blue-700 border border-blue-200',          dot:'bg-blue-400' },
  }

  const columns = [
    {
      key: 'student',
      label: 'الطالب',
      render: (a: Attendance) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-accent-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
            {(a.student_name_cache || '؟').charAt(0)}
          </div>
          <span className="font-semibold text-gray-800 text-sm">{a.student_name_cache || '—'}</span>
        </div>
      ),
    },
    {
      key: 'section',
      label: 'الصف',
      render: (a: Attendance) => (
        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
          {a.section_name_cache || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (a: Attendance) => {
        const s = STATUS_CFG[a.status]
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${s.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.text}
          </span>
        )
      },
    },
    {
      key: 'notes',
      label: 'ملاحظات',
      render: (a: Attendance) => <span className="text-xs text-gray-400 italic">{a.notes || '—'}</span>,
    },
  ]

  const selStr   = toStr(selected)
  const todayStr = toStr(today)

  return (
    <div className="w-full" dir="rtl">

      {/* ── Page Title ── */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">الحضور والغياب</h1>
        <p className="text-gray-400 text-sm mt-1">اضغط على أي يوم لعرض سجل الحضور</p>
      </div>

      <div className="flex gap-6 flex-wrap lg:flex-nowrap">

        {/* ════════════════════════════════
            RIGHT: Calendar
        ════════════════════════════════ */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-4">

          {/* Calendar Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Month Header */}
            <div className="bg-gradient-to-l from-primary-600 to-accent-500 px-5 py-4">
              <div className="flex items-center justify-between mb-1">
                <button onClick={prevMonth}
                  className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition">
                  <ChevronRight size={16} />
                </button>
                <div className="text-center">
                  <p className="text-white font-black text-lg leading-none">
                    {MONTHS[calMonth]}
                  </p>
                  <p className="text-white/70 text-xs mt-0.5">{calYear}</p>
                </div>
                <button onClick={nextMonth}
                  className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition">
                  <ChevronLeft size={16} />
                </button>
              </div>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 border-b border-gray-100">
              {DAYS.map(d => (
                <div key={d} className="py-2 text-center text-xs font-bold text-gray-400">
                  {d.slice(0,2)}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 p-3 gap-1">
              {cells.map((d, i) => {
                if (!d) return <div key={`e-${i}`} />

                const dStr      = toStr(d)
                const isSel     = dStr === selStr
                const isToday   = dStr === todayStr
                const isWeekend = d.getDay() === 5 // الجمعة فقط
                const isPast    = d > today

                return (
                  <button
                    key={dStr}
                    onClick={() => !isWeekend && pickDate(d)}
                    disabled={isWeekend}
                    className={`
                      relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-bold transition-all
                      ${isWeekend ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}
                      ${isSel
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 scale-110'
                        : isToday
                        ? 'bg-primary-50 text-primary-600 ring-2 ring-primary-300'
                        : isPast
                        ? 'text-gray-300 hover:bg-gray-50'
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    {d.getDate()}
                    {isToday && !isSel && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary-500" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Footer */}
            <div className="px-4 pb-4">
              <button
                onClick={() => pickDate(today)}
                className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-primary-50 text-gray-600 hover:text-primary-600 text-xs font-bold transition-all">
                العودة لليوم الحالي
              </button>
            </div>
          </div>

          {/* Legend */}
          {/* <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
            <p className="text-xs font-bold text-gray-500 mb-3">دليل الحالات</p>
            {Object.entries(STATUS_CFG).map(([, v]) => (
              <div key={v.text} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${v.dot}`} />
                <span className="text-xs text-gray-600 font-medium">{v.text}</span>
              </div>
            ))}
          </div> */}
        </div>

        {/* ════════════════════════════════
            LEFT: Stats + Table
        ════════════════════════════════ */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Selected Date Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-l from-primary-600 to-accent-500 flex items-center justify-center flex-shrink-0">
              <CalendarDays className="text-white" size={18} />
            </div>
            <div>
              <p className="font-black text-gray-900 text-lg leading-none">
                {DAYS[selected.getDay()]} {selected.getDate()} {MONTHS[selected.getMonth()]} {selected.getFullYear()}
              </p>
              {selStr === todayStr && (
                <span className="text-xs text-primary-600 font-semibold bg-primary-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                  اليوم
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {STATS.map(({ label, value, t, bg, ring }) => (
              <div key={label} className={`rounded-2xl ${bg} ring-1 ${ring} p-4 flex flex-col justify-center`}>
                <p className={`text-2xl font-black ${t} leading-none`}>
                  {loading ? <span className="text-lg opacity-40">—</span> : value}
                </p>
                <p className="text-xs text-gray-500 font-medium mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          {total > 0 && !loading && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-600">نسبة الحضور</span>
                <span className={`text-lg font-black ${
                  rate >= 80 ? 'text-emerald-600' : rate >= 60 ? 'text-amber-600' : 'text-red-600'
                }`}>{rate}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    rate >= 80 ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                    : rate >= 60 ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                    : 'bg-gradient-to-r from-red-400 to-rose-400'
                  }`}
                  style={{ width: `${rate}%` }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Table */}
          {attendance.length === 0 && !loading ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="text-gray-300" size={32} />
              </div>
              <p className="font-bold text-gray-600 mb-1">لا توجد بيانات حضور</p>
              <p className="text-sm text-gray-400">لم يتم تسجيل الحضور لهذا اليوم</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-5 bg-gradient-to-b from-primary-500 to-accent-500 rounded-full" />
                  سجل الحضور
                </h2>
                <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full font-medium">
                  {total} طالب
                </span>
              </div>
              <Table columns={columns} data={attendance} loading={loading} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}