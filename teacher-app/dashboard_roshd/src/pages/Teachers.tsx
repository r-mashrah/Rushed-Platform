// import { useState, useEffect } from 'react'
// import { teachersAPI, gradesAPI, sectionsAPI, sectionSubjectsAPI, subjectsAPI, provisionAPI } from '../services/api'
// import { useAuthStore } from '../store/authStore'
// import Table from '../components/Table'
// import Modal from '../components/Modal'
// import { Search, Edit, Trash2, AlertCircle, UserPlus, Copy, CheckCircle } from 'lucide-react'
// import type { Teacher, Section, Subject, SectionSubject } from '../types'

// export default function Teachers() {
//   const { admin } = useAuthStore()
//   const [teachers, setTeachers] = useState<Teacher[]>([])
//   const [teacherAssignments, setTeacherAssignments] = useState<Record<number, string[]>>({})
//   const [loading, setLoading] = useState(true)
//   const [search, setSearch] = useState('')
//   const [sortBy, setSortBy] = useState('code')
//   const [page, setPage] = useState(1)
//   const [modalOpen, setModalOpen] = useState(false)
//   const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
//   const [deleteConfirm, setDeleteConfirm] = useState<Teacher | null>(null)
//   const [error, setError] = useState<string | null>(null)

//   // ✅ حالة عرض الرمز بعد الإنشاء
//   const [createdTeacher, setCreatedTeacher] = useState<{
//     full_name: string
//     teacher_code: number
//     email: string
//   } | null>(null)

//   const pageSize = 10

//   useEffect(() => { loadTeachers() }, [search, sortBy, page])

//   const loadTeachers = async () => {
//     try {
//       setLoading(true)
//       setError(null)
//       const [teachersData, gradesData] = await Promise.all([
//         teachersAPI.getAll({ search, sortBy }),
//         gradesAPI.getAll(),
//       ])
//       setTeachers(teachersData ?? [])

//       const assignments: Record<number, string[]> = {}
//       const sectionsByGrade: Section[][] = []
//       const sectionSubjectsByGrade: SectionSubject[][] = []
//       for (const grade of gradesData ?? []) {
//         const [sections, sectionSubjects] = await Promise.all([
//           sectionsAPI.getByGrade(grade.id),
//           sectionSubjectsAPI.getByGradeAndSemester(grade.id),
//         ])
//         sectionsByGrade.push(sections)
//         sectionSubjectsByGrade.push(sectionSubjects)
//       }
//       const subjects = await subjectsAPI.getAll()
//       const sectionIdToName: Record<number, { sectionName: string; gradeName: string }> = {}
//       gradesData?.forEach((grade, i) => {
//         sectionsByGrade[i]?.forEach((sec) => {
//           sectionIdToName[sec.id] = { sectionName: sec.name, gradeName: grade.name }
//         })
//       })
//       const subjectIdToName: Record<number, string> = {}
//       subjects?.forEach((s: Subject) => { subjectIdToName[s.id] = s.name })

//       sectionSubjectsByGrade.forEach((list) => {
//         list.forEach((ss) => {
//           const info = sectionIdToName[ss.section_id]
//           const subjName = subjectIdToName[ss.subject_id] ?? `#${ss.subject_id}`
//           const label = info ? `${subjName} (${info.gradeName} - ${info.sectionName})` : subjName
//           if (!assignments[ss.teacher_id]) assignments[ss.teacher_id] = []
//           assignments[ss.teacher_id].push(label)
//         })
//       })
//       setTeacherAssignments(assignments)
//     } catch (err: unknown) {
//       setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل المعلمين')
//       setTeachers([])
//       setTeacherAssignments({})
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleDelete = async (teacher: Teacher) => {
//     if (!admin) return
//     try {
//       await teachersAPI.delete(teacher.id, admin.id)
//       loadTeachers()
//       setDeleteConfirm(null)
//     } catch (error: any) {
//       alert(error.message || 'حدث خطأ أثناء حذف المعلم')
//     }
//   }

//   const columns = [
//     { key: 'teacher_code', label: 'رمز المعلم' },
//     { key: 'full_name',    label: 'اسم المعلم' },
//     { key: 'email',        label: 'البريد الإلكتروني' },
//     { key: 'phone_number', label: 'رقم التلفون' },
//     {
//       key: 'subjects',
//       label: 'المادة / الصف / الشعبة',
//       render: (t: Teacher) => (
//         <span className="text-gray-700 text-sm">
//           {teacherAssignments[t.id]?.length ? teacherAssignments[t.id].join(' | ') : '—'}
//         </span>
//       ),
//     },
//   ]

//   return (
//     <div className="space-y-6 animate-fade-in">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
//             إدارة المعلمين
//           </h1>
//           <p className="text-gray-600 mt-2 text-lg">عرض وإدارة المعلمين</p>
//         </div>
//         <button
//           onClick={() => { setEditingTeacher(null); setModalOpen(true) }}
//           className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold"
//         >
//           <UserPlus size={20} />
//           <span>إضافة معلم</span>
//         </button>
//       </div>

//       {error && (
//         <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
//           <AlertCircle size={20} />
//           <span>{error}</span>
//         </div>
//       )}

//       {/* Filters */}
//       <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100">
//         <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
//           <div className="flex-1 relative">
//             <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//             <input
//               type="text"
//               placeholder="البحث بالاسم أو الرمز..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
//             />
//           </div>
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//             className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
//           >
//             <option value="code">ترتيب حسب الرمز</option>
//             <option value="name">ترتيب حسب الاسم</option>
//           </select>
//         </div>
//       </div>

//       {/* Table */}
//       <Table
//         columns={columns}
//         data={teachers.slice((page - 1) * pageSize, page * pageSize)}
//         loading={loading}
//         pagination={{ page, pageSize, total: teachers.length, onPageChange: setPage }}
//         actions={(teacher) => (
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => { setEditingTeacher(teacher); setModalOpen(true) }}
//               className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
//               title="تحديث"
//             >
//               <Edit size={18} />
//             </button>
//             <button
//               onClick={() => setDeleteConfirm(teacher)}
//               className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
//               title="حذف"
//             >
//               <Trash2 size={18} />
//             </button>
//           </div>
//         )}
//       />

//       {/* ✅ Add/Edit Modal */}
//       <Modal
//         isOpen={modalOpen}
//         onClose={() => { setModalOpen(false); setEditingTeacher(null); loadTeachers() }}
//         title={editingTeacher ? 'تحديث معلم' : 'إضافة معلم جديد'}
//         size="lg"
//       >
//         <TeacherForm
//           teacher={editingTeacher}
//           onSuccess={(result) => {
//             if (result) {
//               setCreatedTeacher(result)
//               setModalOpen(false)
//             } else {
//               setModalOpen(false)
//               setEditingTeacher(null)
//             }
//             loadTeachers()
//           }}
//           onClose={() => { setModalOpen(false); setEditingTeacher(null); loadTeachers() }}
//         />
//       </Modal>

//       {/* ✅ نافذة عرض رمز المعلم */}
//       <Modal
//         isOpen={!!createdTeacher}
//         onClose={() => setCreatedTeacher(null)}
//         title="تم إنشاء الحساب بنجاح ✅"
//         size="sm"
//       >
//         {createdTeacher && (
//           <TeacherCodeDisplay
//             fullName={createdTeacher.full_name}
//             teacherCode={createdTeacher.teacher_code}
//             email={createdTeacher.email}
//             onClose={() => setCreatedTeacher(null)}
//           />
//         )}
//       </Modal>

//       {/* Delete Confirm */}
//       <Modal
//         isOpen={!!deleteConfirm}
//         onClose={() => setDeleteConfirm(null)}
//         title="تأكيد الحذف"
//         size="sm"
//       >
//         <div className="space-y-4">
//           <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border-2 border-red-200">
//             <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
//             <p className="text-red-800 font-medium">
//               هل أنت متأكد من حذف المعلم <strong>{deleteConfirm?.full_name}</strong>؟
//             </p>
//           </div>
//           <div className="flex items-center justify-end gap-3">
//             <button onClick={() => setDeleteConfirm(null)} className="px-5 py-2.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-all">
//               إلغاء
//             </button>
//             <button
//               onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
//               className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:shadow-lg font-medium transition-all"
//             >
//               نعم، احذف
//             </button>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   )
// }

// // ── TeacherForm ────────────────────────────────────────────────
// function TeacherForm({
//   teacher,
//   onSuccess,
//   onClose,
// }: {
//   teacher: Teacher | null
//   onSuccess: (result?: { full_name: string; teacher_code: number; email: string }) => void
//   onClose: () => void
// }) {
//   const [formData, setFormData] = useState({
//     full_name:    teacher?.full_name    || '',
//     email:        teacher?.email        || '',
//     phone_number: teacher?.phone_number || '',
//   })
//   const [loading, setLoading] = useState(false)
//   const [error, setError]     = useState('')

//   const [grades, setGrades]               = useState<{ id: number; name: string }[]>([])
//   const [sectionsByGrade, setSectionsByGrade] = useState<Record<number, Section[]>>({})
//   const [subjects, setSubjects]           = useState<Subject[]>([])
//   const [assignments, setAssignments]     = useState<Array<{ id: number; sectionName: string; gradeName: string; subjectName: string }>>([])
//   const [assignLoading, setAssignLoading] = useState(false)
//   const [addForm, setAddForm]             = useState({ grade_id: 0, section_id: 0, subject_id: 0 })

//   useEffect(() => { if (teacher) loadAssignments() }, [teacher?.id])

//   useEffect(() => {
//     if (addForm.grade_id && sectionsByGrade[addForm.grade_id]?.length) {
//       const firstId = sectionsByGrade[addForm.grade_id][0].id
//       if (addForm.section_id === 0 || !sectionsByGrade[addForm.grade_id].some((s) => s.id === addForm.section_id)) {
//         setAddForm((prev) => ({ ...prev, section_id: firstId }))
//       }
//     }
//   }, [addForm.grade_id, sectionsByGrade])

//   const loadAssignments = async () => {
//     if (!teacher) return
//     setAssignLoading(true)
//     try {
//       const [gradesData, sectionSubjectsList] = await Promise.all([
//         gradesAPI.getAll(),
//         sectionSubjectsAPI.getByTeacher(teacher.id),
//       ])
//       setGrades(gradesData ?? [])
//       const sectionsMap: Record<number, Section[]> = {}
//       for (const g of gradesData ?? []) {
//         sectionsMap[g.id] = await sectionsAPI.getByGrade(g.id)
//       }
//       setSectionsByGrade(sectionsMap)
//       const subs = await subjectsAPI.getAll()
//       setSubjects(subs ?? [])
//       if (gradesData?.length) {
//         const gId  = gradesData[0].id
//         const secs = sectionsMap[gId] ?? []
//         setAddForm({ grade_id: gId, section_id: secs[0]?.id ?? 0, subject_id: (subs ?? [])[0]?.id ?? 0 })
//       }
//       if (sectionSubjectsList.length) {
//         const sectionIdToGrade: Record<number, { sectionName: string; gradeName: string }> = {}
//         gradesData?.forEach((grade) => {
//           sectionsMap[grade.id]?.forEach((sec) => {
//             sectionIdToGrade[sec.id] = { sectionName: sec.name, gradeName: grade.name }
//           })
//         })
//         setAssignments(sectionSubjectsList.map((ss) => {
//           const info = sectionIdToGrade[ss.section_id]
//           const subj = subs?.find((s) => s.id === ss.subject_id)
//           return { id: ss.id, sectionName: info?.sectionName ?? '—', gradeName: info?.gradeName ?? '—', subjectName: subj?.name ?? '—' }
//         }))
//       } else setAssignments([])
//     } catch (_e) {
//       setAssignments([])
//     } finally {
//       setAssignLoading(false)
//     }
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError('')
//     setLoading(true)
//     try {
//       if (teacher) {
//         // تحديث بيانات معلم موجود
//         await teachersAPI.update(teacher.id, {
//           full_name:    formData.full_name,
//           phone_number: formData.phone_number,
//         })
//         onSuccess()
//       } else {
//         // ✅ إنشاء معلم جديد مع auth.users
//         if (!formData.email) throw new Error('البريد الإلكتروني مطلوب')
//         const result = await provisionAPI.createTeacher({
//           full_name:    formData.full_name,
//           email:        formData.email,
//           phone_number: formData.phone_number,
//         })
//         onSuccess({
//           full_name:    formData.full_name,
//           teacher_code: result.teacher_code,
//           email:        formData.email,
//         })
//       }
//     } catch (err: any) {
//       setError(err.message || 'حدث خطأ')
//     } finally {
//       setLoading(false)
//     }
//   }

//   // const handleAddAssignment = async () => {
//   //   if (!teacher || !addForm.section_id || !addForm.subject_id) return
//   //   setError('')
//   //   try {
//   //     await sectionSubjectsAPI.create({ section_id: addForm.section_id, subject_id: addForm.subject_id, teacher_id: teacher.id, is_active: true })
//   //     loadAssignments()
//   //   } catch (err: any) {
//   //     setError(err.message || 'حدث خطأ عند الربط')
//   //   }
//   // }
// const handleAddAssignment = async () => {
//   if (!teacher || !addForm.section_id || !addForm.subject_id) return
//   setError('')

//   // ✅ تحقق من وجود الربط مسبقاً قبل الإدراج
//   const alreadyExists = assignments.some(
//     (a) =>
//       sections.find(s => s.name === a.sectionName)?.id === addForm.section_id &&
//       subjects.find(s => s.name === a.subjectName)?.id === addForm.subject_id
//   )

//   if (alreadyExists) {
//     setError('هذا المعلم مرتبط بهذه المادة والشعبة بالفعل')
//     return
//   }

//   try {
//     await sectionSubjectsAPI.create({
//       section_id: addForm.section_id,
//       subject_id: addForm.subject_id,
//       teacher_id: teacher.id,
//       is_active:  true,
//     })
//     loadAssignments()
//   } catch (err: any) {
//     if (
//       err.message?.includes('duplicate') ||
//       err.message?.includes('uq_section_subject')
//     ) {
//       setError('هذه المادة في هذه الشعبة مرتبطة بمعلم آخر بالفعل')
//     } else {
//       setError(err.message || 'حدث خطأ عند الربط')
//     }
//   }
// }
//   const handleRemoveAssignment = async (id: number) => {
//     if (!teacher) return
//     try {
//       await sectionSubjectsAPI.delete(id)
//       loadAssignments()
//     } catch (err: any) {
//       setError(err.message || 'حدث خطأ')
//     }
//   }

//   const sections = addForm.grade_id ? sectionsByGrade[addForm.grade_id] ?? [] : []

//   return (
//     <div className="space-y-6">
//       <form onSubmit={handleSubmit} className="space-y-5">
//         {error && (
//           <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm font-medium">
//             {error}
//           </div>
//         )}

//         <div>
//           <label className="block text-sm font-semibold text-gray-700 mb-2">
//             اسم المعلم <span className="text-red-500">*</span>
//           </label>
//           <input
//             type="text"
//             value={formData.full_name}
//             onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
//             className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
//             required
//           />
//         </div>

//         {/* ✅ البريد الإلكتروني — مطلوب عند الإضافة فقط */}
//         {!teacher && (
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               البريد الإلكتروني <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="email"
//               value={formData.email}
//               onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//               className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
//               placeholder="teacher@school.com"
//               required
//             />
//             <p className="mt-1 text-xs text-gray-500">
//               سيستخدم المعلم هذا البريد مع رمزه للدخول
//             </p>
//           </div>
//         )}

//         <div>
//           <label className="block text-sm font-semibold text-gray-700 mb-2">
//             رقم التلفون <span className="text-red-500">*</span>
//           </label>
//           <input
//             type="tel"
//             value={formData.phone_number}
//             onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
//             className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
//             required
//           />
//         </div>

//         <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
//           <button type="button" onClick={onClose} className="px-5 py-2.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-all">
//             إلغاء
//           </button>
//           <button
//             type="submit"
//             disabled={loading}
//             className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl hover:shadow-lg font-medium disabled:opacity-50 transition-all"
//           >
//             {loading ? 'جاري الإنشاء...' : teacher ? 'تحديث' : 'إضافة'}
//           </button>
//         </div>
//       </form>

//       {/* تعيينات المعلم */}
//       {teacher && (
//         <div className="border-t border-gray-200 pt-6">
//           <h3 className="text-lg font-semibold text-gray-800 mb-3">تعيينات المعلم (المادة / الصف / الشعبة)</h3>
//           {assignLoading ? (
//             <p className="text-gray-500 text-sm">جاري التحميل...</p>
//           ) : (
//             <>
//               <div className="flex flex-wrap items-end gap-3 mb-4 p-4 bg-gray-50 rounded-xl">
//                 <div className="min-w-[120px]">
//                   <label className="block text-xs font-medium text-gray-600 mb-1">الصف</label>
//                   <select
//                     value={addForm.grade_id}
//                     onChange={(e) => setAddForm({ ...addForm, grade_id: Number(e.target.value), section_id: 0 })}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//                   >
//                     {grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
//                   </select>
//                 </div>
//                 <div className="min-w-[120px]">
//                   <label className="block text-xs font-medium text-gray-600 mb-1">الشعبة</label>
//                   <select
//                     value={addForm.section_id}
//                     onChange={(e) => setAddForm({ ...addForm, section_id: Number(e.target.value) })}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//                   >
//                     {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
//                   </select>
//                 </div>
//                 <div className="min-w-[140px]">
//                   <label className="block text-xs font-medium text-gray-600 mb-1">المادة</label>
//                   <select
//                     value={addForm.subject_id}
//                     onChange={(e) => setAddForm({ ...addForm, subject_id: Number(e.target.value) })}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//                   >
//                     {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
//                   </select>
//                 </div>
//                 <button
//                   type="button"
//                   onClick={handleAddAssignment}
//                   className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
//                 >
//                   ربط
//                 </button>
//               </div>
//               <ul className="space-y-2 max-h-48 overflow-y-auto">
//                 {assignments.length === 0 ? (
//                   <li className="text-gray-500 text-sm">لا توجد تعيينات.</li>
//                 ) : (
//                   assignments.map((a) => (
//                     <li key={a.id} className="flex items-center justify-between py-2 px-3 bg-white border border-gray-200 rounded-lg text-sm">
//                       <span>{a.subjectName} — {a.gradeName} — {a.sectionName}</span>
//                       <button type="button" onClick={() => handleRemoveAssignment(a.id)} className="text-red-600 hover:text-red-800 text-xs font-medium">
//                         إلغاء الربط
//                       </button>
//                     </li>
//                   ))
//                 )}
//               </ul>
//             </>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }

// // ── TeacherCodeDisplay — نافذة عرض رمز المعلم ─────────────────
// function TeacherCodeDisplay({
//   fullName,
//   teacherCode,
//   email,
//   onClose,
// }: {
//   fullName: string
//   teacherCode: number
//   email: string
//   onClose: () => void
// }) {
//   const [copied, setCopied] = useState(false)

//   const handleCopy = () => {
//     navigator.clipboard.writeText(teacherCode.toString())
//     setCopied(true)
//     setTimeout(() => setCopied(false), 2000)
//   }

//   return (
//     <div className="space-y-5">
//       <div className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
//         <CheckCircle className="text-green-600 flex-shrink-0" size={28} />
//         <div>
//           <p className="font-bold text-green-800">تم إنشاء حساب {fullName} بنجاح!</p>
//           <p className="text-sm text-green-700 mt-1">أعطِ المعلم هذا الرمز لتسجيل الدخول</p>
//         </div>
//       </div>

//       <div className="p-5 bg-gray-50 border-2 border-gray-200 rounded-xl text-center space-y-2">
//         <p className="text-sm text-gray-600">البريد الإلكتروني</p>
//         <p className="font-mono font-bold text-gray-800">{email}</p>
//         <p className="text-sm text-gray-600 mt-3">كلمة السر (رمز المعلم)</p>
//         <p className="text-4xl font-mono font-bold text-primary-600 tracking-widest">
//           {teacherCode}
//         </p>
//       </div>

//       <div className="flex items-center justify-end gap-3">
//         <button
//           onClick={handleCopy}
//           className="flex items-center gap-2 px-5 py-2.5 border-2 border-primary-500 text-primary-600 rounded-xl hover:bg-primary-50 font-medium transition-all"
//         >
//           <Copy size={18} />
//           {copied ? 'تم النسخ!' : 'نسخ الرمز'}
//         </button>
//         <button
//           onClick={onClose}
//           className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl hover:shadow-lg font-medium transition-all"
//         >
//           حسناً
//         </button>
//       </div>
//     </div>
//   )
// }


import { useState, useEffect } from 'react'
import { teachersAPI, gradesAPI, sectionsAPI, sectionSubjectsAPI, subjectsAPI, provisionAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import Table from '../components/Table'
import Modal from '../components/Modal'
import { Search, Edit, Trash2, AlertCircle, UserPlus, Copy, CheckCircle, BookOpen } from 'lucide-react'
import type { Teacher, Section, Subject, SectionSubject, Grade } from '../types'

// ── Semester Configuration ────────────────────────────────────────────────
const SEMESTER_CONFIG = {
  first: { label: 'الفصل الأول', color: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700', icon: '①' },
  second: { label: 'الفصل الثاني', color: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700', icon: '②' },
  null: { label: 'الفصلان معاً', color: 'bg-gray-50', badge: 'bg-gray-100 text-gray-700', icon: '∞' },
} as const

type SemesterKey = 'first' | 'second' | null

export default function Teachers() {
  const { admin } = useAuthStore()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [teacherAssignments, setTeacherAssignments] = useState<Record<number, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('code')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Teacher | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [createdTeacher, setCreatedTeacher] = useState<{
    full_name: string
    teacher_code: number
    email: string
  } | null>(null)

  const pageSize = 10

  useEffect(() => { loadTeachers() }, [search, sortBy, page])

  const loadTeachers = async () => {
    try {
      setLoading(true)
      setError(null)
      const [teachersData, gradesData] = await Promise.all([
        teachersAPI.getAll({ search, sortBy }),
        gradesAPI.getAll(),
      ])
      setTeachers(teachersData ?? [])

      const assignments: Record<number, string[]> = {}
      const sectionsByGrade: Record<number, Section[]> = {}
      const sectionSubjectsByGrade: Record<number, SectionSubject[]> = {}
      
      for (const grade of gradesData ?? []) {
        const [sections, sectionSubjects] = await Promise.all([
          sectionsAPI.getByGrade(grade.id),
          sectionSubjectsAPI.getByGradeAndSemester(grade.id),
        ])
        sectionsByGrade[grade.id] = sections
        sectionSubjectsByGrade[grade.id] = sectionSubjects
      }
      
      const subjects = await subjectsAPI.getAll()
      
      const sectionIdToName: Record<number, { sectionName: string; gradeName: string }> = {}
      gradesData?.forEach((grade) => {
        sectionsByGrade[grade.id]?.forEach((sec) => {
          sectionIdToName[sec.id] = { sectionName: sec.name, gradeName: grade.name }
        })
      })
      
      const subjectIdToInfo: Record<number, { name: string; semester: SemesterKey }> = {}
      subjects?.forEach((s: Subject) => { 
        subjectIdToInfo[s.id] = { 
          name: s.name, 
          semester: (s as any).semester as SemesterKey 
        } 
      })

      // ✅ بناء التعيينات مع معلومات الترم
      Object.values(sectionSubjectsByGrade).forEach((list) => {
        list.forEach((ss) => {
          const info = sectionIdToName[ss.section_id]
          const subjInfo = subjectIdToInfo[ss.subject_id]
          
          if (info && subjInfo) {
            const semesterLabel = SEMESTER_CONFIG[subjInfo.semester ?? 'null'].icon
            const label = `${subjInfo.name} [${semesterLabel}] (${info.gradeName} - ${info.sectionName})`
            
            if (!assignments[ss.teacher_id]) assignments[ss.teacher_id] = []
            assignments[ss.teacher_id].push(label)
          }
        })
      })
      
      setTeacherAssignments(assignments)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل المعلمين')
      setTeachers([])
      setTeacherAssignments({})
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (teacher: Teacher) => {
    if (!admin) return
    try {
      await teachersAPI.delete(teacher.id, admin.id)
      loadTeachers()
      setDeleteConfirm(null)
    } catch (error: any) {
      alert(error.message || 'حدث خطأ أثناء حذف المعلم')
    }
  }

  const columns = [
    { key: 'teacher_code', label: 'رمز المعلم' },
    { key: 'full_name', label: 'اسم المعلم' },
    { key: 'email', label: 'البريد الإلكتروني' },
    { key: 'phone_number', label: 'رقم التلفون' },
    {
      key: 'subjects',
      label: 'التعيينات (المادة/الترم/الصف/الشعبة)',
      render: (t: Teacher) => (
        <div className="space-y-1">
          {teacherAssignments[t.id]?.length ? (
            teacherAssignments[t.id].map((assignment, idx) => (
              <div key={idx} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                {assignment}
              </div>
            ))
          ) : (
            <span className="text-gray-400 text-xs">—</span>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
            إدارة المعلمين
          </h1>
          <p className="text-gray-600 mt-2 text-lg">عرض وإدارة المعلمين وتعيينهم بالمواد</p>
        </div>
        <button
          onClick={() => { setEditingTeacher(null); setModalOpen(true) }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold"
        >
          <UserPlus size={20} />
          <span>إضافة معلم</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
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
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
          >
            <option value="code">ترتيب حسب الرمز</option>
            <option value="name">ترتيب حسب الاسم</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={teachers.slice((page - 1) * pageSize, page * pageSize)}
        loading={loading}
        pagination={{ page, pageSize, total: teachers.length, onPageChange: setPage }}
        actions={(teacher) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setEditingTeacher(teacher); setModalOpen(true) }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              title="تحديث"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => setDeleteConfirm(teacher)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="حذف"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTeacher(null); loadTeachers() }}
        title={editingTeacher ? 'تحديث معلم' : 'إضافة معلم جديد'}
        size="lg"
      >
        <TeacherForm
          teacher={editingTeacher}
          onSuccess={(result) => {
            if (result) {
              setCreatedTeacher(result)
              setModalOpen(false)
            } else {
              setModalOpen(false)
              setEditingTeacher(null)
            }
            loadTeachers()
          }}
          onClose={() => { setModalOpen(false); setEditingTeacher(null); loadTeachers() }}
        />
      </Modal>

      {/* Teacher Code Display Modal */}
      <Modal
        isOpen={!!createdTeacher}
        onClose={() => setCreatedTeacher(null)}
        title="تم إنشاء الحساب بنجاح ✅"
        size="sm"
      >
        {createdTeacher && (
          <TeacherCodeDisplay
            fullName={createdTeacher.full_name}
            teacherCode={createdTeacher.teacher_code}
            email={createdTeacher.email}
            onClose={() => setCreatedTeacher(null)}
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
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border-2 border-red-200">
            <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
            <p className="text-red-800 font-medium">
              هل أنت متأكد من حذف المعلم <strong>{deleteConfirm?.full_name}</strong>؟
            </p>
          </div>
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
    </div>
  )
}

// ── TeacherForm Component ─────────────────────────────────────────────────
function TeacherForm({
  teacher,
  onSuccess,
  onClose,
}: {
  teacher: Teacher | null
  onSuccess: (result?: { full_name: string; teacher_code: number; email: string }) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    full_name: teacher?.full_name || '',
    email: teacher?.email || '',
    phone_number: teacher?.phone_number || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [grades, setGrades] = useState<Grade[]>([])
  const [sectionsByGrade, setSectionsByGrade] = useState<Record<number, Section[]>>({})
  const [subjects, setSubjects] = useState<Subject[]>([])
  
  // ✅ مواد المعلم مقسمة حسب الترم
  const [subjectsByGrade, setSubjectsByGrade] = useState<Record<number, {
    first: Subject[]
    second: Subject[]
    both: Subject[]
  }>>({})
  
  const [assignments, setAssignments] = useState<Array<{ id: number; sectionName: string; gradeName: string; subjectName: string; semester: SemesterKey }>>([])
  const [assignLoading, setAssignLoading] = useState(false)
  const [addForm, setAddForm] = useState({ grade_id: 0, section_id: 0, subject_id: 0 })

  useEffect(() => { if (teacher) loadAssignments() }, [teacher?.id])

  useEffect(() => {
    if (addForm.grade_id && sectionsByGrade[addForm.grade_id]?.length) {
      const firstId = sectionsByGrade[addForm.grade_id][0].id
      if (addForm.section_id === 0 || !sectionsByGrade[addForm.grade_id].some((s) => s.id === addForm.section_id)) {
        setAddForm((prev) => ({ ...prev, section_id: firstId }))
      }
    }
  }, [addForm.grade_id, sectionsByGrade])

  const loadAssignments = async () => {
    if (!teacher) return
    setAssignLoading(true)
    try {
      const [gradesData, sectionSubjectsList] = await Promise.all([
        gradesAPI.getAll(),
        sectionSubjectsAPI.getByTeacher(teacher.id),
      ])
      setGrades(gradesData ?? [])
      
      const sectionsMap: Record<number, Section[]> = {}
      const subjectsByGradeMap: Record<number, { first: Subject[]; second: Subject[]; both: Subject[] }> = {}
      
      for (const g of gradesData ?? []) {
        const sections = await sectionsAPI.getByGrade(g.id)
        sectionsMap[g.id] = sections

        // ✅ جلب المواد مقسمة حسب الترم
        const allSubjects = await subjectsAPI.getAll()
        const gradeSections = sections.map(s => s.id)
        
        const firstSem = allSubjects.filter(s => {
          const isBound = sectionSubjectsList.some(ss => ss.subject_id === s.id && gradeSections.includes(ss.section_id))
          return (s as any).semester === 'first' || ((s as any).semester === null)
        })
        const secondSem = allSubjects.filter(s => {
          const isBound = sectionSubjectsList.some(ss => ss.subject_id === s.id && gradeSections.includes(ss.section_id))
          return (s as any).semester === 'second' || ((s as any).semester === null)
        })
        const both = allSubjects.filter(s => (s as any).semester === null)

        subjectsByGradeMap[g.id] = {
          first: firstSem,
          second: secondSem,
          both: both
        }
      }
      
      setSectionsByGrade(sectionsMap)
      setSubjectsByGrade(subjectsByGradeMap)
      
      const subs = await subjectsAPI.getAll()
      setSubjects(subs ?? [])
      
      if (gradesData?.length) {
        const gId = gradesData[0].id
        const secs = sectionsMap[gId] ?? []
        setAddForm({ grade_id: gId, section_id: secs[0]?.id ?? 0, subject_id: 0 })
      }

      if (sectionSubjectsList.length) {
        const sectionIdToGrade: Record<number, { sectionName: string; gradeName: string }> = {}
        gradesData?.forEach((grade) => {
          sectionsMap[grade.id]?.forEach((sec) => {
            sectionIdToGrade[sec.id] = { sectionName: sec.name, gradeName: grade.name }
          })
        })
        
        setAssignments(sectionSubjectsList.map((ss) => {
          const info = sectionIdToGrade[ss.section_id]
          const subj = subs?.find((s) => s.id === ss.subject_id)
          const semester = (subj as any)?.semester as SemesterKey
          return { 
            id: ss.id, 
            sectionName: info?.sectionName ?? '—', 
            gradeName: info?.gradeName ?? '—', 
            subjectName: subj?.name ?? '—',
            semester: semester
          }
        }))
      } else setAssignments([])
    } catch (_e) {
      setAssignments([])
    } finally {
      setAssignLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (teacher) {
        await teachersAPI.update(teacher.id, {
          full_name: formData.full_name,
          phone_number: formData.phone_number,
        })
        onSuccess()
      } else {
        if (!formData.email) throw new Error('البريد الإلكتروني مطلوب')
        const result = await provisionAPI.createTeacher({
          full_name: formData.full_name,
          email: formData.email,
          phone_number: formData.phone_number,
        })
        onSuccess({
          full_name: formData.full_name,
          teacher_code: result.teacher_code,
          email: formData.email,
        })
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  const handleAddAssignment = async () => {
    if (!teacher || !addForm.section_id || !addForm.subject_id) return
    setError('')

    const alreadyExists = assignments.some(
      (a) => 
        sectionsAPI &&
        subjects.find(s => s.name === a.subjectName)?.id === addForm.subject_id &&
        sectionsByGrade[addForm.grade_id]?.find(s => s.name === a.sectionName)?.id === addForm.section_id
    )

    if (alreadyExists) {
      setError('هذا المعلم مرتبط بهذه المادة والشعبة بالفعل')
      return
    }

    try {
      await sectionSubjectsAPI.create({
        section_id: addForm.section_id,
        subject_id: addForm.subject_id,
        teacher_id: teacher.id,
        is_active: true,
      })
      loadAssignments()
    } catch (err: any) {
      if (
        err.message?.includes('duplicate') ||
        err.message?.includes('uq_section_subject')
      ) {
        setError('هذه المادة في هذه الشعبة مرتبطة بمعلم آخر بالفعل')
      } else {
        setError(err.message || 'حدث خطأ عند الربط')
      }
    }
  }

  const handleRemoveAssignment = async (id: number) => {
    if (!teacher) return
    try {
      await sectionSubjectsAPI.delete(id)
      loadAssignments()
    } catch (err: any) {
      setError(err.message || 'حدث خطأ')
    }
  }

  const sections = addForm.grade_id ? sectionsByGrade[addForm.grade_id] ?? [] : []
  const groupedSubjects = addForm.grade_id ? subjectsByGrade[addForm.grade_id] : { first: [], second: [], both: [] }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            اسم المعلم <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            required
          />
        </div>

        {!teacher && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              البريد الإلكتروني <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              placeholder="teacher@school.com"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              سيستخدم المعلم هذا البريد مع رمزه للدخول
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            رقم التلفون <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone_number}
            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            required
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button type="button" onClick={onClose} className="px-5 py-2.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-all">
            إلغاء
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl hover:shadow-lg font-medium disabled:opacity-50 transition-all"
          >
            {loading ? 'جاري الإنشاء...' : teacher ? 'تحديث' : 'إضافة'}
          </button>
        </div>
      </form>

      {/* ── تعيينات المعلم ───────��────────────────────────────────────────── */}
      {teacher && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-primary-600" />
            تعيينات المعلم
          </h3>

          {assignLoading ? (
            <p className="text-gray-500 text-sm">جاري التحميل...</p>
          ) : (
            <>
              {/* ── اختيار الصف والشعبة والمادة ──────────────────────────── */}
              <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl border border-primary-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                  {/* الصف */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">الصف</label>
                    <select
                      value={addForm.grade_id}
                      onChange={(e) => setAddForm({ ...addForm, grade_id: Number(e.target.value), section_id: 0, subject_id: 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium"
                    >
                      <option value={0}>اختر الصف</option>
                      {grades.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>

                  {/* الشعبة */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">الشعبة</label>
                    <select
                      value={addForm.section_id}
                      onChange={(e) => setAddForm({ ...addForm, section_id: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium"
                      disabled={!addForm.grade_id}
                    >
                      <option value={0}>اختر الشعبة</option>
                      {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>

                  {/* المادة */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">المادة</label>
                    <select
                      value={addForm.subject_id}
                      onChange={(e) => setAddForm({ ...addForm, subject_id: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium"
                      disabled={!addForm.grade_id}
                    >
                      <option value={0}>اختر المادة</option>
                      
                      {/* ✅ الفصل الأول */}
                      {groupedSubjects?.first?.length > 0 && (
                        <optgroup label={`📘 الفصل الأول (${groupedSubjects.first.length})`}>
                          {groupedSubjects.first.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </optgroup>
                      )}
                      
                      {/* ✅ الفصل الثاني */}
                      {groupedSubjects?.second?.length > 0 && (
                        <optgroup label={`📗 الفصل الثاني (${groupedSubjects.second.length})`}>
                          {groupedSubjects.second.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </optgroup>
                      )}
                      
                      {/* ✅ الفصلان معاً */}
                      {groupedSubjects?.both?.length > 0 && (
                        <optgroup label={`📙 الفصلان معاً (${groupedSubjects.both.length})`}>
                          {groupedSubjects.both.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  {/* زر الربط */}
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleAddAssignment}
                      className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-semibold transition-all"
                    >
                      ربط
                    </button>
                  </div>
                </div>
              </div>

              {/* ── قائمة التعيينات ──────────────────────────────────────── */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {assignments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm font-medium">لا توجد تعيينات حتى الآن</p>
                    <p className="text-xs mt-1">أضف تعيين للمعلم باستخدام النموذج أعلاه</p>
                  </div>
                ) : (
                  assignments.map((a) => {
                    const cfg = SEMESTER_CONFIG[a.semester ?? 'null']
                    return (
                      <div key={a.id} className={`flex items-center justify-between p-3 rounded-lg border-2 border-gray-200 ${cfg.color}`}>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            {a.subjectName}
                            <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${cfg.badge}`}>
                              {cfg.label}
                            </span>
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {a.gradeName} • {a.sectionName}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAssignment(a.id)}
                          className="ml-3 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium transition-all"
                        >
                          إلغاء الربط
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── TeacherCodeDisplay Component ───────────────────────────────────────────
function TeacherCodeDisplay({
  fullName,
  teacherCode,
  email,
  onClose,
}: {
  fullName: string
  teacherCode: number
  email: string
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(teacherCode.toString())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
        <CheckCircle className="text-green-600 flex-shrink-0" size={28} />
        <div>
          <p className="font-bold text-green-800">تم إنشاء حساب {fullName} بنجاح!</p>
          <p className="text-sm text-green-700 mt-1">أعطِ المعلم هذا الرمز لتسجيل الدخول</p>
        </div>
      </div>

      <div className="p-5 bg-gray-50 border-2 border-gray-200 rounded-xl text-center space-y-2">
        <p className="text-sm text-gray-600">البريد الإلكتروني</p>
        <p className="font-mono font-bold text-gray-800">{email}</p>
        <p className="text-sm text-gray-600 mt-3">كلمة السر (رمز المعلم)</p>
        <p className="text-4xl font-mono font-bold text-primary-600 tracking-widest">
          {teacherCode}
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