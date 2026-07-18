import { useState, useEffect } from 'react'
import { reportsGradesAPI, reportsAPI, parentsAPI } from '../services/apiOthers'
import { gradesAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import Table from '../components/Table'
import Modal from '../components/Modal'
import { Download, Send, Eye } from 'lucide-react'
import * as XLSX from 'xlsx'
import type { Student } from '../types'

export default function ReportsGrades() {
  useAuthStore()
  const [students, setStudents] = useState<Array<{ student: Student; averagePercentage: number }>>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [studentDetails, setStudentDetails] = useState<any>(null)
  const [grades, setGrades] = useState<any[]>([])
  const [gradeFilter, setGradeFilter] = useState<number | undefined>()
  const [loading, setLoading] = useState(true)
  const [_reportModalOpen, setReportModalOpen] = useState(false)

  useEffect(() => {
    loadGrades()
  }, [])

  useEffect(() => {
    loadStudents()
  }, [gradeFilter])

  const loadGrades = async () => {
    try {
      const data = await gradesAPI.getAll()
      setGrades(data)
    } catch (error) {
      console.error('Error loading grades:', error)
    }
  }

  const loadStudents = async () => {
    try {
      setLoading(true)
      const data = await reportsGradesAPI.getAll({ gradeId: gradeFilter })
      setStudents(data)
    } catch (error) {
      console.error('Error loading students:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStudentDetails = async (student: Student) => {
    try {
      const details = await reportsGradesAPI.getStudentDetails(student.id)
      setStudentDetails(details)
      setSelectedStudent(student)
    } catch (error) {
      console.error('Error loading student details:', error)
    }
  }

  const handleExportAll = () => {
    const data = students.map((item) => ({
      'رمز الطالب': item.student.student_code,
      'اسم الطالب': item.student.full_name,
      'متوسط الدرجات': `${item.averagePercentage.toFixed(2)}%`,
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'الدرجات')
    XLSX.writeFile(wb, 'درجات_الطلاب.xlsx')
  }

  const handleExportStudent = () => {
    if (!studentDetails) return

    const data = studentDetails.results.map((r: any) => ({
      'المادة': r.subject?.name || '—',
      'عنوان الاختبار': r.exam?.title || '—',
      'الدرجة المحصلة': r.result.obtained_marks,
      'الدرجة الكاملة': r.result.total_marks,
      'النسبة المئوية': `${r.result.percentage?.toFixed(2) || 0}%`,
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'درجات الطالب')
    XLSX.writeFile(wb, `درجات_${studentDetails.student.full_name}.xlsx`)
  }

  const columns = [
    { key: 'student_code', label: 'رمز الطالب', render: (item: any) => item.student.student_code },
    { key: 'full_name', label: 'اسم الطالب', render: (item: any) => item.student.full_name },
    {
      key: 'average',
      label: 'متوسط الدرجات',
      render: (item: any) => `${item.averagePercentage.toFixed(2)}%`,
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (item: any) => (
        <button
          onClick={() => loadStudentDetails(item.student)}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <Eye size={18} />
          <span>عرض التفاصيل</span>
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent mb-2">
            التقارير والدرجات
          </h1>
          <p className="text-gray-600 text-lg">عرض درجات الطلاب وإرسال التقارير</p>
        </div>
        <button
          onClick={handleExportAll}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
        >
          <Download size={20} />
          <span>تصدير كل الدرجات</span>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <select
          value={gradeFilter || ''}
          onChange={(e) => setGradeFilter(e.target.value ? Number(e.target.value) : undefined)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="">كل الصفوف</option>
          {grades.map((grade) => (
            <option key={grade.id} value={grade.id}>
              {grade.name}
            </option>
          ))}
        </select>
      </div>

      {/* Students Table */}
      <Table columns={columns} data={students} loading={loading} />

      {/* Student Details Modal */}
      {selectedStudent && studentDetails && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => {
            setSelectedStudent(null)
            setStudentDetails(null)
          }}
          title={`درجات ${selectedStudent.full_name}`}
          size="xl"
        >
          <div className="space-y-6">
            {/* Grades Table */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">الدرجات</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">المادة</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">عنوان الاختبار</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">الدرجة المحصلة</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">الدرجة الكاملة</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">النسبة المئوية</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {studentDetails.results.map((r: any, index: number) => {
                      const percentage = r.result.percentage || 0
                      const colorClass =
                        percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                      return (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm">{r.subject?.name || '—'}</td>
                          <td className="px-4 py-3 text-sm">{r.exam?.title || '—'}</td>
                          <td className="px-4 py-3 text-sm">{r.result.obtained_marks}</td>
                          <td className="px-4 py-3 text-sm">{r.result.total_marks}</td>
                          <td className={`px-4 py-3 text-sm font-semibold ${colorClass}`}>
                            {percentage.toFixed(2)}%
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <button
                onClick={handleExportStudent}
                className="mt-4 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
              >
                <Download size={18} />
                <span>تصدير درجات هذا الطالب</span>
              </button>
            </div>

            {/* Send Report */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">إرسال تقرير لولي الأمر</h3>
              <ReportForm
                student={selectedStudent}
                onSuccess={() => {
                  setReportModalOpen(false)
                  loadStudents()
                }}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function ReportForm({ student, onSuccess }: { student: Student; onSuccess: () => void }) {
  const { admin } = useAuthStore()
  const [parents, setParents] = useState<any[]>([])
  const [formData, setFormData] = useState({
    parent_id: 0,
    title: '',
    report_text: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadParents()
  }, [])

  const loadParents = async () => {
    try {
      const data = await parentsAPI.getByStudent(student.id)
      setParents(data)
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, parent_id: data[0].id }))
      }
    } catch (error) {
      console.error('Error loading parents:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!admin) return

    setLoading(true)
    try {
      await reportsAPI.create({
        student_id: student.id,
        parent_id: formData.parent_id,
        title: formData.title,
        report_text: formData.report_text,
        sent_by: admin.id,
      })
      alert('تم إرسال التقرير بنجاح')
      setFormData({ parent_id: parents[0]?.id || 0, title: '', report_text: '' })
      onSuccess()
    } catch (error: any) {
      alert(error.message || 'حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          اختر ولي الأمر <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.parent_id}
          onChange={(e) => setFormData({ ...formData, parent_id: Number(e.target.value) })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          required
        >
          <option value={0}>اختر ولي الأمر</option>
          {parents.map((parent) => (
            <option key={parent.id} value={parent.id}>
              {parent.full_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          عنوان التقرير <span className="text-red-500">*</span>
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          نص التقرير <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.report_text}
          onChange={(e) => setFormData({ ...formData, report_text: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          rows={5}
          required
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          <Send size={18} />
          <span>إرسال التقرير</span>
        </button>
      </div>
    </form>
  )
}
