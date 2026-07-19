
import { useState, useEffect } from 'react'
import { studentsAPI, provisionAPI } from '../services/api'
import { sectionsAPI, gradesAPI } from '../services/api'
import Table from '../components/Table'
import Modal from '../components/Modal'
import { Upload, Search, Edit, FileSpreadsheet, UserPlus, Copy, CheckCircle } from 'lucide-react'
import * as XLSX from 'xlsx'
import type { Student } from '../types'
import { useAuthStore } from '../store/authStore'

export default function Students() {
  const { admin } = useAuthStore()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState<number | undefined>()
  const [grades, setGrades] = useState<any[]>([])
  const [sections, setSections] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Student | null>(null)
  const [excelModalOpen, setExcelModalOpen] = useState(false)
  const [excelData, setExcelData] = useState<any[]>([])
  const [excelErrors, setExcelErrors] = useState<string[]>([])

  // ✅ حالة عرض الرمز بعد الإنشاء
  const [createdStudent, setCreatedStudent] = useState<{
    full_name: string
    student_code: number
    email: string
  } | null>(null)

  useEffect(() => { loadGrades() }, [])
  useEffect(() => { loadStudents() }, [search, gradeFilter])

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
      const data = await studentsAPI.getAll({ search, gradeId: gradeFilter })
      setStudents(data)
    } catch (error) {
      console.error('Error loading students:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (student: Student) => {
    if (!admin) return
    try {
      await studentsAPI.delete(student.id, admin.id)
      loadStudents()
      setDeleteConfirm(null)
    } catch (error: any) {
      alert(error.message || 'حدث خطأ أثناء حذف الطالب')
    }
  }

  const handleExcelImport = async (file: File) => {
    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(sheet)

      const errors: string[] = []
      const validData: any[] = []

      for (let i = 0; i < jsonData.length; i++) {
        const row: any = jsonData[i]
        const rowNum = i + 2

        if (!row['اسم الطالب'] || !row['الصف'] || !row['الشعبة'] || !row['البريد الإلكتروني']) {
          errors.push(`الصف ${rowNum}: بيانات ناقصة (الاسم، الصف، الشعبة، البريد الإلكتروني مطلوبة)`)
          continue
        }

        const grade = grades.find(g => g.name === row['الصف'])
        if (!grade) {
          errors.push(`الصف ${rowNum}: الصف "${row['الصف']}" غير موجود`)
          continue
        }

        const gradeSections = await sectionsAPI.getByGrade(grade.id)
        const section = gradeSections.find(s => s.name === row['الشعبة'])
        if (!section) {
          errors.push(`الصف ${rowNum}: الشعبة "${row['الشعبة']}" غير موجودة`)
          continue
        }

        validData.push({
          full_name:    row['اسم الطالب'],
          email:        row['البريد الإلكتروني'],
          phone_number: row['رقم التلفون'] || null,
          gradeName:    row['الصف'],
          sectionName:  row['الشعبة'],
          sectionId:    section.id,
        })
      }

      setExcelData(validData)
      setExcelErrors(errors)
    } catch (error) {
      alert('حدث خطأ أثناء قراءة ملف Excel')
      console.error(error)
    }
  }

  const handleExcelSubmit = async () => {
    if (!excelData.length) {
      alert('لا توجد بيانات صحيحة للاستيراد')
      return
    }
    try {
      const result = await studentsAPI.importFromExcel(excelData)
      alert(`تم استيراد ${result.success} طالب بنجاح${result.failed > 0 ? `، فشل ${result.failed} طلاب` : ''}`)
      setExcelModalOpen(false)
      setExcelData([])
      setExcelErrors([])
      loadStudents()
    } catch (error: any) {
      alert(error.message || 'حدث خطأ أثناء الاستيراد')
    }
  }

  const columns = [
    { key: 'student_code', label: 'رمز الطالب' },
    { key: 'full_name', label: 'اسم الطالب' },
    { key: 'email', label: 'البريد الإلكتروني' },
    { key: 'phone_number', label: 'رقم التلفون' },
    {
      key: 'section',
      label: 'الصف والشعبة',
      render: (student: Student) => {
        const section = sections.find(s => s.id === student.section_id)
        if (!section) return '—'
        const grade = grades.find(g => g.id === section.grade_id)
        return grade ? (
          <span className="px-3 py-1 bg-gradient-to-r from-primary-100 to-accent-100 text-primary-700 rounded-full text-xs font-medium">
            {grade.name} - {section.name}
          </span>
        ) : section.name
      },
    },
  ]

  useEffect(() => {
    const loadAllSections = async () => {
      const allSections: any[] = []
      for (const grade of grades) {
        const gradeSections = await sectionsAPI.getByGrade(grade.id)
        allSections.push(...gradeSections)
      }
      setSections(allSections)
    }
    if (grades.length > 0) loadAllSections()
  }, [grades])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
            إدارة الطلاب
          </h1>
          <p className="text-gray-600 mt-2 text-lg">عرض وإدارة الطلاب</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setExcelModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold"
          >
            <Upload size={20} />
            <span>استيراد من Excel</span>
          </button>
          <button
            onClick={() => { setEditingStudent(null); setModalOpen(true) }}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold"
          >
            <UserPlus size={20} />
            <span>إضافة طالب</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 flex flex-col md:flex-row items-stretch md:items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="البحث بالاسم أو الرمز..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          />
        </div>
        <select
          value={gradeFilter || ''}
          onChange={(e) => setGradeFilter(e.target.value ? Number(e.target.value) : undefined)}
          className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
        >
          <option value="">كل الصفوف</option>
          {grades.map((grade) => (
            <option key={grade.id} value={grade.id}>{grade.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={students}
        loading={loading}
        actions={(student) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setEditingStudent(student); setModalOpen(true) }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              title="تحديث"
            >
              <Edit size={18} />
            </button>
            {/* <button
              onClick={() => setDeleteConfirm(student)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="حذف"
            >
              <Trash2 size={18} />
            </button> */}
          </div>
        )}
      />

      {/* ✅ Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingStudent(null) }}
        title={editingStudent ? 'تحديث بيانات الطالب' : 'إضافة طالب جديد'}
        size="lg"
      >
        <StudentForm
          student={editingStudent}
          sections={sections}
          grades={grades}
          onSuccess={(result) => {
            if (result) {
              // إظهار الرمز للمدير
              setCreatedStudent(result)
              setModalOpen(false)
            } else {
              setModalOpen(false)
              setEditingStudent(null)
            }
            loadStudents()
          }}
        />
      </Modal>

      {/* ✅ نافذة عرض رمز الطالب بعد الإنشاء */}
      <Modal
        isOpen={!!createdStudent}
        onClose={() => setCreatedStudent(null)}
        title="تم إنشاء الحساب بنجاح ✅"
        size="sm"
      >
        {createdStudent && (
          <StudentCodeDisplay
            fullName={createdStudent.full_name}
            studentCode={createdStudent.student_code}
            email={createdStudent.email}
            onClose={() => setCreatedStudent(null)}
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="تأكيد الحذف"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-red-800 font-medium p-4 bg-red-50 rounded-xl border-2 border-red-200">
            هل أنت متأكد من حذف الطالب <strong>{deleteConfirm?.full_name}</strong>؟
          </p>
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="px-5 py-2.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-all">
              إلغاء
            </button>
            <button
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:shadow-lg font-medium transition-all"
            >
              نعم، احذف
            </button>
          </div>
        </div>
      </Modal>

      {/* Excel Modal */}
      <Modal
        isOpen={excelModalOpen}
        onClose={() => { setExcelModalOpen(false); setExcelData([]); setExcelErrors([]) }}
        title="استيراد الطلاب من Excel"
        size="lg"
      >
        <div className="space-y-4">
          {/* تنبيه بالأعمدة المطلوبة */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
            <p className="font-semibold mb-1">أعمدة Excel المطلوبة:</p>
            <p>اسم الطالب | البريد الإلكتروني | الصف | الشعبة | رقم التلفون (اختياري)</p>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleExcelImport(f) }}
              className="hidden"
              id="excel-file"
            />
            <label htmlFor="excel-file" className="cursor-pointer flex flex-col items-center gap-3">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                <FileSpreadsheet className="text-white" size={32} />
              </div>
              <span className="text-gray-700 font-medium">اضغط لاختيار الملف</span>
              <span className="text-sm text-gray-500">.xlsx أو .xls</span>
            </label>
          </div>

          {excelData.length > 0 && (
            <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
              <p className="text-sm font-semibold text-green-800">
                تم العثور على <strong>{excelData.length}</strong> سجل صحيح
              </p>
            </div>
          )}

          {excelErrors.length > 0 && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-sm font-semibold text-red-800 mb-2">أخطاء:</p>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
                {excelErrors.map((error, index) => <li key={index}>{error}</li>)}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => { setExcelModalOpen(false); setExcelData([]); setExcelErrors([]) }}
              className="px-5 py-2.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-all"
            >
              إلغاء
            </button>
            <button
              onClick={handleExcelSubmit}
              disabled={excelData.length === 0}
              className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
            >
              <FileSpreadsheet size={20} />
              <span>استيراد</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ── StudentForm ────────────────────────────────────────────────
function StudentForm({
  student,
  sections,
  grades,
  onSuccess,
}: {
  student: Student | null
  sections: any[]
  grades: any[]
  onSuccess: (result?: { full_name: string; student_code: number; email: string }) => void
}) {
  const [formData, setFormData] = useState({
    full_name:    student?.full_name    || '',
    email:        student?.email        || '',
    phone_number: student?.phone_number || '',
    section_id:   student?.section_id  || sections[0]?.id || 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (student) {
        // تحديث بيانات طالب موجود (بدون تغيير auth)
        await studentsAPI.update(student.id, {
          full_name:    formData.full_name,
          phone_number: formData.phone_number,
          section_id:   formData.section_id,
        })
        onSuccess()
      } else {
        // ✅ إنشاء طالب جديد مع auth.users
        if (!formData.email) throw new Error('البريد الإلكتروني مطلوب')
        const result = await provisionAPI.createStudent({
          full_name:    formData.full_name,
          email:        formData.email,
          phone_number: formData.phone_number || undefined,
          section_id:   formData.section_id   || undefined,
        })
        onSuccess({
          full_name:    formData.full_name,
          student_code: result.student_code,
          email:        formData.email,
        })
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          اسم الطالب <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          required
        />
      </div>

      {/* ✅ حقل البريد الإلكتروني — مطلوب فقط عند الإضافة */}
      {!student && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            البريد الإلكتروني <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            placeholder="student@school.com"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            سيستخدم الطالب هذا البريد مع رمزه للدخول
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">رقم التلفون</label>
        <input
          type="tel"
          value={formData.phone_number}
          onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          الصف والشعبة <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.section_id}
          onChange={(e) => setFormData({ ...formData, section_id: Number(e.target.value) })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          required
        >
          {grades.map((grade) => {
            const gradeSections = sections.filter(s => s.grade_id === grade.id)
            return (
              <optgroup key={grade.id} label={grade.name}>
                {gradeSections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {grade.name} - {section.name}
                  </option>
                ))}
              </optgroup>
            )
          })}
        </select>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => onSuccess()}
          className="px-5 py-2.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-all"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl hover:shadow-lg font-medium disabled:opacity-50 transition-all"
        >
          {loading ? 'جاري الإنشاء...' : student ? 'تحديث' : 'إضافة'}
        </button>
      </div>
    </form>
  )
}

// ── StudentCodeDisplay — نافذة عرض رمز الطالب ─────────────────
function StudentCodeDisplay({
  fullName,
  studentCode,
  email,
  onClose,
}: {
  fullName: string
  studentCode: number
  email: string
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(studentCode.toString())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
        <CheckCircle className="text-green-600 flex-shrink-0" size={28} />
        <div>
          <p className="font-bold text-green-800">تم إنشاء حساب {fullName} بنجاح!</p>
          <p className="text-sm text-green-700 mt-1">أعطِ الطالب هذا الرمز لتسجيل الدخول</p>
        </div>
      </div>

      <div className="p-5 bg-gray-50 border-2 border-gray-200 rounded-xl text-center space-y-2">
        <p className="text-sm text-gray-600">البريد الإلكتروني</p>
        <p className="font-mono font-bold text-gray-800">{email}</p>
        <p className="text-sm text-gray-600 mt-3">كلمة السر (رمز الطالب)</p>
        <p className="text-4xl font-mono font-bold text-primary-600 tracking-widest">
          {studentCode}
        </p>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-5 py-2.5 border-2 border-primary-500 text-primary-600 rounded-xl hover:bg-primary-50 font-medium transition-all"
        >
          <Copy size={18} />
          {copied ? 'تم النسخ!' : 'نسخ الرمز'}
        </button>
        <button
          onClick={onClose}
          className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl hover:shadow-lg font-medium transition-all"
        >
          حسناً
        </button>
      </div>
    </div>
  )
}
