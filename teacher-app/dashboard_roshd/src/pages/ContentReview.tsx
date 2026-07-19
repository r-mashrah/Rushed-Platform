import { useState, useEffect } from 'react'
import { pendingContentAPI } from '../services/apiQuestions'
import { useAuthStore } from '../store/authStore'
import Table from '../components/Table'
import Modal from '../components/Modal'
import { Check, X, AlertCircle } from 'lucide-react'
import type { PendingContent } from '../types'

export default function ContentReview() {
  const { admin } = useAuthStore()
  const [pendingQuestions, setPendingQuestions] = useState<PendingContent[]>([])
  const [pendingExams, setPendingExams] = useState<PendingContent[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'questions' | 'exams'>('questions')
  const [rejectModal, setRejectModal] = useState<{ open: boolean; content: PendingContent | null }>({
    open: false,
    content: null,
  })
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    loadPendingContent()
  }, [])

  const loadPendingContent = async () => {
    try {
      setLoading(true)
      const [questions, exams] = await Promise.all([
        pendingContentAPI.getPendingQuestions(),
        pendingContentAPI.getPendingExams(),
      ])
      setPendingQuestions(questions)
      setPendingExams(exams)
    } catch (error) {
      console.error('Error loading pending content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (content: PendingContent) => {
    if (!admin) return
    if (!confirm('هل تريد قبول هذا المحتوى وإضافته للنظام؟')) return

    try {
      await pendingContentAPI.approve(content.id, admin.id)
      alert('تم قبول المحتوى بنجاح')
      loadPendingContent()
    } catch (error: any) {
      alert(error.message || 'حدث خطأ أثناء قبول المحتوى')
    }
  }

  const handleReject = async () => {
    if (!admin || !rejectModal.content) return
    if (!rejectionReason.trim()) {
      alert('سبب الرفض إلزامي')
      return
    }

    try {
      await pendingContentAPI.reject(rejectModal.content.id, rejectionReason, admin.id)
      alert('تم رفض المحتوى')
      setRejectModal({ open: false, content: null })
      setRejectionReason('')
      loadPendingContent()
    } catch (error: any) {
      alert(error.message || 'حدث خطأ أثناء رفض المحتوى')
    }
  }

  const questionColumns = [
    {
      key: 'question_text',
      label: 'نص السؤال',
      render: (pc: PendingContent) => {
        const text = pc.content_data?.question_text || '—'
        return text.length > 50 ? text.substring(0, 50) + '...' : text
      },
    },
    {
      key: 'question_type',
      label: 'نوع السؤال',
      render: (pc: PendingContent) => {
        const type = pc.content_data?.question_type || '—'
        const labels: Record<string, string> = {
          multiple_choice: 'اختيار من متعدد',
          true_false: 'صح وخطأ',
          essay: 'مقالي',
          fill_blank: 'فراغات',
        }
        return labels[type] || type
      },
    },
    {
      key: 'difficulty',
      label: 'الصعوبة',
      render: (pc: PendingContent) => {
        const diff = pc.content_data?.difficulty_level || '—'
        const labels: Record<string, string> = {
          easy: 'سهل',
          medium: 'متوسط',
          hard: 'صعب',
        }
        return labels[diff] || diff
      },
    },
    {
      key: 'teacher',
      label: 'المعلم',
      render: (pc: PendingContent) => `المعلم #${pc.teacher_id}`,
    },
    {
      key: 'submitted_at',
      label: 'تاريخ الإرسال',
      render: (pc: PendingContent) =>
        pc.submitted_at ? new Date(pc.submitted_at).toLocaleDateString('ar-SA') : '—',
    },
  ]

  const examColumns = [
    {
      key: 'title',
      label: 'عنوان الاختبار',
      render: (pc: PendingContent) => pc.content_data?.title || '—',
    },
    {
      key: 'subject',
      label: 'المادة',
      render: (pc: PendingContent) => `المادة #${pc.content_data?.subject_id || '—'}`,
    },
    {
      key: 'questions_count',
      label: 'عدد الأسئلة',
      render: (pc: PendingContent) => {
        const questions = pc.content_data?.questions || []
        return Array.isArray(questions) ? questions.length : 0
      },
    },
    {
      key: 'teacher',
      label: 'المعلم',
      render: (pc: PendingContent) => `المعلم #${pc.teacher_id}`,
    },
    {
      key: 'submitted_at',
      label: 'تاريخ الإرسال',
      render: (pc: PendingContent) =>
        pc.submitted_at ? new Date(pc.submitted_at).toLocaleDateString('ar-SA') : '—',
    },
  ]

  return (
    <div className="space-y-6 w-full">
      <div className="mb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent mb-2">
          مراجعة المحتوى
        </h1>
        <p className="text-gray-600 text-lg">مراجعة الأسئلة والاختبارات المعلقة</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('questions')}
              className={`
                px-6 py-4 text-sm font-medium border-b-2 transition-colors
                ${activeTab === 'questions'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              الأسئلة المعلقة ({pendingQuestions.length})
            </button>
            <button
              onClick={() => setActiveTab('exams')}
              className={`
                px-6 py-4 text-sm font-medium border-b-2 transition-colors
                ${activeTab === 'exams'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              الاختبارات المعلقة ({pendingExams.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'questions' ? (
            <Table
              columns={questionColumns}
              data={pendingQuestions}
              loading={loading}
              actions={(content) => (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(content)}
                    className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 text-sm font-semibold"
                  >
                    <Check size={16} />
                    <span>قبول</span>
                  </button>
                  <button
                    onClick={() => setRejectModal({ open: true, content })}
                    className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 text-sm font-semibold"
                  >
                    <X size={16} />
                    <span>رفض</span>
                  </button>
                </div>
              )}
            />
          ) : (
            <Table
              columns={examColumns}
              data={pendingExams}
              loading={loading}
              actions={(content) => (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(content)}
                    className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 text-sm font-semibold"
                  >
                    <Check size={16} />
                    <span>قبول</span>
                  </button>
                  <button
                    onClick={() => setRejectModal({ open: true, content })}
                    className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 text-sm font-semibold"
                  >
                    <X size={16} />
                    <span>رفض</span>
                  </button>
                </div>
              )}
            />
          )}
        </div>
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModal.open}
        onClose={() => {
          setRejectModal({ open: false, content: null })
          setRejectionReason('')
        }}
        title="رفض المحتوى"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
            <AlertCircle className="text-yellow-600" size={24} />
            <p className="text-yellow-800 text-sm">
              سبب الرفض إلزامي. سيتم إرسال السبب للمعلم.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              سبب الرفض <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              rows={4}
              placeholder="اكتب سبب رفض المحتوى..."
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setRejectModal({ open: false, content: null })
                setRejectionReason('')
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              onClick={handleReject}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              إرسال الرفض
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
