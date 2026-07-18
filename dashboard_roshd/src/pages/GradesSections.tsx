// import { useState, useEffect } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
// import { gradesAPI, sectionsAPI, sectionSubjectsAPI, subjectsAPI, teachersAPI } from '../services/api'
// import Modal from '../components/Modal'
// import { Plus, Trash2, ArrowRight, Users, BookOpen, GraduationCap } from 'lucide-react'
// import type { Section, SectionSubject } from '../types'

// export default function GradesSections() {
//   const { gradeId } = useParams()
//   const navigate = useNavigate()
//   const [grade, setGrade] = useState<any>(null)
//   const [sections, setSections] = useState<Section[]>([])
//   const [loading, setLoading] = useState(true)
//   const [activeTab, setActiveTab] = useState<'sections' | 'subjects'>('sections')
//   const [activeSemester, setActiveSemester] = useState<number>(1)
//   const [sectionModalOpen, setSectionModalOpen] = useState(false)
//   const [subjectModalOpen, setSubjectModalOpen] = useState(false)
//   const [deleteSectionConfirm, setDeleteSectionConfirm] = useState<Section | null>(null)

//   useEffect(() => {
//     if (gradeId) {
//       loadData()
//     } else {
//       loadGrades()
//     }
//   }, [gradeId, activeSemester])

//   const loadGrades = async () => {
//     try {
//       const data = await gradesAPI.getAll()
//       setGrade({ sections: data })
//     } catch (error) {
//       console.error('Error loading grades:', error)
//     }
//   }

//   const loadData = async () => {
//     if (!gradeId) return
//     try {
//       setLoading(true)
//       const [gradeData, sectionsData] = await Promise.all([
//         gradesAPI.getById(Number(gradeId)),
//         sectionsAPI.getByGrade(Number(gradeId)),
//       ])
//       setGrade(gradeData)
//       setSections(sectionsData)
//     } catch (error) {
//       console.error('Error loading data:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleAddSection = async (name: string) => {
//     if (!gradeId) return
//     try {
//       await sectionsAPI.create({
//         name,
//         grade_id: Number(gradeId),
//         capacity: null,
//         is_active: true,
//       })
//       loadData()
//     } catch (error: any) {
//       alert(error.message || 'حدث خطأ')
//     }
//   }

//   const handleDeleteSection = async (section: Section) => {
//     try {
//       await sectionsAPI.delete(section.id)
//       loadData()
//       setDeleteSectionConfirm(null)
//     } catch (error: any) {
//       alert(error.message || 'حدث خطأ')
//     }
//   }

//   // If no gradeId, show grades list
//   if (!gradeId) {
//     return <GradesList navigate={navigate} />
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6 w-full">
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center gap-3">
//           <button
//             onClick={() => navigate('/grades-sections')}
//             className="text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
//           >
//             <ArrowRight size={24} />
//           </button>
//           <div>
//             <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent mb-2">
//               {grade?.name} — إدارة الشعب والمواد
//             </h1>
//             <p className="text-gray-600 text-lg">إدارة الشعب والمواد الدراسية</p>
//           </div>
//         </div>
//       </div>

//       {/* Semester Tabs */}
//       <div className="bg-white rounded-xl shadow-lg border border-gray-100">
//         <div className="border-b border-gray-200">
//           <nav className="flex -mb-px">
//             <button
//               onClick={() => setActiveSemester(1)}
//               className={`
//                 px-6 py-4 text-sm font-medium border-b-2 transition-colors
//                 ${activeSemester === 1
//                   ? 'border-primary-500 text-primary-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700'
//                 }
//               `}
//             >
//               الفصل الأول
//             </button>
//             <button
//               onClick={() => setActiveSemester(2)}
//               className={`
//                 px-6 py-4 text-sm font-medium border-b-2 transition-colors
//                 ${activeSemester === 2
//                   ? 'border-primary-500 text-primary-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700'
//                 }
//               `}
//             >
//               الفصل الثاني
//             </button>
//           </nav>
//         </div>

//         <div className="p-6">
//           {/* Content Tabs */}
//           <div className="mb-6 border-b border-gray-200">
//             <nav className="flex -mb-px">
//               <button
//                 onClick={() => setActiveTab('sections')}
//                 className={`
//                   px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2
//                   ${activeTab === 'sections'
//                     ? 'border-primary-500 text-primary-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700'
//                   }
//                 `}
//               >
//                 <Users size={18} />
//                 <span>الشعب</span>
//               </button>
//               <button
//                 onClick={() => setActiveTab('subjects')}
//                 className={`
//                   px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2
//                   ${activeTab === 'subjects'
//                     ? 'border-primary-500 text-primary-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700'
//                   }
//                 `}
//               >
//                 <BookOpen size={18} />
//                 <span>المواد</span>
//               </button>
//             </nav>
//           </div>

//           {activeTab === 'sections' ? (
//             <SectionsTab
//               sections={sections}
//               onAdd={() => setSectionModalOpen(true)}
//               onDelete={setDeleteSectionConfirm}
//             />
//           ) : (
//             <SubjectsTab
//               gradeId={Number(gradeId)}
//               semesterId={activeSemester}
//               onAdd={() => setSubjectModalOpen(true)}
//             />
//           )}
//         </div>
//       </div>

//       {/* Add Section Modal */}
//       <Modal
//         isOpen={sectionModalOpen}
//         onClose={() => setSectionModalOpen(false)}
//         title="إضافة شعبة"
//         size="sm"
//       >
//         <SectionForm
//           onSuccess={(name) => {
//             handleAddSection(name)
//             setSectionModalOpen(false)
//           }}
//         />
//       </Modal>

//       {/* Delete Section Confirm */}
//       <Modal
//         isOpen={!!deleteSectionConfirm}
//         onClose={() => setDeleteSectionConfirm(null)}
//         title="تأكيد الحذف"
//         size="sm"
//       >
//         <div className="space-y-4">
//           <p className="text-gray-700">
//             هل أنت متأكد من حذف الشعبة <strong>{deleteSectionConfirm?.name}</strong>؟
//           </p>
//           <div className="flex items-center justify-end gap-3">
//             <button
//               onClick={() => setDeleteSectionConfirm(null)}
//               className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//             >
//               إلغاء
//             </button>
//             <button
//               onClick={() => deleteSectionConfirm && handleDeleteSection(deleteSectionConfirm)}
//               className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//             >
//               نعم، احذف
//             </button>
//           </div>
//         </div>
//       </Modal>

//       {/* Add Subject Assignment Modal */}
//       <Modal
//         isOpen={subjectModalOpen}
//         onClose={() => setSubjectModalOpen(false)}
//         title="ربط معلم بمادة"
//         size="md"
//       >
//         <SubjectAssignmentForm
//           gradeId={Number(gradeId)}
//           semesterId={activeSemester}
//           sections={sections}
//           onSuccess={() => {
//             setSubjectModalOpen(false)
//             loadData()
//           }}
//         />
//       </Modal>
//     </div>
//   )
// }

// function GradesList({ navigate }: { navigate: any }) {
//   const [grades, setGrades] = useState<any[]>([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     loadGrades()
//   }, [])

//   const loadGrades = async () => {
//     try {
//       const data = await gradesAPI.getAll()
//       setGrades(data)
//     } catch (error) {
//       console.error('Error loading grades:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6 w-full">
//       <div className="mb-6">
//         <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent mb-2">
//           الصفوف والشعب
//         </h1>
//         <p className="text-gray-600 text-lg">إدارة الصفوف والشعب والمواد</p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {grades.map((grade) => (
//           <GradeCard key={grade.id} grade={grade} navigate={navigate} />
//         ))}
//       </div>
//     </div>
//   )
// }

// function GradeCard({ grade, navigate }: { grade: any; navigate: any }) {
//   const [stats, setStats] = useState({ sections: 0, students: 0 })
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     loadStats()
//   }, [grade.id])

//   const loadStats = async () => {
//     try {
//       const sections = await sectionsAPI.getByGrade(grade.id)
//       let totalStudents = 0
//       for (const section of sections) {
//         const count = await sectionsAPI.getStudentCount(section.id)
//         totalStudents += count
//       }
//       setStats({ sections: sections.length, students: totalStudents })
//     } catch (error) {
//       console.error('Error loading stats:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div
//       onClick={() => navigate(`/grades-sections/${grade.id}`)}
//       className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-primary-400 transform hover:-translate-y-2 overflow-hidden"
//     >
//       {/* Decorative gradient overlay */}
//       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
//       <div className="relative z-10">
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center gap-4">
//             <div className="p-4 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
//               <Users className="text-white" size={32} />
//             </div>
//             <div>
//               <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent mb-1">
//                 {grade.name}
//               </h3>
//               <p className="text-sm text-gray-500">الصف الدراسي</p>
//             </div>
//           </div>
//           <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-primary-100 transition-colors">
//             <ArrowRight className="text-gray-400 group-hover:text-primary-600 transition-colors" size={20} />
//           </div>
//         </div>
        
//         {loading ? (
//           <div className="animate-pulse space-y-3">
//             <div className="h-5 bg-gray-200 rounded-lg w-3/4"></div>
//             <div className="h-5 bg-gray-200 rounded-lg w-1/2"></div>
//           </div>
//         ) : (
//           <div className="grid grid-cols-2 gap-4">
//             <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
//               <div className="flex items-center gap-2 mb-2">
//                 <GraduationCap className="text-blue-600" size={18} />
//                 <span className="text-sm font-medium text-gray-600">الشعب</span>
//               </div>
//               <p className="text-3xl font-bold text-gray-900">{stats.sections}</p>
//             </div>
//             <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
//               <div className="flex items-center gap-2 mb-2">
//                 <Users className="text-purple-600" size={18} />
//                 <span className="text-sm font-medium text-gray-600">الطلاب</span>
//               </div>
//               <p className="text-3xl font-bold text-gray-900">{stats.students}</p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// function SectionsTab({
//   sections,
//   onAdd,
//   onDelete,
// }: {
//   sections: Section[]
//   onAdd: () => void
//   onDelete: (section: Section) => void
// }) {
//   const [studentCounts, setStudentCounts] = useState<Record<number, number>>({})

//   useEffect(() => {
//     loadCounts()
//   }, [sections])

//   const loadCounts = async () => {
//     const counts: Record<number, number> = {}
//     for (const section of sections) {
//       try {
//         const count = await sectionsAPI.getStudentCount(section.id)
//         counts[section.id] = count
//       } catch (error) {
//         counts[section.id] = 0
//       }
//     }
//     setStudentCounts(counts)
//   }

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-end">
//         <button
//           onClick={onAdd}
//           className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
//         >
//           <Plus size={20} />
//           <span>إضافة شعبة</span>
//         </button>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">اسم الشعبة</th>
//               <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">عدد الطلاب</th>
//               <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">الإجراءات</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {sections.map((section) => (
//               <tr key={section.id}>
//                 <td className="px-6 py-4 text-sm font-medium text-gray-900">{section.name}</td>
//                 <td className="px-6 py-4 text-sm text-gray-500">{studentCounts[section.id] || 0}</td>
//                 <td className="px-6 py-4 text-sm">
//                   <button
//                     onClick={() => onDelete(section)}
//                     className="text-red-600 hover:text-red-800"
//                   >
//                     <Trash2 size={18} />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   )
// }

// function SubjectsTab({
//   gradeId,
//   semesterId,
//   onAdd,
// }: {
//   gradeId: number
//   semesterId: number
//   onAdd: () => void
// }) {
//   const [sectionSubjects, setSectionSubjects] = useState<SectionSubject[]>([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     loadSubjects()
//   }, [gradeId, semesterId])

//   const loadSubjects = async () => {
//     try {
//       setLoading(true)
//       const data = await sectionSubjectsAPI.getByGradeAndSemester(gradeId, semesterId)
//       setSectionSubjects(data)
//     } catch (error) {
//       console.error('Error loading subjects:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleUnlink = async (id: number) => {
//     if (!confirm('هل أنت متأكد من إلغاء الربط؟')) return
//     try {
//       await sectionSubjectsAPI.delete(id)
//       loadSubjects()
//     } catch (error: any) {
//       alert(error.message || 'حدث خطأ')
//     }
//   }

//   if (loading) {
//     return <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
//   }

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-end">
//         <button
//           onClick={onAdd}
//           className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
//         >
//           <Plus size={20} />
//           <span>ربط معلم بمادة</span>
//         </button>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">اسم المادة</th>
//               <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">المعلم</th>
//               <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">الإجراءات</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {sectionSubjects.length === 0 ? (
//               <tr>
//                 <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
//                   لا توجد مواد مربوطة
//                 </td>
//               </tr>
//             ) : (
//               sectionSubjects.map((ss) => (
//                 <tr key={ss.id}>
//                   <td className="px-6 py-4 text-sm text-gray-900">{ss.subject_name || `المادة #${ss.subject_id}`}</td>
//                   <td className="px-6 py-4 text-sm text-gray-500">{ss.teacher_name || `المعلم #${ss.teacher_id}`}</td>
//                   <td className="px-6 py-4 text-sm">
//                     <button
//                       onClick={() => handleUnlink(ss.id)}
//                       className="text-red-600 hover:text-red-800"
//                     >
//                       إلغاء الربط
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   )
// }

// function SectionForm({ onSuccess }: { onSuccess: (name: string) => void }) {
//   const [name, setName] = useState('')
//   const [error, setError] = useState('')

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!name.trim()) {
//       setError('اسم الشعبة إلزامي')
//       return
//     }
//     onSuccess(name.trim())
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       {error && (
//         <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
//           {error}
//         </div>
//       )}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           اسم الشعبة <span className="text-red-500">*</span>
//         </label>
//         <input
//           type="text"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
//           placeholder="مثل: شعبة د"
//           required
//         />
//       </div>
//       <div className="flex items-center justify-end gap-3 pt-4">
//         <button
//           type="button"
//           onClick={() => onSuccess('')}
//           className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//         >
//           إلغاء
//         </button>
//         <button
//           type="submit"
//           className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
//         >
//           إضافة
//         </button>
//       </div>
//     </form>
//   )
// }

// function SubjectAssignmentForm({
//   gradeId: _gradeId,
//   semesterId: _semesterId,
//   sections,
//   onSuccess,
// }: {
//   gradeId: number
//   semesterId: number
//   sections: Section[]
//   onSuccess: () => void
// }) {
//   const [subjects, setSubjects] = useState<any[]>([])
//   const [teachers, setTeachers] = useState<any[]>([])
//   const [formData, setFormData] = useState({
//     section_id: sections[0]?.id || 0,
//     subject_id: 0,
//     teacher_id: 0,
//   })
//   const [loading, setLoading] = useState(false)

//   useEffect(() => {
//     loadData()
//   }, [])

//   const loadData = async () => {
//     try {
//       const [subjectsData, teachersData] = await Promise.all([
//         subjectsAPI.getAll(),
//         teachersAPI.getAll(),
//       ])
//       setSubjects(subjectsData)
//       setTeachers(teachersData)
//       if (subjectsData.length > 0) {
//         setFormData(prev => ({ ...prev, subject_id: subjectsData[0].id }))
//       }
//       if (teachersData.length > 0) {
//         setFormData(prev => ({ ...prev, teacher_id: teachersData[0].id }))
//       }
//     } catch (error) {
//       console.error('Error loading data:', error)
//     }
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)

//     try {
//       await sectionSubjectsAPI.create({
//         ...formData,
//         is_active: true,
//       })
//       onSuccess()
//     } catch (error: any) {
//       alert(error.message || 'حدث خطأ')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           الشعبة <span className="text-red-500">*</span>
//         </label>
//         <select
//           value={formData.section_id}
//           onChange={(e) => setFormData({ ...formData, section_id: Number(e.target.value) })}
//           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
//           required
//         >
//           {sections.map((section) => (
//             <option key={section.id} value={section.id}>
//               {section.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           المادة <span className="text-red-500">*</span>
//         </label>
//         <select
//           value={formData.subject_id}
//           onChange={(e) => setFormData({ ...formData, subject_id: Number(e.target.value) })}
//           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
//           required
//         >
//           <option value={0}>اختر المادة</option>
//           {subjects.map((subject) => (
//             <option key={subject.id} value={subject.id}>
//               {subject.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           المعلم <span className="text-red-500">*</span>
//         </label>
//         <select
//           value={formData.teacher_id}
//           onChange={(e) => setFormData({ ...formData, teacher_id: Number(e.target.value) })}
//           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
//           required
//         >
//           <option value={0}>اختر المعلم</option>
//           {teachers.map((teacher) => (
//             <option key={teacher.id} value={teacher.id}>
//               {teacher.full_name}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="flex items-center justify-end gap-3 pt-4">
//         <button
//           type="button"
//           onClick={onSuccess}
//           className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//         >
//           إلغاء
//         </button>
//         <button
//           type="submit"
//           disabled={loading}
//           className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
//         >
//           {loading ? 'جاري الحفظ...' : 'حفظ'}
//         </button>
//       </div>
//     </form>
//   )
// }




// import { useState, useEffect } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
// import { gradesAPI, sectionsAPI, sectionSubjectsAPI, subjectsAPI, teachersAPI } from '../services/api'
// import Modal from '../components/Modal'
// import { Plus, Trash2, ArrowRight, Users, BookOpen, GraduationCap, BookMarked } from 'lucide-react'
// import type { Section, SectionSubject, Subject, Grade } from '../types'

// // ── Semester Configuration ────────────────────────────────────────────────
// const SEMESTER_CONFIG = {
//   first: { label: 'الفصل الأول', color: 'from-blue-500 to-indigo-600', badge: 'bg-blue-50 text-blue-700', icon: '①' },
//   second: { label: 'الفصل الثاني', color: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-50 text-emerald-700', icon: '②' },
//   null: { label: 'الفصلان معاً', color: 'from-gray-400 to-gray-500', badge: 'bg-gray-50 text-gray-600', icon: '∞' },
// } as const

// type SemesterKey = 'first' | 'second' | null

// export default function GradesSections() {
//   const { gradeId } = useParams()
//   const navigate = useNavigate()
//   const [grade, setGrade] = useState<Grade | null>(null)
//   const [sections, setSections] = useState<Section[]>([])
//   const [loading, setLoading] = useState(true)
//   const [activeTab, setActiveTab] = useState<'sections' | 'subjects'>('sections')
//   const [activeSemester, setActiveSemester] = useState<SemesterKey>('first')
//   const [sectionModalOpen, setSectionModalOpen] = useState(false)
//   const [subjectModalOpen, setSubjectModalOpen] = useState(false)
//   const [deleteSectionConfirm, setDeleteSectionConfirm] = useState<Section | null>(null)

//   useEffect(() => {
//     if (gradeId) {
//       loadData()
//     }
//   }, [gradeId, activeSemester])

//   const loadData = async () => {
//     if (!gradeId) return
//     try {
//       setLoading(true)
//       const [gradeData, sectionsData] = await Promise.all([
//         gradesAPI.getById(Number(gradeId)),
//         sectionsAPI.getByGrade(Number(gradeId)),
//       ])
//       setGrade(gradeData)
//       setSections(sectionsData)
//     } catch (error) {
//       console.error('Error loading data:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleAddSection = async (name: string) => {
//     if (!gradeId) return
//     try {
//       await sectionsAPI.create({
//         name,
//         grade_id: Number(gradeId),
//         capacity: null,
//         is_active: true,
//       })
//       loadData()
//     } catch (error: any) {
//       alert(error.message || 'حدث خطأ')
//     }
//   }

//   const handleDeleteSection = async (section: Section) => {
//     try {
//       await sectionsAPI.delete(section.id)
//       loadData()
//       setDeleteSectionConfirm(null)
//     } catch (error: any) {
//       alert(error.message || 'حدث خطأ')
//     }
//   }

//   if (!gradeId) {
//     return <GradesList navigate={navigate} />
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6 w-full">
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center gap-3">
//           <button
//             onClick={() => navigate('/grades-sections')}
//             className="text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
//           >
//             <ArrowRight size={24} />
//           </button>
//           <div>
//             <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent mb-2">
//               {grade?.name} — إدارة الشعب والمواد
//             </h1>
//             <p className="text-gray-600 text-lg">إدارة الشعب والمواد الدراسية</p>
//           </div>
//         </div>
//       </div>

//       {/* ── Semester Tabs ────────────────────────────────────────────────── */}
//       <div className="bg-white rounded-xl shadow-lg border border-gray-100">
//         <div className="border-b border-gray-200">
//           <nav className="flex -mb-px">
//             {(['first', 'second'] as SemesterKey[]).map((sem) => {
//               const cfg = SEMESTER_CONFIG[sem ?? 'null']
//               return (
//                 <button
//                   key={String(sem)}
//                   onClick={() => setActiveSemester(sem)}
//                   className={`
//                     px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2
//                     ${activeSemester === sem
//                       ? 'border-primary-500 text-primary-600 bg-primary-50'
//                       : 'border-transparent text-gray-500 hover:text-gray-700'
//                     }
//                   `}
//                 >
//                   <span className="text-lg">{cfg.icon}</span>
//                   {cfg.label}
//                 </button>
//               )
//             })}
//           </nav>
//         </div>

//         <div className="p-6">
//           {/* Content Tabs */}
//           <div className="mb-6 border-b border-gray-200">
//             <nav className="flex -mb-px">
//               <button
//                 onClick={() => setActiveTab('sections')}
//                 className={`
//                   px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2
//                   ${activeTab === 'sections'
//                     ? 'border-primary-500 text-primary-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700'
//                   }
//                 `}
//               >
//                 <Users size={18} />
//                 <span>الشعب</span>
//               </button>
//               <button
//                 onClick={() => setActiveTab('subjects')}
//                 className={`
//                   px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2
//                   ${activeTab === 'subjects'
//                     ? 'border-primary-500 text-primary-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700'
//                   }
//                 `}
//               >
//                 <BookOpen size={18} />
//                 <span>المواد</span>
//               </button>
//             </nav>
//           </div>

//           {activeTab === 'sections' ? (
//             <SectionsTab
//               sections={sections}
//               onAdd={() => setSectionModalOpen(true)}
//               onDelete={setDeleteSectionConfirm}
//             />
//           ) : (
//             <SubjectsTab
//               gradeId={Number(gradeId)}
//               semesterId={activeSemester}
//               onAdd={() => setSubjectModalOpen(true)}
//             />
//           )}
//         </div>
//       </div>

//       {/* Add Section Modal */}
//       <Modal
//         isOpen={sectionModalOpen}
//         onClose={() => setSectionModalOpen(false)}
//         title="إضافة شعبة"
//         size="sm"
//       >
//         <SectionForm
//           onSuccess={(name) => {
//             handleAddSection(name)
//             setSectionModalOpen(false)
//           }}
//         />
//       </Modal>

//       {/* Delete Section Confirm */}
//       <Modal
//         isOpen={!!deleteSectionConfirm}
//         onClose={() => setDeleteSectionConfirm(null)}
//         title="تأكيد الحذف"
//         size="sm"
//       >
//         <div className="space-y-4">
//           <p className="text-gray-700">
//             هل أنت متأكد من حذف الشعبة <strong>{deleteSectionConfirm?.name}</strong>؟
//           </p>
//           <div className="flex items-center justify-end gap-3">
//             <button
//               onClick={() => setDeleteSectionConfirm(null)}
//               className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//             >
//               إلغاء
//             </button>
//             <button
//               onClick={() => deleteSectionConfirm && handleDeleteSection(deleteSectionConfirm)}
//               className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//             >
//               نعم، احذف
//             </button>
//           </div>
//         </div>
//       </Modal>

//       {/* Add Subject Assignment Modal */}
//       <Modal
//         isOpen={subjectModalOpen}
//         onClose={() => setSubjectModalOpen(false)}
//         title="ربط مادة ومعلم"
//         size="md"
//       >
//         <SubjectAssignmentForm
//           gradeId={Number(gradeId)}
//           semesterId={activeSemester}
//           sections={sections}
//           onSuccess={() => {
//             setSubjectModalOpen(false)
//             loadData()
//           }}
//         />
//       </Modal>
//     </div>
//   )
// }

// function GradesList({ navigate }: { navigate: any }) {
//   const [grades, setGrades] = useState<Grade[]>([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     loadGrades()
//   }, [])

//   const loadGrades = async () => {
//     try {
//       const data = await gradesAPI.getAll()
//       setGrades(data)
//     } catch (error) {
//       console.error('Error loading grades:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6 w-full">
//       <div className="mb-6">
//         <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent mb-2">
//           الصفوف والشعب
//         </h1>
//         <p className="text-gray-600 text-lg">إدارة الصفوف والشعب والمواد</p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {grades.map((grade) => (
//           <GradeCard key={grade.id} grade={grade} navigate={navigate} />
//         ))}
//       </div>
//     </div>
//   )
// }

// function GradeCard({ grade, navigate }: { grade: Grade; navigate: any }) {
//   const [stats, setStats] = useState({ sections: 0, students: 0 })
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     loadStats()
//   }, [grade.id])

//   const loadStats = async () => {
//     try {
//       const sections = await sectionsAPI.getByGrade(grade.id)
//       let totalStudents = 0
//       for (const section of sections) {
//         const count = await sectionsAPI.getStudentCount(section.id)
//         totalStudents += count
//       }
//       setStats({ sections: sections.length, students: totalStudents })
//     } catch (error) {
//       console.error('Error loading stats:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div
//       onClick={() => navigate(`/grades-sections/${grade.id}`)}
//       className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-primary-400 transform hover:-translate-y-2 overflow-hidden"
//     >
//       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

//       <div className="relative z-10">
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center gap-4">
//             <div className="p-4 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
//               <Users className="text-white" size={32} />
//             </div>
//             <div>
//               <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent mb-1">
//                 {grade.name}
//               </h3>
//               <p className="text-sm text-gray-500">الصف الدراسي</p>
//             </div>
//           </div>
//           <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-primary-100 transition-colors">
//             <ArrowRight className="text-gray-400 group-hover:text-primary-600 transition-colors" size={20} />
//           </div>
//         </div>

//         {loading ? (
//           <div className="animate-pulse space-y-3">
//             <div className="h-5 bg-gray-200 rounded-lg w-3/4"></div>
//             <div className="h-5 bg-gray-200 rounded-lg w-1/2"></div>
//           </div>
//         ) : (
//           <div className="grid grid-cols-2 gap-4">
//             <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
//               <div className="flex items-center gap-2 mb-2">
//                 <GraduationCap className="text-blue-600" size={18} />
//                 <span className="text-sm font-medium text-gray-600">الشعب</span>
//               </div>
//               <p className="text-3xl font-bold text-gray-900">{stats.sections}</p>
//             </div>
//             <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
//               <div className="flex items-center gap-2 mb-2">
//                 <Users className="text-purple-600" size={18} />
//                 <span className="text-sm font-medium text-gray-600">الطلاب</span>
//               </div>
//               <p className="text-3xl font-bold text-gray-900">{stats.students}</p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// function SectionsTab({
//   sections,
//   onAdd,
//   onDelete,
// }: {
//   sections: Section[]
//   onAdd: () => void
//   onDelete: (section: Section) => void
// }) {
//   const [studentCounts, setStudentCounts] = useState<Record<number, number>>({})

//   useEffect(() => {
//     loadCounts()
//   }, [sections])

//   const loadCounts = async () => {
//     const counts: Record<number, number> = {}
//     for (const section of sections) {
//       try {
//         const count = await sectionsAPI.getStudentCount(section.id)
//         counts[section.id] = count
//       } catch (error) {
//         counts[section.id] = 0
//       }
//     }
//     setStudentCounts(counts)
//   }

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-end">
//         <button
//           onClick={onAdd}
//           className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
//         >
//           <Plus size={20} />
//           <span>إضافة شعبة</span>
//         </button>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">اسم الشعبة</th>
//               <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">عدد الطلاب</th>
//               <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">الإجراءات</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {sections.map((section) => (
//               <tr key={section.id} className="hover:bg-gray-50 transition-colors">
//                 <td className="px-6 py-4 text-sm font-medium text-gray-900">{section.name}</td>
//                 <td className="px-6 py-4 text-sm text-gray-500">
//                   <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
//                     {studentCounts[section.id] || 0}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4 text-sm">
//                   <button
//                     onClick={() => onDelete(section)}
//                     className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1 rounded transition-all"
//                   >
//                     <Trash2 size={18} />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   )
// }

// function SubjectsTab({
//   gradeId,
//   semesterId,
//   onAdd,
// }: {
//   gradeId: number
//     // semesterId: SemesterKey
//     semesterId: 'first' | 'second' | null  // ← ✅ من المكون الأب
//   onAdd: () => void
// }) {
//   const [sectionSubjects, setSectionSubjects] = useState<SectionSubject[]>([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     loadSubjects()
//   }, [gradeId, semesterId])

//   const loadSubjects = async () => {
//     try {
//       setLoading(true)
//       const data = await sectionSubjectsAPI.getByGradeAndSemester(gradeId, semesterId)
//       setSectionSubjects(data)
//     } catch (error) {
//       console.error('Error loading subjects:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleUnlink = async (id: number) => {
//     if (!confirm('هل أنت متأكد من إلغاء الربط؟')) return
//     try {
//       await sectionSubjectsAPI.delete(id)
//       loadSubjects()
//     } catch (error: any) {
//       alert(error.message || 'حدث خطأ')
//     }
//   }

//   if (loading) {
//     return <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
//   }

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-end">
//         <button
//           onClick={onAdd}
//           className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
//         >
//           <Plus size={20} />
//           <span>ربط مادة</span>
//         </button>
//       </div>

//       {sectionSubjects.length === 0 ? (
//         <div className="text-center py-12 text-gray-500">
//           <BookOpen size={40} className="mx-auto mb-2 opacity-30" />
//           <p className="font-medium">لا توجد مواد مربوطة في هذا الفصل</p>
//         </div>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">المادة</th>
//                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">المعلم</th>
//                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">الشعبة/الصف</th>
//                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">الإجراءات</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {sectionSubjects.map((ss) => (
//                 <tr key={ss.id} className="hover:bg-gray-50 transition-colors">
//                   <td className="px-6 py-4 text-sm font-medium text-gray-900">
//                     {(ss as any).subject_name || `المادة #${ss.subject_id}`}
//                   </td>
//                   <td className="px-6 py-4 text-sm text-gray-600">
//                     {(ss as any).teacher_name || `المعلم #${ss.teacher_id}`}
//                   </td>
//                   <td className="px-6 py-4 text-sm text-gray-600">
//                     {(ss as any).section_name || `الشعبة #${ss.section_id}`}
//                   </td>
//                   <td className="px-6 py-4 text-sm">
//                     <button
//                       onClick={() => handleUnlink(ss.id)}
//                       className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1 rounded transition-all"
//                     >
//                       إلغاء الربط
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   )
// }

// function SectionForm({ onSuccess }: { onSuccess: (name: string) => void }) {
//   const [name, setName] = useState('')
//   const [error, setError] = useState('')

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!name.trim()) {
//       setError('اسم الشعبة إلزامي')
//       return
//     }
//     onSuccess(name.trim())
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       {error && (
//         <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
//           {error}
//         </div>
//       )}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           اسم الشعبة <span className="text-red-500">*</span>
//         </label>
//         <input
//           type="text"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
//           placeholder="مثل: شعبة د"
//           required
//         />
//       </div>
//       <div className="flex items-center justify-end gap-3 pt-4">
//         <button
//           type="button"
//           onClick={() => onSuccess('')}
//           className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
//         >
//           إلغاء
//         </button>
//         <button
//           type="submit"
//           className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
//         >
//           إضافة
//         </button>
//       </div>
//     </form>
//   )
// }

// function SubjectAssignmentForm({
//   gradeId,
//   semesterId,
//   sections,
//   onSuccess,
// }: {
//   gradeId: number
//   semesterId: SemesterKey
//   sections: Section[]
//   onSuccess: () => void
// }) {
//   const [subjects, setSubjects] = useState<Subject[]>([])
//   const [teachers, setTeachers] = useState<any[]>([])
//   const [formData, setFormData] = useState({
//     section_id: sections[0]?.id || 0,
//     subject_id: 0,
//     teacher_id: 0,
//   })
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')

//   useEffect(() => {
//     loadData()
//   }, [])

//   const loadData = async () => {
//     try {
//       const [subjectsData, teachersData] = await Promise.all([
//         subjectsAPI.getAll(),
//         teachersAPI.getAll(),
//       ])

//       // ✅ فلترة المواد حسب الترم المحدد
//       const filteredSubjects = subjectsData.filter(s => {
//         const subSemester = (s as any).semester as SemesterKey
//         if (semesterId === null) return true // الفصلان معاً
//         return subSemester === semesterId || subSemester === null
//       })

//       setSubjects(filteredSubjects)
//       setTeachers(teachersData)
      
//       if (filteredSubjects.length > 0) {
//         setFormData(prev => ({ ...prev, subject_id: filteredSubjects[0].id }))
//       }
//       if (teachersData.length > 0) {
//         setFormData(prev => ({ ...prev, teacher_id: teachersData[0].id }))
//       }
//     } catch (error) {
//       console.error('Error loading data:', error)
//     }
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError('')
//     setLoading(true)

//     try {
//       await sectionSubjectsAPI.create({
//         ...formData,
//         is_active: true,
//       })
//       onSuccess()
//     } catch (error: any) {
//       if (
//         error.message?.includes('duplicate') ||
//         error.message?.includes('uq_section_subject') ||
//         error.message?.includes('مرتبطة')
//       ) {
//         setError('هذه المادة مربوطة بالفعل في هذه الشعبة')
//       } else {
//         setError(error.message || 'حدث خطأ أثناء الربط')
//       }
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       {error && (
//         <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
//           {error}
//         </div>
//       )}

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           الشعبة <span className="text-red-500">*</span>
//         </label>
//         <select
//           value={formData.section_id}
//           onChange={(e) => setFormData({ ...formData, section_id: Number(e.target.value) })}
//           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
//           required
//         >
//           {sections.map((section) => (
//             <option key={section.id} value={section.id}>
//               {section.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           المادة <span className="text-red-500">*</span>
//         </label>
//         <select
//           value={formData.subject_id}
//           onChange={(e) => setFormData({ ...formData, subject_id: Number(e.target.value) })}
//           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
//           required
//         >
//           <option value={0} disabled>اختر المادة</option>
//           {subjects.length > 0 ? (
//             subjects.map((subject) => (
//               <option key={subject.id} value={subject.id}>
//                 {subject.name} {(subject as any).semester ? `(${(subject as any).semester === 'first' ? 'الأول' : 'الثاني'})` : '(الفصلان)'}
//               </option>
//             ))
//           ) : (
//             <option disabled>لا توجد مواد متاحة لهذا الفصل</option>
//           )}
//         </select>
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           المعلم <span className="text-red-500">*</span>
//         </label>
//         <select
//           value={formData.teacher_id}
//           onChange={(e) => setFormData({ ...formData, teacher_id: Number(e.target.value) })}
//           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
//           required
//         >
//           <option value={0} disabled>اختر المعلم</option>
//           {teachers.map((teacher) => (
//             <option key={teacher.id} value={teacher.id}>
//               {teacher.full_name}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
//         <button
//           type="button"
//           onClick={onSuccess}
//           className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
//         >
//           إلغاء
//         </button>
//         <button
//           type="submit"
//           disabled={loading || subjects.length === 0}
//           className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//         >
//           {loading ? 'جاري...' : 'ربط'}
//         </button>
//       </div>
//     </form>
//   )
// }




















import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { gradesAPI, sectionsAPI, sectionSubjectsAPI, subjectsAPI, teachersAPI } from '../services/api'
import Modal from '../components/Modal'
import { Plus, Trash2, ArrowRight, Users, BookOpen, GraduationCap, BookMarked } from 'lucide-react'
import type { Section, SectionSubject, Subject, Grade } from '../types'

// ── Semester Configuration ────────────────────────────────────────────────
const SEMESTER_CONFIG = {
  first: { label: 'الفصل الأول', color: 'from-blue-500 to-indigo-600', badge: 'bg-blue-50 text-blue-700', icon: '①' },
  second: { label: 'الفصل الثاني', color: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-50 text-emerald-700', icon: '②' },
  null: { label: 'الفصلان معاً', color: 'from-gray-400 to-gray-500', badge: 'bg-gray-50 text-gray-600', icon: '∞' },
} as const

type SemesterKey = 'first' | 'second' | null

export default function GradesSections() {
  const { gradeId } = useParams()
  const navigate = useNavigate()
  const [grade, setGrade] = useState<Grade | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'sections' | 'subjects'>('sections')
  const [activeSemester, setActiveSemester] = useState<SemesterKey>('first')
  const [sectionModalOpen, setSectionModalOpen] = useState(false)
  const [subjectModalOpen, setSubjectModalOpen] = useState(false)
  const [deleteSectionConfirm, setDeleteSectionConfirm] = useState<Section | null>(null)

  useEffect(() => {
    if (gradeId) {
      loadData()
    }
  }, [gradeId, activeSemester])

  const loadData = async () => {
    if (!gradeId) return
    try {
      setLoading(true)
      const [gradeData, sectionsData] = await Promise.all([
        gradesAPI.getById(Number(gradeId)),
        sectionsAPI.getByGrade(Number(gradeId)),
      ])
      setGrade(gradeData)
      setSections(sectionsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSection = async (name: string) => {
    if (!gradeId) return
    try {
      await sectionsAPI.create({
        name,
        grade_id: Number(gradeId),
        capacity: null,
        is_active: true,
      })
      loadData()
    } catch (error: any) {
      alert(error.message || 'حدث خطأ')
    }
  }

  const handleDeleteSection = async (section: Section) => {
    try {
      await sectionsAPI.delete(section.id)
      loadData()
      setDeleteSectionConfirm(null)
    } catch (error: any) {
      alert(error.message || 'حدث خطأ')
    }
  }

  if (!gradeId) {
    return <GradesList navigate={navigate} />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/grades-sections')}
            className="text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowRight size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent mb-2">
              {grade?.name} — إدارة الشعب والمواد
            </h1>
            <p className="text-gray-600 text-lg">إدارة الشعب والمواد الدراسية</p>
          </div>
        </div>
      </div>

      {/* ── Semester Tabs ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {(['first', 'second'] as SemesterKey[]).map((sem) => {
              const cfg = SEMESTER_CONFIG[sem ?? 'null']
              return (
                <button
                  key={String(sem)}
                  onClick={() => setActiveSemester(sem)}
                  className={`
                    px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2
                    ${activeSemester === sem
                      ? 'border-primary-500 text-primary-600 bg-primary-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  <span className="text-lg">{cfg.icon}</span>
                  {cfg.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Content Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('sections')}
                className={`
                  px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2
                  ${activeTab === 'sections'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                <Users size={18} />
                <span>الشعب</span>
              </button>
              <button
                onClick={() => setActiveTab('subjects')}
                className={`
                  px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2
                  ${activeTab === 'subjects'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                <BookOpen size={18} />
                <span>المواد</span>
              </button>
            </nav>
          </div>

          {activeTab === 'sections' ? (
            <SectionsTab
              sections={sections}
              onAdd={() => setSectionModalOpen(true)}
              onDelete={setDeleteSectionConfirm}
            />
          ) : (
            <SubjectsTab
              gradeId={Number(gradeId)}
              semesterId={activeSemester}
              onAdd={() => setSubjectModalOpen(true)}
            />
          )}
        </div>
      </div>

      {/* Add Section Modal */}
      <Modal
        isOpen={sectionModalOpen}
        onClose={() => setSectionModalOpen(false)}
        title="إضافة شعبة"
        size="sm"
      >
        <SectionForm
          onSuccess={(name) => {
            handleAddSection(name)
            setSectionModalOpen(false)
          }}
        />
      </Modal>

      {/* Delete Section Confirm */}
      <Modal
        isOpen={!!deleteSectionConfirm}
        onClose={() => setDeleteSectionConfirm(null)}
        title="تأكيد الحذف"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            هل أنت متأكد من حذف الشعبة <strong>{deleteSectionConfirm?.name}</strong>؟
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setDeleteSectionConfirm(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              onClick={() => deleteSectionConfirm && handleDeleteSection(deleteSectionConfirm)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              نعم، احذف
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Subject Assignment Modal */}
      <Modal
        isOpen={subjectModalOpen}
        onClose={() => setSubjectModalOpen(false)}
        title="ربط مادة ومعلم"
        size="md"
      >
        <SubjectAssignmentForm
          gradeId={Number(gradeId)}
          semesterId={activeSemester}
          sections={sections}
          onSuccess={() => {
            setSubjectModalOpen(false)
            loadData()
          }}
        />
      </Modal>
    </div>
  )
}

function GradesList({ navigate }: { navigate: any }) {
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGrades()
  }, [])

  const loadGrades = async () => {
    try {
      const data = await gradesAPI.getAll()
      setGrades(data)
    } catch (error) {
      console.error('Error loading grades:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full">
      <div className="mb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent mb-2">
          الصفوف والشعب
        </h1>
        <p className="text-gray-600 text-lg">إدارة الصفوف والشعب والمواد</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {grades.map((grade) => (
          <GradeCard key={grade.id} grade={grade} navigate={navigate} />
        ))}
      </div>
    </div>
  )
}

function GradeCard({ grade, navigate }: { grade: Grade; navigate: any }) {
  const [stats, setStats] = useState({ sections: 0, students: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [grade.id])

  const loadStats = async () => {
    try {
      const sections = await sectionsAPI.getByGrade(grade.id)
      let totalStudents = 0
      for (const section of sections) {
        const count = await sectionsAPI.getStudentCount(section.id)
        totalStudents += count
      }
      setStats({ sections: sections.length, students: totalStudents })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={() => navigate(`/grades-sections/${grade.id}`)}
      className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-primary-400 transform hover:-translate-y-2 overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Users className="text-white" size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent mb-1">
                {grade.name}
              </h3>
              <p className="text-sm text-gray-500">الصف الدراسي</p>
            </div>
          </div>
          <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-primary-100 transition-colors">
            <ArrowRight className="text-gray-400 group-hover:text-primary-600 transition-colors" size={20} />
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-5 bg-gray-200 rounded-lg w-3/4"></div>
            <div className="h-5 bg-gray-200 rounded-lg w-1/2"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="text-blue-600" size={18} />
                <span className="text-sm font-medium text-gray-600">الشعب</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.sections}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Users className="text-purple-600" size={18} />
                <span className="text-sm font-medium text-gray-600">الطلاب</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.students}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SectionsTab({
  sections,
  onAdd,
  onDelete,
}: {
  sections: Section[]
  onAdd: () => void
  onDelete: (section: Section) => void
}) {
  const [studentCounts, setStudentCounts] = useState<Record<number, number>>({})

  useEffect(() => {
    loadCounts()
  }, [sections])

  const loadCounts = async () => {
    const counts: Record<number, number> = {}
    for (const section of sections) {
      try {
        const count = await sectionsAPI.getStudentCount(section.id)
        counts[section.id] = count
      } catch (error) {
        counts[section.id] = 0
      }
    }
    setStudentCounts(counts)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
        >
          <Plus size={20} />
          <span>إضافة شعبة</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">اسم الشعبة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">عدد الطلاب</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sections.map((section) => (
              <tr key={section.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{section.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    {studentCounts[section.id] || 0}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => onDelete(section)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1 rounded transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SubjectsTab({
  gradeId,
  semesterId,
  onAdd,
}: {
  gradeId: number
    // semesterId: SemesterKey
    semesterId: 'first' | 'second' | null  // ← ✅ من المكون الأب
  onAdd: () => void
}) {
  const [sectionSubjects, setSectionSubjects] = useState<SectionSubject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSubjects()
  }, [gradeId, semesterId])

  const loadSubjects = async () => {
    try {
      setLoading(true)
      const data = await sectionSubjectsAPI.getByGradeAndSemester(gradeId, semesterId)
      setSectionSubjects(data)
    } catch (error) {
      console.error('Error loading subjects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnlink = async (id: number) => {
    if (!confirm('هل أنت متأكد من إلغاء الربط؟')) return
    try {
      await sectionSubjectsAPI.delete(id)
      loadSubjects()
    } catch (error: any) {
      alert(error.message || 'حدث خطأ')
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
        >
          <Plus size={20} />
          <span>ربط مادة</span>
        </button>
      </div>

      {sectionSubjects.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <BookOpen size={40} className="mx-auto mb-2 opacity-30" />
          <p className="font-medium">لا توجد مواد مربوطة في هذا الفصل</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">المادة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">المعلم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">الشعبة/الصف</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sectionSubjects.map((ss) => (
                <tr key={ss.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {(ss as any).subject_name || `المادة #${ss.subject_id}`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {(ss as any).teacher_name || `المعلم #${ss.teacher_id}`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {(ss as any).section_name || `الشعبة #${ss.section_id}`}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleUnlink(ss.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1 rounded transition-all"
                    >
                      إلغاء الربط
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function SectionForm({ onSuccess }: { onSuccess: (name: string) => void }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('اسم الشعبة إلزامي')
      return
    }
    onSuccess(name.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          اسم الشعبة <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          placeholder="مثل: شعبة د"
          required
        />
      </div>
      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => onSuccess('')}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
        >
          إلغاء
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
        >
          إضافة
        </button>
      </div>
    </form>
  )
}

function SubjectAssignmentForm({
  gradeId,
  semesterId,
  sections,
  onSuccess,
}: {
  gradeId: number
  semesterId: SemesterKey
  sections: Section[]
  onSuccess: () => void
}) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [formData, setFormData] = useState({
    section_id: sections[0]?.id || 0,
    subject_id: 0,
    teacher_id: 0,
    semester_id: semesterId === 'first' ? 1 : semesterId === 'second' ? 2 : null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [subjectsData, teachersData] = await Promise.all([
        subjectsAPI.getAll(),
        teachersAPI.getAll(),
      ])

      // ✅ فلترة المواد حسب الترم المحدد
      const filteredSubjects = subjectsData.filter(s => {
        const subSemester = (s as any).semester as SemesterKey
        if (semesterId === null) return true // الفصلان معاً
        return subSemester === semesterId || subSemester === null
      })

      setSubjects(filteredSubjects)
      setTeachers(teachersData)
      
      if (filteredSubjects.length > 0) {
        setFormData(prev => ({ ...prev, subject_id: filteredSubjects[0].id }))
      }
      if (teachersData.length > 0) {
        setFormData(prev => ({ ...prev, teacher_id: teachersData[0].id }))
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await sectionSubjectsAPI.create({
        ...formData,
        is_active: true,
      })
      onSuccess()
    } catch (error: any) {
      if (
        error.message?.includes('duplicate') ||
        error.message?.includes('uq_section_subject') ||
        error.message?.includes('مرتبطة')
      ) {
        setError('هذه المادة مربوطة بالفعل في هذه الشعبة')
      } else {
        setError(error.message || 'حدث خطأ أثناء الربط')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          الشعبة <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.section_id}
          onChange={(e) => setFormData({ ...formData, section_id: Number(e.target.value) })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          required
        >
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          المادة <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.subject_id}
          onChange={(e) => setFormData({ ...formData, subject_id: Number(e.target.value) })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          required
        >
          <option value={0} disabled>اختر المادة</option>
          {subjects.length > 0 ? (
            subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name} {(subject as any).semester ? `(${(subject as any).semester === 'first' ? 'الأول' : 'الثاني'})` : '(الفصلان)'}
              </option>
            ))
          ) : (
            <option disabled>لا توجد مواد متاحة لهذا الفصل</option>
          )}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          المعلم <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.teacher_id}
          onChange={(e) => setFormData({ ...formData, teacher_id: Number(e.target.value) })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          required
        >
          <option value={0} disabled>اختر المعلم</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.full_name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onSuccess}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={loading || subjects.length === 0}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'جاري...' : 'ربط'}
        </button>
      </div>
    </form>
  )
}