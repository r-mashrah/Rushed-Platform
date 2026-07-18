

import { useState, useEffect, useRef } from 'react'
import { examsAPI } from '../services/apiExams'
import { subjectsAPI, gradesAPI, semestersAPI } from '../services/api'
import Table from '../components/Table'
import Modal from '../components/Modal'
import { Plus, Edit, Trash2, Send, Upload, Eye } from 'lucide-react'
import { uploadExamPdf, validatePdfFile, FILE_LIMITS } from '../services/storageService'
import type { Exam, ExamStatus } from '../types'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import {
  BookOpen, Clock, HelpCircle, Award, BarChart2,
  CheckCircle2, XCircle, TrendingUp, Calendar, Layers,
  ChevronDown, ChevronUp, FileText, AlertCircle, Users,
} from 'lucide-react'

export default function Exams() {
  const [exams, setExams] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [detailExam, setDetailExam] = useState<any | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  useEffect(() => {
    const init = async () => {
      const subjectsData = await loadSubjects()
      await loadExams(subjectsData)
    }
    init()
  }, [])

  const loadSubjects = async (): Promise<any[]> => {
    try {
      const data = await subjectsAPI.getAll()
      setSubjects(data)
      return data
    } catch (error) {
      console.error('Error loading subjects:', error)
      return []
    }
  }

  const loadExams = async (subjectsData?: any[]) => {
    try {
      setLoading(true)
      const subjectsList = subjectsData ?? subjects

      // ✅ استخدام examsAPI لأنه يمرر user context لـ RLS
      const data = await examsAPI.getAll()

      // جلب عدد الأسئلة لكل اختبار
      const enriched = await Promise.all(
        data.map(async (exam: any) => {
          try {
            const questions = await examsAPI.getQuestions(exam.id)
            return {
              ...exam,
              subject_name: subjectsList.find((s: any) => s.id === exam.subject_id)?.name || null,
              questions_count: questions.length,
            }
          } catch {
            return {
              ...exam,
              subject_name: subjectsList.find((s: any) => s.id === exam.subject_id)?.name || null,
              questions_count: 0,
            }
          }
        })
      )

      setExams(enriched)
    } catch (error) {
      console.error('Error loading exams:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async (exam: any) => {
    if (!confirm('هل تريد نشر الاختبار للطلاب؟')) return
    try {
      await examsAPI.publish(exam.id)
      alert('تم نشر الاختبار بنجاح')
      loadExams()
    } catch (error: any) {
      alert(error.message || 'حدث خطأ')
    }
  }

  const getStatusLabel = (status: ExamStatus | null) => {
    const labels: Record<string, string> = {
      draft: 'مسودة',
      pending: 'معلق',
      approved: 'موافق عليه',
      published: 'منشور',
      completed: 'مكتمل',
      rejected: 'مرفوض',
    }
    return labels[status || 'draft'] || status
  }

  const columns = [
    {
      key: 'title',
      label: 'عنوان الاختبار',
      render: (exam: any) => (
        <button
          onClick={() => { setDetailExam(exam); setDetailModalOpen(true) }}
          className="text-primary-600 hover:text-primary-800 font-semibold hover:underline text-right"
        >
          {exam.title}
        </button>
      ),
    },
    {
      key: 'subject',
      label: 'المادة',
      render: (exam: any) => (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">
          📚 {exam.subject_name || `المادة #${exam.subject_id}`}
        </span>
      ),
    },
    {
      key: 'questions_count',
      label: 'عدد الأسئلة',
      render: (exam: any) => (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold">
          {exam.questions_count ?? 0} سؤال
        </span>
      ),
    },
    {
      key: 'semester',
      label: 'الفصل',
      render: (exam: any) => (exam.semester_id === 1 ? 'الأول' : 'الثاني'),
    },
    {
      key: 'difficulty',
      label: 'الصعوبة',
      render: (exam: any) => {
        const labels: Record<string, string> = {
          easy: 'سهل',
          medium: 'متوسط',
          hard: 'صعب',
        }
        return labels[exam.difficulty_level || 'medium'] || '—'
      },
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (exam: any) => {
        const statusStyles: Record<string, string> = {
          draft:     'bg-gray-100 text-gray-600',
          pending:   'bg-yellow-100 text-yellow-700',
          approved:  'bg-green-100 text-green-700',
          published: 'bg-blue-100 text-blue-700',
          completed: 'bg-purple-100 text-purple-700',
          rejected:  'bg-red-100 text-red-700',
        }
        const style = statusStyles[exam.status || 'draft'] || 'bg-gray-100 text-gray-600'
        return (
          <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-semibold ${style}`}>
            {getStatusLabel(exam.status)}
          </span>
        )
      },
    },
  ]

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent mb-2">
            الاختبارات والنماذج
          </h1>
          <p className="text-gray-600 text-lg">عرض وإدارة الاختبارات</p>
        </div>
        <button
          onClick={() => {
            setEditingExam(null)
            setModalOpen(true)
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
        >
          <Plus size={20} />
          <span>إضافة نموذج جديد</span>
        </button>
      </div>

      <Table
        columns={columns}
        data={exams}
        loading={loading}
        actions={(exam) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setDetailExam(exam); setDetailModalOpen(true) }}
              className="text-gray-500 hover:text-gray-700"
              title="عرض التفاصيل"
            >
              <Eye size={18} />
            </button>
            <button
              onClick={() => {
                setEditingExam(exam)
                setModalOpen(true)
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              <Edit size={18} />
            </button>
            {exam.status === 'approved' && (
              <button
                onClick={() => handlePublish(exam)}
                className="text-green-600 hover:text-green-800"
                title="نشر الاختبار"
              >
                <Send size={18} />
              </button>
            )}
            <button
              onClick={async () => {
                if (confirm('هل أنت متأكد من حذف هذا الاختبار؟')) {
                  try {
                    await examsAPI.delete(exam.id)
                    loadExams()
                  } catch (error: any) {
                    alert(error.message || 'حدث خطأ')
                  }
                }
              }}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingExam(null)
        }}
        title={editingExam ? 'تحديث اختبار' : 'إضافة نموذج جديد'}
        size="lg"
      >
        <ExamForm
          exam={editingExam}
          onSuccess={() => {
            setModalOpen(false)
            setEditingExam(null)
            loadExams()
          }}
        />
      </Modal>

      {/* ── Detail Modal ── */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => { setDetailModalOpen(false); setDetailExam(null) }}
        title="تفاصيل الاختبار"
        size="lg"
      >
        {detailExam && <ExamDetailView exam={detailExam} subjects={subjects} />}
      </Modal>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// EXAM DETAIL VIEW — النسخة المحسّنة
// ══════════════════════════════════════════════════════════════
function ExamDetailView({ exam, subjects }: { exam: any; subjects: any[] }) {
  const [questions, setQuestions]   = useState<any[]>([])
  const [loadingQ, setLoadingQ]     = useState(true)
  const [expandedQ, setExpandedQ]   = useState<number | null>(null)
  const [stats, setStats] = useState<{
    total_submissions: number
    passed: number
    failed: number
    avg_percentage: number | null
    last_submission: string | null
  } | null>(null)

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const { data: eqRows, error: eqErr } = await supabase
          .from('exam_questions')
          .select('question_id, question_order, marks')
          .eq('exam_id', exam.id)
          .order('question_order')
        if (eqErr) throw eqErr
        if (!eqRows || eqRows.length === 0) { setQuestions([]); return }
        const questionIds = eqRows.map((r: any) => r.question_id)
        const { data: qRows, error: qErr } = await supabase
          .from('questions')
          .select('id, question_text, question_type, difficulty_level')
          .in('id', questionIds)
        if (qErr) throw qErr
        const qMap = Object.fromEntries((qRows || []).map((q: any) => [q.id, q]))
        setQuestions(eqRows.map((eq: any) => ({
          question_order: eq.question_order,
          marks: eq.marks,
          questions: qMap[eq.question_id] ?? null,
        })))
      } catch (e) {
        console.error('loadQuestions error:', e)
      } finally {
        setLoadingQ(false)
      }
    }

    const loadStats = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_exam_stats', { p_exam_id: exam.id })
        if (error) throw error
        setStats({
          total_submissions: data?.total_submissions ?? 0,
          passed:            data?.passed            ?? 0,
          failed:            data?.failed            ?? 0,
          avg_percentage:    data?.avg_percentage    ?? null,
          last_submission:   data?.last_submission   ?? null,
        })
      } catch (e) {
        console.error('loadStats error:', e)
      }
    }

    loadQuestions()
    loadStats()
  }, [exam.id])

  // ── Helpers ────────────────────────────────────────────────
  const subject = subjects.find(s => s.id === exam.subject_id)

  const diffMap: Record<string, { label: string; cls: string; dot: string }> = {
    easy:   { label: 'سهل',   cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-400' },
    medium: { label: 'متوسط', cls: 'bg-amber-50   text-amber-700   ring-1 ring-amber-200',   dot: 'bg-amber-400'   },
    hard:   { label: 'صعب',   cls: 'bg-rose-50    text-rose-700    ring-1 ring-rose-200',     dot: 'bg-rose-400'    },
  }

  const typeMap: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    multiple_choice: { label: 'اختيار متعدد', cls: 'bg-sky-50    text-sky-700    ring-1 ring-sky-200',    icon: <Layers       size={11} /> },
    true_false:      { label: 'صح وخطأ',      cls: 'bg-teal-50   text-teal-700   ring-1 ring-teal-200',   icon: <CheckCircle2 size={11} /> },
    essay:           { label: 'مقالي',         cls: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200', icon: <FileText     size={11} /> },
    fill_blank:      { label: 'فراغات',        cls: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200', icon: <HelpCircle   size={11} /> },
  }

  const statusMap: Record<string, { label: string; cls: string; dot: string }> = {
    draft:     { label: 'مسودة',       cls: 'bg-gray-100    text-gray-600    ring-1 ring-gray-200',     dot: 'bg-gray-400'    },
    pending:   { label: 'معلق',        cls: 'bg-amber-50    text-amber-700   ring-1 ring-amber-200',    dot: 'bg-amber-400'   },
    approved:  { label: 'موافق عليه', cls: 'bg-emerald-50  text-emerald-700 ring-1 ring-emerald-200',  dot: 'bg-emerald-400' },
    published: { label: 'منشور',       cls: 'bg-primary-50 text-primary-700 ring-1 ring-primary-200',  dot: 'bg-primary-500' },
    completed: { label: 'مكتمل',       cls: 'bg-violet-50   text-violet-700  ring-1 ring-violet-200',   dot: 'bg-violet-400'  },
    rejected:  { label: 'مرفوض',      cls: 'bg-red-50      text-red-600     ring-1 ring-red-200',       dot: 'bg-red-400'     },
  }

  const sc   = statusMap[exam.status]          || statusMap.draft
  const diff = diffMap[exam.difficulty_level]  || { label: '—', cls: 'bg-gray-100 text-gray-500', dot: 'bg-gray-300' }

  const passRate = stats && stats.total_submissions > 0
    ? Math.round((stats.passed / stats.total_submissions) * 100) : 0

  const passRateColor =
    passRate >= 70
      ? { bar: 'from-emerald-400 to-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50', label: 'ممتاز' }
      : passRate >= 50
        ? { bar: 'from-amber-400 to-amber-500',   text: 'text-amber-600',   bg: 'bg-amber-50',   label: 'متوسط' }
        : { bar: 'from-rose-400 to-rose-500',     text: 'text-rose-600',    bg: 'bg-rose-50',    label: 'ضعيف'  }

  const totalMarks = questions.reduce((sum, q) => sum + (q.marks ?? 0), 0)

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="space-y-4" dir="rtl">

      {/* ══ HEADER CARD ══════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Gradient accent strip — matches project header */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary-600 via-accent-500 to-primary-400" />

        <div className="p-6">
          {/* Title row */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-primary-500 mb-1.5 tracking-wide">
                الاختبار الأكاديمي
              </p>
              <h2 className="text-xl font-black text-gray-900 leading-snug">{exam.title}</h2>
              {exam.description && (
                <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-xl">
                  {exam.description}
                </p>
              )}
            </div>
            {/* Status badge */}
            <span className={`flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl ${sc.cls}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
              {sc.label}
            </span>
          </div>

          {/* ── 4 Info Tiles ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[
              {
                icon: <BookOpen size={15} className="text-primary-500" />,
                label: 'المادة الدراسية',
                value: subject?.name || exam.subject_name || '—',
                bg: 'bg-primary-50',
                border: 'border-primary-100',
                valCls: 'text-primary-700',
              },
              {
                icon: <Clock size={15} className="text-sky-500" />,
                label: 'مدة الاختبار',
                value: `${exam.duration_minutes} دقيقة`,
                bg: 'bg-sky-50',
                border: 'border-sky-100',
                valCls: 'text-sky-700',
              },
              {
                icon: <HelpCircle size={15} className="text-violet-500" />,
                label: 'عدد الأسئلة',
                value: `${exam.questions_count ?? questions.length} سؤال`,
                bg: 'bg-violet-50',
                border: 'border-violet-100',
                valCls: 'text-violet-700',
              },
              {
                icon: <Award size={15} className="text-emerald-500" />,
                label: 'درجة النجاح',
                value: exam.passing_marks
                  ? `${exam.passing_marks}${totalMarks ? ` / ${totalMarks}` : ''}`
                  : '—',
                bg: 'bg-emerald-50',
                border: 'border-emerald-100',
                valCls: 'text-emerald-700',
              },
            ].map(({ icon, label, value, bg, border, valCls }) => (
              <div
                key={label}
                className={`${bg} border ${border} rounded-xl px-4 py-3.5 flex flex-col gap-2`}
              >
                <div className="flex items-center gap-1.5">
                  {icon}
                  <span className="text-xs font-semibold text-gray-500">{label}</span>
                </div>
                <p className={`text-sm font-black ${valCls} leading-none`}>{value}</p>
              </div>
            ))}
          </div>

          {/* ── Meta footer ── */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 border-t border-gray-100">
            {/* Difficulty */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">مستوى الصعوبة</span>
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg ${diff.cls}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
                {diff.label}
              </span>
            </div>

            {/* Semester */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">الفصل الدراسي</span>
              <span className="text-xs font-semibold text-gray-700 bg-gray-50 ring-1 ring-gray-200 px-2.5 py-1 rounded-lg">
                {exam.semester_id === 1 ? 'الفصل الأول' : 'الفصل الثاني'}
              </span>
            </div>

            {/* Date */}
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-gray-400" />
              <span className="text-xs text-gray-400 font-medium">تاريخ الإنشاء</span>
              <span className="text-xs font-semibold text-gray-700">
                {exam.created_at
                  ? new Date(exam.created_at).toLocaleDateString('ar-SA', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })
                  : '—'}
              </span>
            </div>

            {/* PDF badge */}
            {exam.pdf_filename && (
              <div className="flex items-center gap-1.5 ms-auto">
                <FileText size={12} className="text-primary-400" />
                <span className="text-xs font-semibold text-primary-600 bg-primary-50 ring-1 ring-primary-100 px-2.5 py-1 rounded-lg truncate max-w-[160px]">
                  {exam.pdf_filename}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ STATS CARD ═══════════════════════════════════════ */}
      {stats && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-sm">
                <BarChart2 size={15} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-800">إحصائيات الأداء</h3>
                <p className="text-xs text-gray-400 font-medium">نتائج الطلاب على هذا الاختبار</p>
              </div>
            </div>
            {stats.last_submission && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Clock size={11} />
                <span>
                  آخر تسليم:{' '}
                  {new Date(stats.last_submission).toLocaleDateString('ar-SA', {
                    month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Stat cells */}
          <div className="grid grid-cols-4 divide-x divide-x-reverse divide-gray-100">
            {[
              {
                icon: <Users        size={15} className="text-gray-400"    />,
                value: stats.total_submissions,
                label: 'المتقدمون',
                valCls: 'text-gray-800',
                bg: '',
              },
              {
                icon: <CheckCircle2 size={15} className="text-emerald-500" />,
                value: stats.passed,
                label: 'الناجحون',
                valCls: 'text-emerald-600',
                bg: 'bg-emerald-50/40',
              },
              {
                icon: <XCircle      size={15} className="text-rose-400"    />,
                value: stats.failed,
                label: 'الراسبون',
                valCls: 'text-rose-600',
                bg: 'bg-rose-50/40',
              },
              {
                icon: <TrendingUp   size={15} className="text-violet-500"  />,
                value: stats.avg_percentage !== null ? `${stats.avg_percentage}%` : '—',
                label: 'متوسط الدرجة',
                valCls: 'text-violet-600',
                bg: 'bg-violet-50/40',
              },
            ].map(({ icon, value, label, valCls, bg }) => (
              <div key={label} className={`${bg} flex flex-col items-center justify-center gap-2 px-4 py-5`}>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
                  {icon}
                  {label}
                </div>
                <p className={`text-3xl font-black ${valCls} leading-none`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          {stats.total_submissions > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-600">نسبة النجاح الكلية</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${passRateColor.bg} ${passRateColor.text}`}>
                    {passRateColor.label}
                  </span>
                </div>
                <span className={`text-base font-black ${passRateColor.text}`}>{passRate}%</span>
              </div>
              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${passRateColor.bar} transition-all duration-700`}
                  style={{ width: `${passRate}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-gray-400 font-medium">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ QUESTIONS CARD ═══════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-primary-500 flex items-center justify-center shadow-sm">
              <HelpCircle size={15} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-800">بنك أسئلة الاختبار</h3>
              <p className="text-xs text-gray-400 font-medium">قائمة الأسئلة مع تصنيفاتها</p>
            </div>
          </div>
          {questions.length > 0 && (
            <div className="flex items-center gap-2">
              {totalMarks > 0 && (
                <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-lg ring-1 ring-primary-100">
                  المجموع: {totalMarks} درجة
                </span>
              )}
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                {questions.length} سؤال
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        {loadingQ ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
            <span className="text-sm text-gray-400 font-medium">جارٍ تحميل الأسئلة...</span>
          </div>
        ) : questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-gray-400">
            <AlertCircle size={32} className="opacity-30" />
            <span className="text-sm font-medium">لا توجد أسئلة مضافة لهذا الاختبار</span>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {questions.map((eq: any, idx: number) => {
              const q      = eq.questions
              const type   = typeMap[q?.question_type]    || { label: q?.question_type || '—', cls: 'bg-gray-50 text-gray-500 ring-1 ring-gray-200', icon: null }
              const diffQ  = diffMap[q?.difficulty_level] || { label: '—', cls: 'bg-gray-50 text-gray-400 ring-1 ring-gray-100', dot: 'bg-gray-300' }
              const isOpen = expandedQ === idx

              return (
                <div key={idx} className="group">
                  <button
                    type="button"
                    onClick={() => setExpandedQ(isOpen ? null : idx)}
                    className="w-full flex items-start gap-4 px-5 py-4 hover:bg-gray-50/70 transition-colors text-start"
                  >
                    {/* Question number */}
                    <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-primary-500 to-accent-500 text-white rounded-lg flex items-center justify-center text-xs font-black shadow-sm mt-0.5">
                      {eq.question_order ?? idx + 1}
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 leading-relaxed line-clamp-2 group-hover:text-gray-900 transition-colors text-right">
                        {q?.question_text || '—'}
                      </p>
                      {/* Tags row */}
                      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                        {q?.question_type && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${type.cls}`}>
                            {type.icon}
                            {type.label}
                          </span>
                        )}
                        {q?.difficulty_level && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${diffQ.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${diffQ.dot}`} />
                            {diffQ.label}
                          </span>
                        )}
                        {eq.marks && (
                          <span className="text-[11px] font-bold text-primary-500 bg-primary-50 ring-1 ring-primary-100 px-2 py-0.5 rounded-md">
                            {eq.marks} درجة
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expand chevron */}
                    <span className="flex-shrink-0 text-gray-300 group-hover:text-gray-400 transition-colors mt-1">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </button>

                  {/* Expanded: full question text */}
                  {isOpen && (
                    <div className="px-5 pb-4 pt-0">
                      <div className="mr-11 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5">
                        <p className="text-sm text-gray-700 leading-loose font-medium text-right">
                          {q?.question_text || '—'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// EXAM FORM
// ══════════════════════════════════════════════════════════════
function ExamForm({ exam, onSuccess }: { exam: Exam | null; onSuccess: () => void }) {
  const { admin } = useAuthStore()
  const [subjects, setSubjects] = useState<any[]>([])
  const [grades, setGrades] = useState<any[]>([])
  const [sections, setSections] = useState<any[]>([])
  const [semesters, setSemesters] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: exam?.title || '',
    description: exam?.description || '',
    subject_id: exam?.subject_id || 0,
    grade_id: exam?.grade_id || 0,
    section_id: exam?.section_id || 0,
    semester_id: exam?.semester_id || 0,
    difficulty_level: exam?.difficulty_level || 'medium',
    passing_marks: exam?.passing_marks || 0,
    duration_minutes: exam?.duration_minutes || 60,
  })
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfError, setPdfError] = useState('')
  const [loading, setLoading] = useState(false)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (formData.grade_id) {
      loadSections()
    }
  }, [formData.grade_id])

  const loadData = async () => {
    try {
      const [subjectsData, gradesData, semestersData] = await Promise.all([
        subjectsAPI.getAll(),
        gradesAPI.getAll(),
        semestersAPI.getAll(),
      ])
      setSubjects(subjectsData)
      setGrades(gradesData)
      setSemesters(semestersData)
      if (gradesData.length > 0 && !formData.grade_id) {
        setFormData(prev => ({ ...prev, grade_id: gradesData[0].id }))
      }
      if (semestersData.length > 0 && !formData.semester_id) {
        setFormData(prev => ({ ...prev, semester_id: semestersData[0].id }))
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const loadSections = async () => {
    try {
      const { sectionsAPI } = await import('../services/api')
      const data = await sectionsAPI.getByGrade(formData.grade_id)
      setSections(data)
      if (data.length > 0 && !formData.section_id) {
        setFormData(prev => ({ ...prev, section_id: data[0].id }))
      }
    } catch (error) {
      console.error('Error loading sections:', error)
    }
  }

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setPdfError('')
    if (!file) {
      setPdfFile(null)
      return
    }
    try {
      validatePdfFile(file)
      setPdfFile(file)
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : 'ملف غير صالح')
      setPdfFile(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.subject_id || formData.subject_id === 0) {
      alert('يجب اختيار المادة')
      return
    }
    if (!formData.grade_id || formData.grade_id === 0) {
      alert('يجب اختيار الصف')
      return
    }
    if (!formData.section_id || formData.section_id === 0) {
      alert('يجب اختيار الشعبة')
      return
    }
    if (!formData.semester_id || formData.semester_id === 0) {
      alert('يجب اختيار الفصل الدراسي')
      return
    }
    setLoading(true)

    try {
      const examData: any = {
        ...formData,
        total_marks: 0,
        created_by_admin: admin?.id || null,
        created_by_teacher: null,
        status: 'draft',
        scheduled_at: null,
        published_at: null,
      }

      let examId: number
      if (exam) {
        await examsAPI.update(exam.id, examData)
        examId = exam.id
      } else {
        const created = await examsAPI.create(examData)
        examId = created.id
      }

      if (pdfFile) {
        const { publicUrl, storagePath } = await uploadExamPdf(examId, pdfFile)
        await examsAPI.update(examId, {
          pdf_url: publicUrl,
          pdf_storage_path: storagePath,
          pdf_filename: pdfFile.name,
          pdf_size: pdfFile.size,
        })
      }
      onSuccess()
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'حدث خطأ'
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          عنوان الاختبار <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            المادة <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.subject_id}
            onChange={(e) => setFormData({ ...formData, subject_id: Number(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value={0}>اختر المادة</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الصف <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.grade_id}
            onChange={(e) => setFormData({ ...formData, grade_id: Number(e.target.value), section_id: 0 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value={0}>اختر الصف</option>
            {grades.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الشعبة <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.section_id}
            onChange={(e) => setFormData({ ...formData, section_id: Number(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            required
            disabled={!formData.grade_id}
          >
            <option value={0}>اختر الشعبة</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الفصل <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.semester_id}
            onChange={(e) => setFormData({ ...formData, semester_id: Number(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            required
          >
            {semesters.map((semester) => (
              <option key={semester.id} value={semester.id}>
                {semester.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">الصعوبة</label>
          <select
            value={formData.difficulty_level}
            onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value as any })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="easy">سهل</option>
            <option value="medium">متوسط</option>
            <option value="hard">صعب</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">درجة النجاح</label>
          <input
            type="number"
            value={formData.passing_marks}
            onChange={(e) => setFormData({ ...formData, passing_marks: Number(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            min={0}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">المدة (دقيقة)</label>
          <input
            type="number"
            value={formData.duration_minutes}
            onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            min={1}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ملف PDF للاختبار (اختياري، حد أقصى {FILE_LIMITS.pdfMaxMB} ميجابايت)
        </label>
        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf"
          onChange={handlePdfChange}
          className="hidden"
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => pdfInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 border-2 border-primary-500 text-primary-600 rounded-lg hover:bg-primary-50 font-medium"
          >
            <Upload size={18} />
            {pdfFile ? pdfFile.name : 'اختيار ملف PDF'}
          </button>
          {exam?.pdf_filename && !pdfFile && (
            <span className="text-sm text-gray-500">الملف الحالي: {exam.pdf_filename}</span>
          )}
        </div>
        {pdfError && <p className="mt-1 text-sm text-red-600">{pdfError}</p>}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onSuccess}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'جاري الحفظ...' : exam ? 'تحديث' : 'إضافة'}
        </button>
      </div>
    </form>
  )
}
