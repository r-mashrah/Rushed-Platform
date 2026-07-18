
// // import { useState, useEffect, useRef } from 'react'
// // import { subjectsAPI, chaptersAPI } from '../services/api'
// // import Table from '../components/Table'
// // import Modal from '../components/Modal'
// // import { Plus, Edit, Trash2, Upload, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
// // import { uploadSubjectPdf, validatePdfFile, FILE_LIMITS } from '../services/storageService'
// // import type { Subject, Chapter } from '../types'

// // export default function Subjects() {
// //   const [subjects, setSubjects] = useState<Subject[]>([])
// //   const [loading, setLoading] = useState(true)
// //   const [modalOpen, setModalOpen] = useState(false)
// //   const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
// //   const [chaptersModalOpen, setChaptersModalOpen] = useState(false)
// //   const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)

// //   useEffect(() => {
// //     loadSubjects()
// //   }, [])

// //   const loadSubjects = async () => {
// //     try {
// //       setLoading(true)
// //       const data = await subjectsAPI.getAll()
// //       setSubjects(data)
// //     } catch (error) {
// //       console.error('Error loading subjects:', error)
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   const columns = [
// //     { key: 'subject_code', label: 'رمز المادة' },
// //     { key: 'name', label: 'اسم المادة' },
// //     {
// //       key: 'pdf',
// //       label: 'ملف PDF',
// //       render: (subject: Subject) => (subject.pdf_filename || subject.pdf_url) ? (
// //         <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">✓ موجود</span>
// //       ) : (
// //         <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">—</span>
// //       ),
// //     },
// //   ]

// //   return (
// //     <div className="space-y-6 animate-fade-in">
// //       <div className="flex items-center justify-between">
// //         <div>
// //           <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
// //             إدارة المواد
// //           </h1>
// //           <p className="text-gray-600 mt-2 text-lg">عرض وإدارة المواد الدراسية وفصولها</p>
// //         </div>
// //         <button
// //           onClick={() => {
// //             setEditingSubject(null)
// //             setModalOpen(true)
// //           }}
// //           className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold"
// //         >
// //           <Plus size={20} />
// //           <span>إضافة مادة</span>
// //         </button>
// //       </div>

// //       <Table
// //         columns={columns}
// //         data={subjects}
// //         loading={loading}
// //         actions={(subject) => (
// //           <div className="flex items-center gap-2">
// //             <button
// //               onClick={() => {
// //                 setSelectedSubject(subject)
// //                 setChaptersModalOpen(true)
// //               }}
// //               className="flex items-center gap-1 px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all text-xs font-medium border border-indigo-200"
// //               title="إدارة الفصول"
// //             >
// //               <BookOpen size={15} />
// //               فصول
// //             </button>
// //             <button
// //               onClick={() => {
// //                 setEditingSubject(subject)
// //                 setModalOpen(true)
// //               }}
// //               className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
// //             >
// //               <Edit size={18} />
// //             </button>
// //             <button
// //               onClick={async () => {
// //                 if (confirm('هل أنت متأكد من حذف هذه المادة؟')) {
// //                   try {
// //                     await subjectsAPI.delete(subject.id)
// //                     loadSubjects()
// //                   } catch (error: any) {
// //                     alert(error.message || 'حدث خطأ')
// //                   }
// //                 }
// //               }}
// //               className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
// //             >
// //               <Trash2 size={18} />
// //             </button>
// //           </div>
// //         )}
// //       />

// //       {/* Add/Edit Subject Modal */}
// //       <Modal
// //         isOpen={modalOpen}
// //         onClose={() => {
// //           setModalOpen(false)
// //           setEditingSubject(null)
// //         }}
// //         title={editingSubject ? 'تحديث مادة' : 'إضافة مادة'}
// //       >
// //         <SubjectForm
// //           subject={editingSubject}
// //           onSuccess={() => {
// //             setModalOpen(false)
// //             setEditingSubject(null)
// //             loadSubjects()
// //           }}
// //         />
// //       </Modal>

// //       {/* Chapters Management Modal */}
// //       <Modal
// //         isOpen={chaptersModalOpen}
// //         onClose={() => {
// //           setChaptersModalOpen(false)
// //           setSelectedSubject(null)
// //         }}
// //         title={`فصول مادة: ${selectedSubject?.name || ''}`}
// //         size="lg"
// //       >
// //         {selectedSubject && (
// //           <ChaptersManager subjectId={selectedSubject.id} />
// //         )}
// //       </Modal>
// //     </div>
// //   )
// // }

// // // ─── Subject Form ────────────────────────────────────────────────────────────
// // function SubjectForm({ subject, onSuccess }: { subject: Subject | null; onSuccess: () => void }) {
// //   const [formData, setFormData] = useState({ name: subject?.name || '' })
// //   const [pdfFile, setPdfFile] = useState<File | null>(null)
// //   const [pdfError, setPdfError] = useState('')
// //   const [loading, setLoading] = useState(false)
// //   const pdfInputRef = useRef<HTMLInputElement>(null)

// //   const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     const file = e.target.files?.[0]
// //     setPdfError('')
// //     if (!file) { setPdfFile(null); return }
// //     try {
// //       validatePdfFile(file)
// //       setPdfFile(file)
// //     } catch (err) {
// //       setPdfError(err instanceof Error ? err.message : 'ملف غير صالح')
// //       setPdfFile(null)
// //     }
// //   }

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault()
// //     setLoading(true)
// //     try {
// //       if (subject) {
// //         await subjectsAPI.update(subject.id, formData)
// //         if (pdfFile) {
// //           const { publicUrl, storagePath } = await uploadSubjectPdf(subject.id, pdfFile)
// //           await subjectsAPI.update(subject.id, {
// //             pdf_url: publicUrl,
// //             pdf_storage_path: storagePath,
// //             pdf_filename: pdfFile.name,
// //             pdf_size: pdfFile.size,
// //           })
// //         }
// //       } else {
// //         const created = await subjectsAPI.create({
// //           ...formData,
// //           pdf_content: null,
// //           pdf_filename: null,
// //           pdf_size: null,
// //           description: null,
// //           is_active: true,
// //         })
// //         if (pdfFile) {
// //           const { publicUrl, storagePath } = await uploadSubjectPdf(created.id, pdfFile)
// //           await subjectsAPI.update(created.id, {
// //             pdf_url: publicUrl,
// //             pdf_storage_path: storagePath,
// //             pdf_filename: pdfFile.name,
// //             pdf_size: pdfFile.size,
// //           })
// //         }
// //       }
// //       onSuccess()
// //     } catch (error: unknown) {
// //       alert(error instanceof Error ? error.message : 'حدث خطأ')
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   return (
// //     <form onSubmit={handleSubmit} className="space-y-5">
// //       <div>
// //         <label className="block text-sm font-semibold text-gray-700 mb-2">
// //           اسم المادة <span className="text-red-500">*</span>
// //         </label>
// //         <input
// //           type="text"
// //           value={formData.name}
// //           onChange={(e) => setFormData({ ...formData, name: e.target.value })}
// //           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
// //           required
// //         />
// //       </div>

// //       <div>
// //         <label className="block text-sm font-semibold text-gray-700 mb-2">
// //           ملف PDF للمادة (اختياري، حد أقصى {FILE_LIMITS.pdfMaxMB} ميجابايت)
// //         </label>
// //         <input ref={pdfInputRef} type="file" accept="application/pdf" onChange={handlePdfChange} className="hidden" />
// //         <div className="flex items-center gap-3">
// //           <button
// //             type="button"
// //             onClick={() => pdfInputRef.current?.click()}
// //             className="flex items-center gap-2 px-4 py-2 border-2 border-primary-500 text-primary-600 rounded-xl hover:bg-primary-50 font-medium"
// //           >
// //             <Upload size={18} />
// //             {pdfFile ? pdfFile.name : 'اختيار ملف PDF'}
// //           </button>
// //           {subject?.pdf_filename && !pdfFile && (
// //             <span className="text-sm text-gray-500">الملف الحالي: {subject.pdf_filename}</span>
// //           )}
// //         </div>
// //         {pdfError && <p className="mt-1 text-sm text-red-600">{pdfError}</p>}
// //       </div>

// //       <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
// //         <button type="button" onClick={onSuccess} className="px-5 py-2.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-all">
// //           إلغاء
// //         </button>
// //         <button type="submit" disabled={loading} className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl hover:shadow-lg font-medium disabled:opacity-50 transition-all">
// //           {loading ? 'جاري الحفظ...' : subject ? 'تحديث' : 'إضافة'}
// //         </button>
// //       </div>
// //     </form>
// //   )
// // }

// // // ─── Chapters Manager ─────────────────────────────────────────────────────────
// // function ChaptersManager({ subjectId }: { subjectId: number }) {
// //   const [chapters, setChapters] = useState<Chapter[]>([])
// //   const [loading, setLoading] = useState(true)
// //   const [newChapterName, setNewChapterName] = useState('')
// //   const [addingChapter, setAddingChapter] = useState(false)
// //   const [editingId, setEditingId] = useState<number | null>(null)
// //   const [editingName, setEditingName] = useState('')
// //   const [error, setError] = useState('')

// //   useEffect(() => {
// //     loadChapters()
// //   }, [subjectId])

// //   const loadChapters = async () => {
// //     try {
// //       setLoading(true)
// //       const data = await chaptersAPI.getBySubject(subjectId)
// //       setChapters(data)
// //     } catch (err) {
// //       console.error('Error loading chapters:', err)
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   const handleAddChapter = async () => {
// //     if (!newChapterName.trim()) return
// //     setError('')
// //     setAddingChapter(true)
// //     try {
// //       await chaptersAPI.create({
// //         subject_id: subjectId,
// //         name: newChapterName.trim(),
// //         order_index: chapters.length + 1,
// //         is_active: true,
// //       })
// //       setNewChapterName('')
// //       loadChapters()
// //     } catch (err: any) {
// //       setError(err.message || 'حدث خطأ أثناء الإضافة')
// //     } finally {
// //       setAddingChapter(false)
// //     }
// //   }

// //   const handleUpdateChapter = async (id: number) => {
// //     if (!editingName.trim()) return
// //     setError('')
// //     try {
// //       await chaptersAPI.update(id, { name: editingName.trim() })
// //       setEditingId(null)
// //       loadChapters()
// //     } catch (err: any) {
// //       setError(err.message || 'حدث خطأ أثناء التحديث')
// //     }
// //   }

// //   const handleDeleteChapter = async (id: number) => {
// //     if (!confirm('هل أنت متأكد من حذف هذا الفصل؟ سيتأثر كل سؤال مرتبط به.')) return
// //     setError('')
// //     try {
// //       await chaptersAPI.delete(id)
// //       loadChapters()
// //     } catch (err: any) {
// //       setError(err.message || 'حدث خطأ أثناء الحذف')
// //     }
// //   }

// //   const moveChapter = async (index: number, direction: 'up' | 'down') => {
// //     const newChapters = [...chapters]
// //     const swapIndex = direction === 'up' ? index - 1 : index + 1
// //     if (swapIndex < 0 || swapIndex >= newChapters.length) return
// //     ;[newChapters[index], newChapters[swapIndex]] = [newChapters[swapIndex], newChapters[index]]
// //     // Update order_index for both
// //     try {
// //       await chaptersAPI.update(newChapters[index].id, { order_index: index + 1 })
// //       await chaptersAPI.update(newChapters[swapIndex].id, { order_index: swapIndex + 1 })
// //       setChapters(newChapters)
// //     } catch (err: any) {
// //       setError(err.message || 'حدث خطأ')
// //     }
// //   }

// //   if (loading) {
// //     return (
// //       <div className="flex items-center justify-center h-32">
// //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
// //       </div>
// //     )
// //   }

// //   return (
// //     <div className="space-y-5">
// //       {error && (
// //         <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
// //           {error}
// //         </div>
// //       )}

// //       {/* Add new chapter */}
// //       <div className="flex gap-3">
// //         <input
// //           type="text"
// //           value={newChapterName}
// //           onChange={(e) => setNewChapterName(e.target.value)}
// //           onKeyDown={(e) => e.key === 'Enter' && handleAddChapter()}
// //           placeholder="اسم الفصل الجديد..."
// //           className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
// //         />
// //         <button
// //           onClick={handleAddChapter}
// //           disabled={addingChapter || !newChapterName.trim()}
// //           className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl hover:shadow-lg font-medium disabled:opacity-50 transition-all"
// //         >
// //           <Plus size={18} />
// //           {addingChapter ? 'جاري الإضافة...' : 'إضافة'}
// //         </button>
// //       </div>

// //       {/* Chapters list */}
// //       {chapters.length === 0 ? (
// //         <div className="text-center py-12 text-gray-400">
// //           <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
// //           <p className="font-medium">لا توجد فصول لهذه المادة بعد</p>
// //           <p className="text-sm mt-1">أضف فصلاً باستخدام الحقل أعلاه</p>
// //         </div>
// //       ) : (
// //         <div className="space-y-2">
// //           {chapters.map((chapter, index) => (
// //             <div
// //               key={chapter.id}
// //               className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-primary-300 transition-all group"
// //             >
// //               {/* Order controls */}
// //               <div className="flex flex-col gap-0.5">
// //                 <button
// //                   onClick={() => moveChapter(index, 'up')}
// //                   disabled={index === 0}
// //                   className="p-0.5 text-gray-400 hover:text-primary-600 disabled:opacity-20 transition-colors"
// //                 >
// //                   <ChevronUp size={16} />
// //                 </button>
// //                 <button
// //                   onClick={() => moveChapter(index, 'down')}
// //                   disabled={index === chapters.length - 1}
// //                   className="p-0.5 text-gray-400 hover:text-primary-600 disabled:opacity-20 transition-colors"
// //                 >
// //                   <ChevronDown size={16} />
// //                 </button>
// //               </div>

// //               {/* Order number */}
// //               <span className="w-7 h-7 flex items-center justify-center bg-primary-100 text-primary-700 rounded-full text-sm font-bold flex-shrink-0">
// //                 {index + 1}
// //               </span>

// //               {/* Chapter name / edit input */}
// //               {editingId === chapter.id ? (
// //                 <input
// //                   type="text"
// //                   value={editingName}
// //                   onChange={(e) => setEditingName(e.target.value)}
// //                   onKeyDown={(e) => {
// //                     if (e.key === 'Enter') handleUpdateChapter(chapter.id)
// //                     if (e.key === 'Escape') setEditingId(null)
// //                   }}
// //                   autoFocus
// //                   className="flex-1 px-3 py-1.5 border-2 border-primary-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
// //                 />
// //               ) : (
// //                 <span className="flex-1 text-gray-800 font-medium">{chapter.name}</span>
// //               )}

// //               {/* Actions */}
// //               <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
// //                 {editingId === chapter.id ? (
// //                   <>
// //                     <button
// //                       onClick={() => handleUpdateChapter(chapter.id)}
// //                       className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
// //                     >
// //                       حفظ
// //                     </button>
// //                     <button
// //                       onClick={() => setEditingId(null)}
// //                       className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
// //                     >
// //                       إلغاء
// //                     </button>
// //                   </>
// //                 ) : (
// //                   <>
// //                     <button
// //                       onClick={() => { setEditingId(chapter.id); setEditingName(chapter.name) }}
// //                       className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
// //                     >
// //                       <Edit size={15} />
// //                     </button>
// //                     <button
// //                       onClick={() => handleDeleteChapter(chapter.id)}
// //                       className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
// //                     >
// //                       <Trash2 size={15} />
// //                     </button>
// //                   </>
// //                 )}
// //               </div>
// //             </div>
// //           ))}
// //         </div>
// //       )}

// //       <p className="text-xs text-gray-400 text-center pt-2">
// //         {chapters.length} فصل • يمكنك إعادة ترتيبها باستخدام الأسهم
// //       </p>
// //     </div>
// //   )
// // }


// import { useState, useEffect, useRef } from 'react'
// import { subjectsAPI, chaptersAPI } from '../services/api'
// import Table from '../components/Table'
// import Modal from '../components/Modal'
// import { Plus, Edit, Trash2, Upload, BookOpen, ChevronDown, ChevronUp, BookMarked } from 'lucide-react'
// import { uploadSubjectPdf, validatePdfFile, FILE_LIMITS } from '../services/storageService'
// import type { Subject, Chapter } from '../types'

// // ── ثوابت الفصل الدراسي ──────────────────────────────────────────────────────
// const SEMESTER_CONFIG = {
//   first:  { label: 'الفصل الدراسي الأول', color: 'from-blue-500 to-indigo-600',   badge: 'bg-blue-50 text-blue-700 border-blue-200'   },
//   second: { label: 'الفصل الدراسي الثاني', color: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
//   null:   { label: 'الفصلان معاً',          color: 'from-gray-400 to-gray-500',    badge: 'bg-gray-50 text-gray-600 border-gray-200'   },
// } as const

// type SemesterKey = 'first' | 'second' | null

// // ── helper: استخراج قيمة السيمستر ────────────────────────────────────────────
// const getSemester = (subject: Subject): SemesterKey =>
//   ((subject as any).semester as SemesterKey) ?? null

// export default function Subjects() {
//   const [subjects, setSubjects]             = useState<Subject[]>([])
//   const [loading, setLoading]               = useState(true)
//   const [modalOpen, setModalOpen]           = useState(false)
//   const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
//   const [chaptersModalOpen, setChaptersModalOpen] = useState(false)
//   const [selectedSubject, setSelectedSubject]     = useState<Subject | null>(null)

//   useEffect(() => { loadSubjects() }, [])

//   const loadSubjects = async () => {
//     try {
//       setLoading(true)
//       const data = await subjectsAPI.getAll()
//       setSubjects(data)
//     } catch (error) {
//       console.error('Error loading subjects:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   // ── تقسيم المواد حسب الفصل الدراسي ─────────────────────────────────────────
//   const firstSemester  = subjects.filter(s => getSemester(s) === 'first')
//   const secondSemester = subjects.filter(s => getSemester(s) === 'second')
//   const bothSemesters  = subjects.filter(s => getSemester(s) === null)

//   const columns = [
//     { key: 'subject_code', label: 'رمز المادة' },
//     { key: 'name', label: 'اسم المادة' },
//     {
//       key: 'pdf',
//       label: 'ملف PDF',
//       render: (subject: Subject) =>
//         subject.pdf_filename || subject.pdf_url ? (
//           <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">✓ موجود</span>
//         ) : (
//           <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">—</span>
//         ),
//     },
//   ]

//   const renderActions = (subject: Subject) => (
//     <div className="flex items-center gap-2">
//       <button
//         onClick={() => { setSelectedSubject(subject); setChaptersModalOpen(true) }}
//         className="flex items-center gap-1 px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all text-xs font-medium border border-indigo-200"
//         title="إدارة الفصول"
//       >
//         <BookOpen size={15} />
//         فصول
//       </button>
//       <button
//         onClick={() => { setEditingSubject(subject); setModalOpen(true) }}
//         className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
//       >
//         <Edit size={18} />
//       </button>
//       <button
//         onClick={async () => {
//           if (confirm('هل أنت متأكد من حذف هذه المادة؟')) {
//             try {
//               await subjectsAPI.delete(subject.id)
//               loadSubjects()
//             } catch (error: any) {
//               alert(error.message || 'حدث خطأ')
//             }
//           }
//         }}
//         className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
//       >
//         <Trash2 size={18} />
//       </button>
//     </div>
//   )

//   return (
//     <div className="space-y-8 animate-fade-in">

//       {/* ── Header ──────────────────────────────────────────────────────────── */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
//             إدارة المواد
//           </h1>
//           <p className="text-gray-600 mt-2 text-lg">عرض وإدارة المواد الدراسية وفصولها</p>
//         </div>
//         <button
//           onClick={() => { setEditingSubject(null); setModalOpen(true) }}
//           className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold"
//         >
//           <Plus size={20} />
//           <span>إضافة مادة</span>
//         </button>
//       </div>

//       {/* ── Stats summary ────────────────────────────────────────────────────── */}
//       {!loading && (
//         <div className="grid grid-cols-3 gap-4">
//           {(['first', 'second', null] as SemesterKey[]).map((sem) => {
//             const count = sem === 'first' ? firstSemester.length
//                         : sem === 'second' ? secondSemester.length
//                         : bothSemesters.length
//             const cfg = SEMESTER_CONFIG[sem ?? 'null']
//             return (
//               <div key={String(sem)} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm">
//                 <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cfg.color} flex items-center justify-center flex-shrink-0`}>
//                   <BookMarked size={20} className="text-white" />
//                 </div>
//                 <div>
//                   <p className="text-2xl font-bold text-gray-900">{count}</p>
//                   <p className="text-xs text-gray-500 mt-0.5">{cfg.label}</p>
//                 </div>
//               </div>
//             )
//           })}
//         </div>
//       )}

//       {/* ══════════════════════════════════════════════════════════════════════ */}
//       {/* ── الفصل الدراسي الأول ─────────────────────────────────────────── */}
//       {/* ══════════════════════════════════════════════════════════════════════ */}
//       <SemesterSection
//         title="الفصل الدراسي الأول"
//         gradient="from-blue-500 to-indigo-600"
//         subjects={firstSemester}
//         loading={loading}
//         columns={columns}
//         actions={renderActions}
//       />

//       {/* ══════════════════════════════════════════════════════════════════════ */}
//       {/* ── الفصل الدراسي الثاني ────────────────────────────────────────── */}
//       {/* ══════════════════════════════════════════════════════════════════════ */}
//       <SemesterSection
//         title="الفصل الدراسي الثاني"
//         gradient="from-emerald-500 to-teal-600"
//         subjects={secondSemester}
//         loading={loading}
//         columns={columns}
//         actions={renderActions}
//       />

//       {/* ══════════════════════════════════════════════════════════════════════ */}
//       {/* ── مواد الفصلين معاً ───────────────────────────────────────────── */}
//       {/* ══════════════════════════════════════════════════════════════════════ */}
//       {(bothSemesters.length > 0 || loading) && (
//         <SemesterSection
//           title="مواد الفصلين معاً"
//           gradient="from-gray-400 to-gray-500"
//           subjects={bothSemesters}
//           loading={loading}
//           columns={columns}
//           actions={renderActions}
//         />
//       )}

//       {/* ── Modals ──────────────────────────────────────────────────────────── */}
//       <Modal
//         isOpen={modalOpen}
//         onClose={() => { setModalOpen(false); setEditingSubject(null) }}
//         title={editingSubject ? 'تحديث مادة' : 'إضافة مادة'}
//       >
//         <SubjectForm
//           subject={editingSubject}
//           onSuccess={() => { setModalOpen(false); setEditingSubject(null); loadSubjects() }}
//         />
//       </Modal>

//       <Modal
//         isOpen={chaptersModalOpen}
//         onClose={() => { setChaptersModalOpen(false); setSelectedSubject(null) }}
//         title={`فصول مادة: ${selectedSubject?.name || ''}`}
//         size="lg"
//       >
//         {selectedSubject && <ChaptersManager subjectId={selectedSubject.id} />}
//       </Modal>
//     </div>
//   )
// }

// // ─── SemesterSection ─────────────────────────────────────────────────────────
// function SemesterSection({
//   title, gradient, subjects, loading, columns, actions,
// }: {
//   title: string
//   gradient: string
//   subjects: Subject[]
//   loading: boolean
//   columns: any[]
//   actions: (s: Subject) => React.ReactNode
// }) {
//   return (
//     <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
//       {/* Section header */}
//       <div className={`bg-gradient-to-r ${gradient} px-6 py-4 flex items-center justify-between`}>
//         <div className="flex items-center gap-3">
//           <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
//             <BookMarked size={18} className="text-white" />
//           </div>
//           <h2 className="text-white font-bold text-lg">{title}</h2>
//         </div>
//         <span className="bg-white/20 text-white text-sm font-semibold px-3 py-1 rounded-full">
//           {subjects.length} مادة
//         </span>
//       </div>

//       {/* Table */}
//       <div className="p-4">
//         {!loading && subjects.length === 0 ? (
//           <div className="text-center py-10 text-gray-400">
//             <BookOpen size={36} className="mx-auto mb-2 opacity-30" />
//             <p className="text-sm">لا توجد مواد في هذا الفصل بعد</p>
//             <p className="text-xs mt-1 opacity-70">عند إضافة مادة اختر الفصل الدراسي المناسب</p>
//           </div>
//         ) : (
//           <Table columns={columns} data={subjects} loading={loading} actions={actions} />
//         )}
//       </div>
//     </div>
//   )
// }

// // ─── Subject Form ─────────────────────────────────────────────────────────────
// function SubjectForm({ subject, onSuccess }: { subject: Subject | null; onSuccess: () => void }) {
//   const [formData, setFormData] = useState({
//     name:     subject?.name || '',
//     semester: ((subject as any)?.semester as SemesterKey) ?? null,
//   })
//   const [pdfFile, setPdfFile]   = useState<File | null>(null)
//   const [pdfError, setPdfError] = useState('')
//   const [loading, setLoading]   = useState(false)
//   const pdfInputRef = useRef<HTMLInputElement>(null)

//   const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     setPdfError('')
//     if (!file) { setPdfFile(null); return }
//     try {
//       validatePdfFile(file)
//       setPdfFile(file)
//     } catch (err) {
//       setPdfError(err instanceof Error ? err.message : 'ملف غير صالح')
//       setPdfFile(null)
//     }
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)
//     try {
//       const payload = { name: formData.name, semester: formData.semester }
//       if (subject) {
//         await subjectsAPI.update(subject.id, payload)
//         if (pdfFile) {
//           const { publicUrl, storagePath } = await uploadSubjectPdf(subject.id, pdfFile)
//           await subjectsAPI.update(subject.id, {
//             pdf_url: publicUrl, pdf_storage_path: storagePath,
//             pdf_filename: pdfFile.name, pdf_size: pdfFile.size,
//           })
//         }
//       } else {
//         const created = await subjectsAPI.create({
//           ...payload,
//           pdf_content: null, pdf_filename: null,
//           pdf_size: null, description: null, is_active: true,
//         })
//         if (pdfFile) {
//           const { publicUrl, storagePath } = await uploadSubjectPdf(created.id, pdfFile)
//           await subjectsAPI.update(created.id, {
//             pdf_url: publicUrl, pdf_storage_path: storagePath,
//             pdf_filename: pdfFile.name, pdf_size: pdfFile.size,
//           })
//         }
//       }
//       onSuccess()
//     } catch (error: unknown) {
//       alert(error instanceof Error ? error.message : 'حدث خطأ')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-5">

//       {/* اسم المادة */}
//       <div>
//         <label className="block text-sm font-semibold text-gray-700 mb-2">
//           اسم المادة <span className="text-red-500">*</span>
//         </label>
//         <input
//           type="text"
//           value={formData.name}
//           onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
//           required
//         />
//       </div>

//       {/* ── الفصل الدراسي — 3 خيارات مرئية ────────────────────────────── */}
//       <div>
//         <label className="block text-sm font-semibold text-gray-700 mb-3">
//           الفصل الدراسي
//         </label>
//         <div className="grid grid-cols-3 gap-3">
//           {([
//             { value: 'first',  label: 'الأول',       icon: '١', color: 'border-blue-400 bg-blue-50 text-blue-700',    active: 'ring-2 ring-blue-400'    },
//             { value: 'second', label: 'الثاني',      icon: '٢', color: 'border-emerald-400 bg-emerald-50 text-emerald-700', active: 'ring-2 ring-emerald-400' },
//             { value: null,     label: 'الفصلان معاً', icon: '∞', color: 'border-gray-300 bg-gray-50 text-gray-600',   active: 'ring-2 ring-gray-400'    },
//           ] as const).map((opt) => (
//             <button
//               key={String(opt.value)}
//               type="button"
//               onClick={() => setFormData({ ...formData, semester: opt.value })}
//               className={`
//                 flex flex-col items-center gap-1.5 py-4 px-3 rounded-xl border-2 font-medium
//                 transition-all duration-200 text-sm
//                 ${formData.semester === opt.value
//                   ? `${opt.color} ${opt.active} shadow-sm`
//                   : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
//                 }
//               `}
//             >
//               <span className="text-xl font-bold">{opt.icon}</span>
//               <span>{opt.label}</span>
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* ملف PDF */}
//       <div>
//         <label className="block text-sm font-semibold text-gray-700 mb-2">
//           ملف PDF للمادة
//           <span className="mr-1 text-xs text-gray-400 font-normal">(اختياري، حد أقصى {FILE_LIMITS.pdfMaxMB} ميجابايت)</span>
//         </label>
//         <input ref={pdfInputRef} type="file" accept="application/pdf" onChange={handlePdfChange} className="hidden" />
//         <div className="flex items-center gap-3">
//           <button
//             type="button"
//             onClick={() => pdfInputRef.current?.click()}
//             className="flex items-center gap-2 px-4 py-2 border-2 border-primary-500 text-primary-600 rounded-xl hover:bg-primary-50 font-medium"
//           >
//             <Upload size={18} />
//             {pdfFile ? pdfFile.name : 'اختيار ملف PDF'}
//           </button>
//           {subject?.pdf_filename && !pdfFile && (
//             <span className="text-sm text-gray-500">الملف الحالي: {subject.pdf_filename}</span>
//           )}
//         </div>
//         {pdfError && <p className="mt-1 text-sm text-red-600">{pdfError}</p>}
//       </div>

//       <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
//         <button type="button" onClick={onSuccess} className="px-5 py-2.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-all">
//           إلغاء
//         </button>
//         <button type="submit" disabled={loading} className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl hover:shadow-lg font-medium disabled:opacity-50 transition-all">
//           {loading ? 'جاري الحفظ...' : subject ? 'تحديث' : 'إضافة'}
//         </button>
//       </div>
//     </form>
//   )
// }

// // ─── Chapters Manager ─────────────────────────────────────────────────────────
// function ChaptersManager({ subjectId }: { subjectId: number }) {
//   const [chapters, setChapters]         = useState<Chapter[]>([])
//   const [loading, setLoading]           = useState(true)
//   const [newChapterName, setNewChapterName] = useState('')
//   const [addingChapter, setAddingChapter]   = useState(false)
//   const [editingId, setEditingId]       = useState<number | null>(null)
//   const [editingName, setEditingName]   = useState('')
//   const [error, setError]               = useState('')

//   useEffect(() => { loadChapters() }, [subjectId])

//   const loadChapters = async () => {
//     try {
//       setLoading(true)
//       const data = await chaptersAPI.getBySubject(subjectId)
//       setChapters(data)
//     } catch (err) {
//       console.error('Error loading chapters:', err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleAddChapter = async () => {
//     if (!newChapterName.trim()) return
//     setError('')
//     setAddingChapter(true)
//     try {
//       await chaptersAPI.create({
//         subject_id: subjectId,
//         name: newChapterName.trim(),
//         order_index: chapters.length + 1,
//         is_active: true,
//       })
//       setNewChapterName('')
//       loadChapters()
//     } catch (err: any) {
//       setError(err.message || 'حدث خطأ أثناء الإضافة')
//     } finally {
//       setAddingChapter(false)
//     }
//   }

//   const handleUpdateChapter = async (id: number) => {
//     if (!editingName.trim()) return
//     setError('')
//     try {
//       await chaptersAPI.update(id, { name: editingName.trim() })
//       setEditingId(null)
//       loadChapters()
//     } catch (err: any) {
//       setError(err.message || 'حدث خطأ أثناء التحديث')
//     }
//   }

//   const handleDeleteChapter = async (id: number) => {
//     if (!confirm('هل أنت متأكد من حذف هذا الفصل؟ سيتأثر كل سؤال مرتبط به.')) return
//     setError('')
//     try {
//       await chaptersAPI.delete(id)
//       loadChapters()
//     } catch (err: any) {
//       setError(err.message || 'حدث خطأ أثناء الحذف')
//     }
//   }

//   const moveChapter = async (index: number, direction: 'up' | 'down') => {
//     const newChapters = [...chapters]
//     const swapIndex = direction === 'up' ? index - 1 : index + 1
//     if (swapIndex < 0 || swapIndex >= newChapters.length) return
//     ;[newChapters[index], newChapters[swapIndex]] = [newChapters[swapIndex], newChapters[index]]
//     try {
//       await chaptersAPI.update(newChapters[index].id, { order_index: index + 1 })
//       await chaptersAPI.update(newChapters[swapIndex].id, { order_index: swapIndex + 1 })
//       setChapters(newChapters)
//     } catch (err: any) {
//       setError(err.message || 'حدث خطأ')
//     }
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-32">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-5">
//       {error && (
//         <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
//       )}

//       {/* Add new chapter */}
//       <div className="flex gap-3">
//         <input
//           type="text"
//           value={newChapterName}
//           onChange={(e) => setNewChapterName(e.target.value)}
//           onKeyDown={(e) => e.key === 'Enter' && handleAddChapter()}
//           placeholder="اسم الفصل الجديد..."
//           className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
//         />
//         <button
//           onClick={handleAddChapter}
//           disabled={addingChapter || !newChapterName.trim()}
//           className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl hover:shadow-lg font-medium disabled:opacity-50 transition-all"
//         >
//           <Plus size={18} />
//           {addingChapter ? 'جاري الإضافة...' : 'إضافة'}
//         </button>
//       </div>

//       {/* Chapters list */}
//       {chapters.length === 0 ? (
//         <div className="text-center py-12 text-gray-400">
//           <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
//           <p className="font-medium">لا توجد فصول لهذه المادة بعد</p>
//           <p className="text-sm mt-1">أضف فصلاً باستخدام الحقل أعلاه</p>
//         </div>
//       ) : (
//         <div className="space-y-2">
//           {chapters.map((chapter, index) => (
//             <div
//               key={chapter.id}
//               className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-primary-300 transition-all group"
//             >
//               <div className="flex flex-col gap-0.5">
//                 <button onClick={() => moveChapter(index, 'up')} disabled={index === 0} className="p-0.5 text-gray-400 hover:text-primary-600 disabled:opacity-20 transition-colors">
//                   <ChevronUp size={16} />
//                 </button>
//                 <button onClick={() => moveChapter(index, 'down')} disabled={index === chapters.length - 1} className="p-0.5 text-gray-400 hover:text-primary-600 disabled:opacity-20 transition-colors">
//                   <ChevronDown size={16} />
//                 </button>
//               </div>

//               <span className="w-7 h-7 flex items-center justify-center bg-primary-100 text-primary-700 rounded-full text-sm font-bold flex-shrink-0">
//                 {index + 1}
//               </span>

//               {editingId === chapter.id ? (
//                 <input
//                   type="text"
//                   value={editingName}
//                   onChange={(e) => setEditingName(e.target.value)}
//                   onKeyDown={(e) => {
//                     if (e.key === 'Enter') handleUpdateChapter(chapter.id)
//                     if (e.key === 'Escape') setEditingId(null)
//                   }}
//                   autoFocus
//                   className="flex-1 px-3 py-1.5 border-2 border-primary-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
//                 />
//               ) : (
//                 <span className="flex-1 text-gray-800 font-medium">{chapter.name}</span>
//               )}

//               <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                 {editingId === chapter.id ? (
//                   <>
//                     <button onClick={() => handleUpdateChapter(chapter.id)} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors">حفظ</button>
//                     <button onClick={() => setEditingId(null)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors">إلغاء</button>
//                   </>
//                 ) : (
//                   <>
//                     <button onClick={() => { setEditingId(chapter.id); setEditingName(chapter.name) }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
//                       <Edit size={15} />
//                     </button>
//                     <button onClick={() => handleDeleteChapter(chapter.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
//                       <Trash2 size={15} />
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       <p className="text-xs text-gray-400 text-center pt-2">
//         {chapters.length} فصل • يمكنك إعادة ترتيبها باستخدام الأسهم
//       </p>
//     </div>
//   )
// }







import { useState, useEffect, useRef } from 'react'
import { subjectsAPI, chaptersAPI } from '../services/api'
import Modal from '../components/Modal'
import {
  Plus, Edit, Trash2, Upload, BookOpen,
  ChevronUp, ChevronDown, Search, FileText,
  BookMarked, CheckCircle2, AlertCircle,
} from 'lucide-react'
import { uploadSubjectPdf, validatePdfFile, FILE_LIMITS } from '../services/storageService'
import type { Subject, Chapter } from '../types'

// ── ثوابت الفصل الدراسي ──────────────────────────────────────────────────────
const SEMESTER_CONFIG = {
  first:  { label: 'الفصل الأول',   short: 'ف١', color: 'bg-blue-100 text-blue-700 border-blue-200',     dot: 'bg-blue-500'    },
  second: { label: 'الفصل الثاني',  short: 'ف٢', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  null:   { label: 'الفصلان',       short: 'ف١٢', color: 'bg-gray-100 text-gray-600 border-gray-200',       dot: 'bg-gray-400'    },
} as const

type SemesterKey = 'first' | 'second' | null
const getSemester = (subject: Subject): SemesterKey =>
  ((subject as any).semester as SemesterKey) ?? null

// ── Main Component ────────────────────────────────────────────────────────────
export default function Subjects() {
  const [subjects, setSubjects]             = useState<Subject[]>([])
  const [loading, setLoading]               = useState(true)
  const [modalOpen, setModalOpen]           = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [chaptersModalOpen, setChaptersModalOpen] = useState(false)
  const [selectedSubject, setSelectedSubject]     = useState<Subject | null>(null)
  const [deleteConfirm, setDeleteConfirm]   = useState<Subject | null>(null)
  const [deleting, setDeleting]             = useState(false)

  // ── Filters ──────────────────────────────────────────────────────────────
  const [search, setSearch]               = useState('')
  const [semesterFilter, setSemesterFilter] = useState<SemesterKey | 'all'>('all')

  useEffect(() => { loadSubjects() }, [])

  const loadSubjects = async () => {
    try {
      setLoading(true)
      const data = await subjectsAPI.getAll()
      setSubjects(data)
    } catch (error) {
      console.error('Error loading subjects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      await subjectsAPI.delete(deleteConfirm.id)
      setDeleteConfirm(null)
      loadSubjects()
    } catch (error: any) {
      alert(error.message || 'حدث خطأ أثناء الحذف')
    } finally {
      setDeleting(false)
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const filtered = subjects.filter(s => {
    const matchSearch   = s.name.toLowerCase().includes(search.toLowerCase()) ||
                          String(s.subject_code).includes(search)
    const matchSemester = semesterFilter === 'all' || getSemester(s) === semesterFilter
    return matchSearch && matchSemester
  })

  const stats = {
    total:  subjects.length,
    first:  subjects.filter(s => getSemester(s) === 'first').length,
    second: subjects.filter(s => getSemester(s) === 'second').length,
    both:   subjects.filter(s => getSemester(s) === null).length,
    hasPdf: subjects.filter(s => !!(s.pdf_filename || s.pdf_url)).length,
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المواد الدراسية</h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? '...' : `${stats.total} مادة إجمالاً`}
          </p>
        </div>
        <button
          onClick={() => { setEditingSubject(null); setModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm shadow-sm"
        >
          <Plus size={17} />
          إضافة مادة
        </button>
      </div>

      {/* ── Stats Row ─────────────────────────────────────────────────────── */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'الفصل الأول',  value: stats.first,  color: 'border-r-4 border-blue-500',    bg: 'bg-blue-50',    text: 'text-blue-700'    },
            { label: 'الفصل الثاني', value: stats.second, color: 'border-r-4 border-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
            { label: 'الفصلان',      value: stats.both,   color: 'border-r-4 border-gray-400',    bg: 'bg-gray-50',    text: 'text-gray-700'    },
            { label: 'لديها PDF',    value: stats.hasPdf, color: 'border-r-4 border-orange-400',  bg: 'bg-orange-50',  text: 'text-orange-700'  },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} ${stat.color} rounded-lg p-4`}>
              <p className={`text-2xl font-bold ${stat.text}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Filter Bar ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث باسم المادة أو رمزها..."
            className="w-full pr-9 pl-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          />
        </div>

        {/* Semester Filter */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {([
            { key: 'all',    label: 'الكل'         },
            { key: 'first',  label: 'الفصل الأول'  },
            { key: 'second', label: 'الفصل الثاني' },
            { key: null,     label: 'الفصلان'      },
          ] as { key: SemesterKey | 'all'; label: string }[]).map((opt) => (
            <button
              key={String(opt.key)}
              onClick={() => setSemesterFilter(opt.key)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                ${semesterFilter === opt.key
                  ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
              <span className="text-sm">جاري التحميل...</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <BookOpen size={36} className="opacity-30 mb-3" />
            <p className="text-sm font-medium">
              {search || semesterFilter !== 'all' ? 'لا توجد نتائج مطابقة' : 'لا توجد مواد بعد'}
            </p>
            {!(search || semesterFilter !== 'all') && (
              <button
                onClick={() => { setEditingSubject(null); setModalOpen(true) }}
                className="mt-3 text-sm text-primary-600 hover:underline"
              >
                أضف أول مادة
              </button>
            )}
          </div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 w-20">الرمز</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">اسم المادة</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 w-32">الفصل</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 w-28">ملف PDF</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 w-40">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((subject) => {
                const sem    = getSemester(subject)
                const semCfg = SEMESTER_CONFIG[sem ?? 'null']
                const hasPdf = !!(subject.pdf_filename || subject.pdf_url)
                return (
                  <tr
                    key={subject.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    {/* Code */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        {subject.subject_code}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${semCfg.dot}`}
                        />
                        <span className="text-sm font-medium text-gray-900">{subject.name}</span>
                      </div>
                    </td>

                    {/* Semester badge */}
                    <td className="px-4 py-3">
                      <span className={`
                        inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border
                        ${semCfg.color}
                      `}>
                        {semCfg.label}
                      </span>
                    </td>

                    {/* PDF status */}
                    <td className="px-4 py-3">
                      {hasPdf ? (
                        <div className="flex items-center gap-1.5 text-green-600">
                          <CheckCircle2 size={14} />
                          <span className="text-xs font-medium">موجود</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <AlertCircle size={14} />
                          <span className="text-xs">غير محدد</span>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Chapters */}
                        <button
                          onClick={() => { setSelectedSubject(subject); setChaptersModalOpen(true) }}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-medium border border-indigo-200 transition-all"
                          title="إدارة الفصول"
                        >
                          <BookMarked size={13} />
                          الفصول
                        </button>
                        {/* Edit */}
                        <button
                          onClick={() => { setEditingSubject(subject); setModalOpen(true) }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="تعديل"
                        >
                          <Edit size={15} />
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => setDeleteConfirm(subject)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="حذف"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {filtered.length === subjects.length
                ? `${subjects.length} مادة`
                : `${filtered.length} من ${subjects.length} مادة`}
            </span>
            {(search || semesterFilter !== 'all') && (
              <button
                onClick={() => { setSearch(''); setSemesterFilter('all') }}
                className="text-xs text-primary-600 hover:underline"
              >
                إلغاء الفلتر
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingSubject(null) }}
        title={editingSubject ? 'تعديل مادة' : 'إضافة مادة جديدة'}
      >
        <SubjectForm
          subject={editingSubject}
          onSuccess={() => { setModalOpen(false); setEditingSubject(null); loadSubjects() }}
        />
      </Modal>

      {/* Chapters Modal */}
      <Modal
        isOpen={chaptersModalOpen}
        onClose={() => { setChaptersModalOpen(false); setSelectedSubject(null) }}
        title={`فصول مادة: ${selectedSubject?.name || ''}`}
        size="lg"
      >
        {selectedSubject && <ChaptersManager subjectId={selectedSubject.id} />}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="تأكيد الحذف"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                هل أنت متأكد من حذف مادة <span className="text-red-600">"{deleteConfirm?.name}"</span>؟
              </p>
              <p className="text-xs text-gray-500 mt-1">
                لا يمكن التراجع عن هذا الإجراء إذا لم تكن المادة مرتبطة بشعب.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              إلغاء
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 transition-all"
            >
              {deleting ? 'جاري الحذف...' : 'نعم، احذف'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ─── Subject Form ─────────────────────────────────────────────────────────────
function SubjectForm({ subject, onSuccess }: { subject: Subject | null; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name:     subject?.name || '',
    semester: ((subject as any)?.semester as SemesterKey) ?? null,
  })
  const [pdfFile, setPdfFile]   = useState<File | null>(null)
  const [pdfError, setPdfError] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setPdfError('')
    if (!file) { setPdfFile(null); return }
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
    setError('')
    if (!formData.name.trim()) { setError('اسم المادة إلزامي'); return }
    setLoading(true)
    try {
      const payload = { name: formData.name.trim(), semester: formData.semester }
      if (subject) {
        await subjectsAPI.update(subject.id, payload)
        if (pdfFile) {
          const { publicUrl, storagePath } = await uploadSubjectPdf(subject.id, pdfFile)
          await subjectsAPI.update(subject.id, {
            pdf_url: publicUrl, pdf_storage_path: storagePath,
            pdf_filename: pdfFile.name, pdf_size: pdfFile.size,
          })
        }
      } else {
        const created = await subjectsAPI.create({
          ...payload,
          pdf_content: null, pdf_filename: null,
          pdf_size: null, description: null, is_active: true,
        })
        if (pdfFile) {
          const { publicUrl, storagePath } = await uploadSubjectPdf(created.id, pdfFile)
          await subjectsAPI.update(created.id, {
            pdf_url: publicUrl, pdf_storage_path: storagePath,
            pdf_filename: pdfFile.name, pdf_size: pdfFile.size,
          })
        }
      }
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* اسم المادة */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          اسم المادة <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="مثال: الرياضيات، اللغة العربية..."
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          required
          autoFocus
        />
      </div>

      {/* الفصل الدراسي */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          الفصل الدراسي
        </label>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: 'first',  label: 'الأول',        icon: '١', desc: 'الفصل الدراسي الأول'  },
            { value: 'second', label: 'الثاني',        icon: '٢', desc: 'الفصل الدراسي الثاني' },
            { value: null,     label: 'الفصلان معاً', icon: '∞', desc: 'مادة مشتركة'           },
          ] as const).map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => setFormData({ ...formData, semester: opt.value })}
              className={`
                flex flex-col items-center gap-1 py-3 px-2 rounded-lg border-2 text-sm font-medium
                transition-all duration-200 cursor-pointer
                ${formData.semester === opt.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <span className="text-xl font-bold">{opt.icon}</span>
              <span className="text-xs font-semibold">{opt.label}</span>
              <span className="text-[10px] text-gray-400">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ملف PDF */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          ملف PDF
          <span className="mr-1 text-xs font-normal text-gray-400">
            (اختياري — حد أقصى {FILE_LIMITS.pdfMaxMB} ميجابايت)
          </span>
        </label>
        <input ref={pdfInputRef} type="file" accept="application/pdf" onChange={handlePdfChange} className="hidden" />

        <div
          onClick={() => pdfInputRef.current?.click()}
          className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all group"
        >
          <FileText size={20} className="text-gray-400 group-hover:text-primary-500 transition-colors flex-shrink-0" />
          <div className="flex-1 min-w-0">
            {pdfFile ? (
              <p className="text-sm font-medium text-primary-700 truncate">{pdfFile.name}</p>
            ) : subject?.pdf_filename ? (
              <>
                <p className="text-xs text-gray-500">الملف الحالي:</p>
                <p className="text-sm text-gray-700 truncate">{subject.pdf_filename}</p>
              </>
            ) : (
              <p className="text-sm text-gray-400">انقر لاختيار ملف PDF</p>
            )}
          </div>
          <Upload size={16} className="text-gray-400 flex-shrink-0" />
        </div>

        {pdfError && (
          <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle size={13} /> {pdfError}
          </p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onSuccess}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-all"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 transition-all shadow-sm"
        >
          {loading ? 'جاري الحفظ...' : subject ? 'حفظ التعديلات' : 'إضافة المادة'}
        </button>
      </div>
    </form>
  )
}

// ─── Chapters Manager ─────────────────────────────────────────────────────────
function ChaptersManager({ subjectId }: { subjectId: number }) {
  const [chapters, setChapters]             = useState<Chapter[]>([])
  const [loading, setLoading]               = useState(true)
  const [newChapterName, setNewChapterName] = useState('')
  const [addingChapter, setAddingChapter]   = useState(false)
  const [editingId, setEditingId]           = useState<number | null>(null)
  const [editingName, setEditingName]       = useState('')
  const [error, setError]                   = useState('')

  useEffect(() => { loadChapters() }, [subjectId])

  const loadChapters = async () => {
    try {
      setLoading(true)
      const data = await chaptersAPI.getBySubject(subjectId)
      setChapters(data)
    } catch (err) {
      console.error('Error loading chapters:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddChapter = async () => {
    if (!newChapterName.trim()) return
    setError('')
    setAddingChapter(true)
    try {
      await chaptersAPI.create({
        subject_id: subjectId,
        name: newChapterName.trim(),
        order_index: chapters.length + 1,
        is_active: true,
      })
      setNewChapterName('')
      loadChapters()
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الإضافة')
    } finally {
      setAddingChapter(false)
    }
  }

  const handleUpdateChapter = async (id: number) => {
    if (!editingName.trim()) return
    setError('')
    try {
      await chaptersAPI.update(id, { name: editingName.trim() })
      setEditingId(null)
      loadChapters()
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء التحديث')
    }
  }

  const handleDeleteChapter = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الفصل؟')) return
    setError('')
    try {
      await chaptersAPI.delete(id)
      loadChapters()
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الحذف')
    }
  }

  const moveChapter = async (index: number, direction: 'up' | 'down') => {
    const newChapters = [...chapters]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= newChapters.length) return
    ;[newChapters[index], newChapters[swapIndex]] = [newChapters[swapIndex], newChapters[index]]
    try {
      await chaptersAPI.update(newChapters[index].id, { order_index: index + 1 })
      await chaptersAPI.update(newChapters[swapIndex].id, { order_index: swapIndex + 1 })
      setChapters(newChapters)
    } catch (err: any) {
      setError(err.message || 'حدث خطأ')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-7 w-7 border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle size={15} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Add Chapter Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newChapterName}
          onChange={(e) => setNewChapterName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddChapter()}
          placeholder="اسم الفصل الجديد..."
          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
        />
        <button
          onClick={handleAddChapter}
          disabled={addingChapter || !newChapterName.trim()}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-all"
        >
          <Plus size={16} />
          {addingChapter ? 'إضافة...' : 'إضافة'}
        </button>
      </div>

      {/* Chapters List */}
      {chapters.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">لا توجد فصول بعد</p>
          <p className="text-xs mt-1 opacity-70">أضف فصلاً باستخدام الحقل أعلاه</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
          {chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors group"
            >
              {/* Drag handle & order buttons */}
              <div className="flex flex-col gap-0.5 flex-shrink-0">
                <button
                  onClick={() => moveChapter(index, 'up')}
                  disabled={index === 0}
                  className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-0 transition-colors"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => moveChapter(index, 'down')}
                  disabled={index === chapters.length - 1}
                  className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-0 transition-colors"
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              {/* Number */}
              <span className="w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-500 rounded text-xs font-bold flex-shrink-0">
                {index + 1}
              </span>

              {/* Name / Edit Input */}
              {editingId === chapter.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdateChapter(chapter.id)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  autoFocus
                  className="flex-1 px-3 py-1.5 border-2 border-primary-400 rounded-lg text-sm focus:outline-none"
                />
              ) : (
                <span className="flex-1 text-sm text-gray-800">{chapter.name}</span>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                {editingId === chapter.id ? (
                  <>
                    <button
                      onClick={() => handleUpdateChapter(chapter.id)}
                      className="px-2.5 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700"
                    >
                      حفظ
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2.5 py-1 border border-gray-300 rounded text-xs font-medium hover:bg-gray-100"
                    >
                      إلغاء
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setEditingId(chapter.id); setEditingName(chapter.name) }}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteChapter(chapter.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        {chapters.length} {chapters.length === 1 ? 'فصل' : 'فصول'} • استخدم الأسهم لإعادة الترتيب
      </p>
    </div>
  )
}