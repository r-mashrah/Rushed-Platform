
// // import { useState, useEffect, useRef } from 'react'
// // import { questionsAPI } from '../services/apiQuestions'
// // import { subjectsAPI, chaptersAPI } from '../services/api'
// // import { useAuthStore } from '../store/authStore'
// // import { supabase } from '../lib/supabase'
// // import Table from '../components/Table'
// // import Modal from '../components/Modal'
// // import { Plus, Edit, Trash2, Filter, Upload, Sparkles } from 'lucide-react'
// // import { uploadQuestionPdf, validatePdfFile, FILE_LIMITS } from '../services/storageService'
// // import type { Question, QuestionType, DifficultyLevel } from '../types'

// // export default function QuestionBank() {
// //   useAuthStore()
// //   const [questions, setQuestions] = useState<Question[]>([])
// //   const [subjects, setSubjects] = useState<any[]>([])
// //   const [loading, setLoading] = useState(true)
// //   const [modalOpen, setModalOpen] = useState(false)
// //   const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
// //   const [deleteConfirm, setDeleteConfirm] = useState<Question | null>(null)
  
// //   // Filters
// //   const [typeFilter, setTypeFilter] = useState<string>('كل')
// //   const [difficultyFilter, setDifficultyFilter] = useState<string>('كل')
// //   const [subjectFilter, setSubjectFilter] = useState<number | undefined>()
// //   const [skillFilter, setSkillFilter] = useState<string>('كل')

// //   useEffect(() => {
// //     loadSubjects()
// //   }, [])

// //   useEffect(() => {
// //     loadQuestions()
// //   }, [typeFilter, difficultyFilter, subjectFilter, skillFilter])

// //   const loadSubjects = async () => {
// //     try {
// //       const data = await subjectsAPI.getAll()
// //       setSubjects(data)
// //     } catch (error) {
// //       console.error('Error loading subjects:', error)
// //     }
// //   }

// //   const loadQuestions = async () => {
// //     try {
// //       setLoading(true)

// //       // بناء الاستعلام مع join لجدول teachers
// //       let query = supabase
// //         .from('questions')
// //         .select(`
// //           *,
// //           teachers ( full_name )
// //         `)
// //         .order('id', { ascending: false })

// //       if (typeFilter !== 'كل') query = query.eq('question_type', typeFilter)
// //       if (difficultyFilter !== 'كل') query = query.eq('difficulty_level', difficultyFilter)
// //       if (subjectFilter) query = query.eq('subject_id', subjectFilter)
// //       if (skillFilter !== 'كل') query = query.eq('skill', skillFilter)

// //       const { data, error } = await query
// //       if (error) throw error

// //       // تسطيح teacher_name
// //       const enriched = (data || []).map((q: any) => ({
// //         ...q,
// //         teacher_name: q.teachers?.full_name || null,
// //       }))

// //       setQuestions(enriched)
// //     } catch (error) {
// //       console.error('Error loading questions:', error)
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   const handleDelete = async (question: Question) => {
// //     try {
// //       await questionsAPI.delete(question.id)
// //       loadQuestions()
// //       setDeleteConfirm(null)
// //     } catch (error: any) {
// //       alert(error.message || 'حدث خطأ أثناء حذف السؤال')
// //     }
// //   }

// //   const getQuestionTypeLabel = (type: QuestionType) => {
// //     const labels: Record<QuestionType, string> = {
// //       multiple_choice: 'اختيار من متعدد',
// //       true_false: 'صح وخطأ',
// //       essay: 'مقالي',
// //       fill_blank: 'فراغات',
// //     }
// //     return labels[type]
// //   }

// //   const getDifficultyLabel = (difficulty: DifficultyLevel) => {
// //     const labels: Record<DifficultyLevel, string> = {
// //       easy: 'سهل',
// //       medium: 'متوسط',
// //       hard: 'صعب',
// //     }
// //     return labels[difficulty]
// //   }

// //   const truncateText = (text: string, maxLength: number = 50) => {
// //     return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
// //   }

// //   const columns = [
// //     // {
// //     //   key: 'id',
// //     //   label: '#',
// //     //   render: (q: Question) => q.id,
// //     // },
// //     {
// //       key: 'question_text',
// //       label: 'نص السؤال',
// //       render: (q: Question) => truncateText(q.question_text),
// //     },
// //     {
// //       key: 'question_type',
// //       label: 'النوع',
// //       render: (q: Question) => getQuestionTypeLabel(q.question_type),
// //     },
// //     {
// //       key: 'difficulty_level',
// //       label: 'الصعوبة',
// //       render: (q: Question) => getDifficultyLabel(q.difficulty_level),
// //     },
// //     {
// //       key: 'subject',
// //       label: 'المادة',
// //       render: (q: Question) => {
// //         const subject = subjects.find(s => s.id === q.subject_id)
// //         return subject?.name || '—'
// //       },
// //     },
// //     {
// //       key: 'added_by',
// //       label: 'أضافه',
// //       render: (q: any) => {
// //         if (q.teacher_name) {
// //           return (
// //             <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold whitespace-nowrap">
// //               👨‍🏫 {q.teacher_name}
// //             </span>
// //           )
// //         }
// //         return (
// //           <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold whitespace-nowrap">
// //             🛡️ الإدارة
// //           </span>
// //         )
// //       },
// //     },
// //     {
// //       key: 'skill',
// //       label: 'المهارة',
// //       render: (q: any) => {
// //         const skillLabels: Record<string, { label: string; color: string }> = {
// //           remember:   { label: 'تذكر',   color: 'bg-blue-50 text-blue-700' },
// //           understand: { label: 'فهم',    color: 'bg-green-50 text-green-700' },
// //           apply:      { label: 'تطبيق', color: 'bg-yellow-50 text-yellow-700' },
// //           analyze:    { label: 'تحليل', color: 'bg-purple-50 text-purple-700' },
// //         }
// //         const skill = skillLabels[q.skill]
// //         if (!skill) return <span className="text-gray-400 text-xs">—</span>
// //         return (
// //           <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold ${skill.color}`}>
// //             {skill.label}
// //           </span>
// //         )
// //       },
// //     },
// //   ]

// //   return (
// //     <div className="space-y-6 w-full">
// //       <div className="flex items-center justify-between mb-6">
// //         <div>
// //           <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent mb-2">
// //             بنك الأسئلة
// //           </h1>
// //           <p className="text-gray-600 text-lg">عرض وإدارة الأسئلة</p>
// //         </div>
// //         <button
// //           onClick={() => {
// //             setEditingQuestion(null)
// //             setModalOpen(true)
// //           }}
// //           className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
// //         >
// //           <Plus size={20} />
// //           <span>إضافة سؤال</span>
// //         </button>
// //       </div>

// //       {/* Filters */}
// //       <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
// //         <div className="flex items-center gap-2 mb-4">
// //           <Filter size={22} className="text-primary-600" />
// //           <span className="font-semibold text-gray-800 text-lg">الفلاتر:</span>
// //         </div>
// //         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
// //           <div>
// //             <label className="block text-sm font-medium text-gray-700 mb-2">نوع السؤال</label>
// //             <select
// //               value={typeFilter}
// //               onChange={(e) => setTypeFilter(e.target.value)}
// //               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
// //             >
// //               <option value="كل">كل</option>
// //               <option value="multiple_choice">اختيار من متعدد</option>
// //               <option value="true_false">صح وخطأ</option>
// //               <option value="essay">مقالي</option>
// //               <option value="fill_blank">فراغات</option>
// //             </select>
// //           </div>
// //           <div>
// //             <label className="block text-sm font-medium text-gray-700 mb-2">الصعوبة</label>
// //             <select
// //               value={difficultyFilter}
// //               onChange={(e) => setDifficultyFilter(e.target.value)}
// //               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
// //             >
// //               <option value="كل">كل</option>
// //               <option value="easy">سهل</option>
// //               <option value="medium">متوسط</option>
// //               <option value="hard">صعب</option>
// //             </select>
// //           </div>
// //           <div>
// //             <label className="block text-sm font-medium text-gray-700 mb-2">المهارة</label>
// //             <select
// //               value={skillFilter}
// //               onChange={(e) => setSkillFilter(e.target.value)}
// //               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
// //             >
// //               <option value="كل">كل المهارات</option>
// //               <option value="remember">تذكر</option>
// //               <option value="understand">فهم</option>
// //               <option value="apply">تطبيق</option>
// //               <option value="analyze">تحليل</option>
// //             </select>
// //           </div>
// //           <div>
// //             <label className="block text-sm font-medium text-gray-700 mb-2">المادة</label>
// //             <select
// //               value={subjectFilter || ''}
// //               onChange={(e) => setSubjectFilter(e.target.value ? Number(e.target.value) : undefined)}
// //               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
// //             >
// //               <option value="">كل المواد</option>
// //               {subjects.map((subject) => (
// //                 <option key={subject.id} value={subject.id}>
// //                   {subject.name}
// //                 </option>
// //               ))}
// //             </select>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Table */}
// //       <Table
// //         columns={columns}
// //         data={questions}
// //         loading={loading}
// //         actions={(question) => (
// //           <div className="flex items-center gap-2">
// //             <button
// //               onClick={() => {
// //                 setEditingQuestion(question)
// //                 setModalOpen(true)
// //               }}
// //               className="text-blue-600 hover:text-blue-800"
// //             >
// //               <Edit size={18} />
// //             </button>
// //             <button
// //               onClick={() => setDeleteConfirm(question)}
// //               className="text-red-600 hover:text-red-800"
// //             >
// //               <Trash2 size={18} />
// //             </button>
// //           </div>
// //         )}
// //       />

// //       {/* Add/Edit Modal */}
// //       <Modal
// //         isOpen={modalOpen}
// //         onClose={() => {
// //           setModalOpen(false)
// //           setEditingQuestion(null)
// //         }}
// //         title={editingQuestion ? 'تحديث سؤال' : 'إضافة سؤال'}
// //         size="lg"
// //       >
// //         <QuestionForm
// //           question={editingQuestion}
// //           subjects={subjects}
// //           onSuccess={() => {
// //             setModalOpen(false)
// //             setEditingQuestion(null)
// //             loadQuestions()
// //           }}
// //         />
// //       </Modal>

// //       {/* Delete Confirm Modal */}
// //       <Modal
// //         isOpen={!!deleteConfirm}
// //         onClose={() => setDeleteConfirm(null)}
// //         title="تأكيد الحذف"
// //         size="sm"
// //       >
// //         <div className="space-y-4">
// //           <p className="text-gray-700">
// //             هل أنت متأكد من حذف هذا السؤال؟
// //           </p>
// //           <div className="flex items-center justify-end gap-3">
// //             <button
// //               onClick={() => setDeleteConfirm(null)}
// //               className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
// //             >
// //               إلغاء
// //             </button>
// //             <button
// //               onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
// //               className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
// //             >
// //               نعم، احذف
// //             </button>
// //           </div>
// //         </div>
// //       </Modal>
// //     </div>
// //   )
// // }

// // function QuestionForm({
// //   question,
// //   subjects,
// //   onSuccess,
// // }: {
// //   question: Question | null
// //   subjects: any[]
// //   onSuccess: () => void
// // }) {
// //   const { admin } = useAuthStore()
// //   const [formData, setFormData] = useState({
// //     question_text: question?.question_text || '',
// //     question_type: (question?.question_type || 'multiple_choice') as QuestionType,
// //     difficulty_level: (question?.difficulty_level || 'easy') as DifficultyLevel,
// //     subject_id: question?.subject_id || subjects[0]?.id || 0,
// //     chapter_id: (question as any)?.chapter_id || 0,
// //     question_options: question?.question_options || null,
// //     correct_answer: question?.correct_answer || '',
// //     // ── حقول المهارة والشرح ──────────────────────────────────────────
// //     skill: (question as any)?.skill || '',
// //     explanation: (question as any)?.explanation || '',
// //     reference_page: (question as any)?.reference_page || '',
// //   })
// //   const [options, setOptions] = useState<string[]>(() => {
// //     const opts = question?.question_options
// //     if (!opts) return ['', '', '', '']
// //     // التنسيق القديم: {"A":"نص1","B":"نص2",...}
// //     if ('A' in opts) return [opts['A'] || '', opts['B'] || '', opts['C'] || '', opts['D'] || '']
// //     // التنسيق الجديد: {"options":[...]}
// //     if ('options' in opts) return [...(opts.options as string[]), ...['','','','']].slice(0, 4)
// //     return ['', '', '', '']
// //   })
// //   const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(0)
// //   const [chapters, setChapters] = useState<any[]>([])             // ← FIX 1: قائمة الفصول
// //   const [chaptersLoading, setChaptersLoading] = useState(false)
// //   const [pdfFile, setPdfFile] = useState<File | null>(null)
// //   const [pdfError, setPdfError] = useState('')
// //   const [loading, setLoading] = useState(false)
// //   const [error, setError] = useState('')
// //   const [skillLoading, setSkillLoading] = useState(false)
// //   const pdfInputRef = useRef<HTMLInputElement>(null)

// //   // ── تحديد المهارة تلقائياً عبر Supabase Edge Function ──────────────────
// //   const detectSkill = async () => {
// //     const questionText = formData.question_text.trim()
// //     if (!questionText) {
// //       setError('اكتب نص السؤال أولاً قبل تحديد المهارة تلقائياً')
// //       return
// //     }

// //     setSkillLoading(true)
// //     setError('')

// //     try {
// //       const { data, error: fnError } = await supabase.functions.invoke('detect-skill', {
// //         body: { question_text: questionText },
// //       })

// //       if (fnError) throw new Error(fnError.message)

// //       const skill = data?.skill ?? ''
// //       const validSkills = ['remember', 'understand', 'apply', 'analyze']

// //       if (skill && validSkills.includes(skill)) {
// //         setFormData(prev => ({ ...prev, skill }))
// //       } else {
// //         setError('لم يتمكن النظام من تحديد المهارة — اختر يدوياً')
// //       }
// //     } catch (err: any) {
// //       setError('فشل تحديد المهارة تلقائياً — تحقق من الاتصال')
// //       console.error('detectSkill error:', err)
// //     } finally {
// //       setSkillLoading(false)
// //     }
// //   }

// //   // ── FIX 1: تحميل الفصول عند تغيير المادة ────────────────────────────────
// //   useEffect(() => {
// //     const loadChapters = async () => {
// //       if (!formData.subject_id) {
// //         setChapters([])
// //         setFormData(prev => ({ ...prev, chapter_id: 0 }))
// //         return
// //       }
// //       try {
// //         setChaptersLoading(true)
// //         const data = await chaptersAPI.getBySubject(formData.subject_id)
// //         setChapters(data)
// //         // إذا كان السؤال موجوداً مسبقاً احتفظ بـ chapter_id، وإلا اختر الأول تلقائياً
// //         if (!(question as any)?.chapter_id) {
// //           setFormData(prev => ({ ...prev, chapter_id: data[0]?.id || 0 }))
// //         }
// //       } catch (e) {
// //         console.error('Error loading chapters:', e)
// //         setChapters([])
// //       } finally {
// //         setChaptersLoading(false)
// //       }
// //     }
// //     loadChapters()
// //   }, [formData.subject_id])

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

// //   useEffect(() => {
// //     const opts = question?.question_options
// //     if (!opts) return
// //     let optsList: string[] = []
// //     // التنسيق القديم: {"A":"نص1","B":"نص2",...}
// //     if ('A' in opts) {
// //       optsList = [opts['A'] || '', opts['B'] || '', opts['C'] || '', opts['D'] || '']
// //       setOptions(optsList)
// //       // correct_answer = 'A'/'B'/'C'/'D' → تحويل لـ index
// //       const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 }
// //       const idx = map[question.correct_answer || '']
// //       if (idx !== undefined) setCorrectOptionIndex(idx)
// //     }
// //     // التنسيق الجديد: {"options":[...]}
// //     else if ('options' in opts) {
// //       optsList = opts.options as string[]
// //       setOptions(optsList)
// //       if (question.correct_answer) {
// //         const index = optsList.indexOf(question.correct_answer)
// //         if (index >= 0) setCorrectOptionIndex(index)
// //       }
// //     }
// //   }, [question])

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault()
// //     setError('')

// //     // Validation
// //     if (!formData.question_text.trim()) {
// //       setError('نص السؤال إلزامي')
// //       return
// //     }

// //     // ── FIX 1: التحقق من اختيار الفصل ────────────────────────────────────
// //     if (!formData.chapter_id === null || formData.chapter_id === undefined) {
// //       setError('يجب اختيار الفصل')
// //       return
// //     }

// //     if (formData.question_type === 'multiple_choice') {
// //       if (options.some(opt => !opt.trim())) {
// //         setError('جميع الخيارات إلزامية')
// //         return
// //       }
// //       if (!options[correctOptionIndex]) {
// //         setError('يجب تحديد الإجابة الصحيحة')
// //         return
// //       }
// //     }

// //     if (formData.question_type === 'fill_blank' && !formData.correct_answer.trim()) {
// //       setError('الإجابة الصحيحة إلزامية')
// //       return
// //     }

// //     setLoading(true)

// //     try {
// //       const questionData: any = {
// //         question_text: formData.question_text,
// //         question_type: formData.question_type,
// //         difficulty_level: formData.difficulty_level,
// //         subject_id: formData.subject_id,
// //         chapter_id: formData.chapter_id,
// //         status: 'approved',
// //         created_by_admin: admin?.id || null,
// //         created_by_teacher: null,
// //         is_active: true,
// //         // ── حقول المهارة والشرح ──────────────────────────────────────────
// //         skill: formData.skill || null,
// //         explanation: formData.explanation.trim() || null,
// //         reference_page: formData.reference_page.trim() || null,
// //       }

// //       // ── multiple_choice: {"A":"نص1","B":"نص2","C":"نص3","D":"نص4"} + correct='A' ──
// //       if (formData.question_type === 'multiple_choice') {
// //         questionData.question_options = {
// //           A: options[0] || '',
// //           B: options[1] || '',
// //           C: options[2] || '',
// //           D: options[3] || '',
// //         }
// //         // correct_answer = الحرف المقابل للخيار المحدد
// //         const letters = ['A', 'B', 'C', 'D']
// //         questionData.correct_answer = letters[correctOptionIndex] || 'A'

// //       // ── true_false: {"A":"صحيح","B":"خطأ"} + correct='A' أو 'B' ──────────
// //       } else if (formData.question_type === 'true_false') {
// //         questionData.question_options = { A: 'صحيح', B: 'خطأ' }
// //         questionData.correct_answer = formData.correct_answer === 'خطأ' ? 'B' : 'A'

// //       } else if (formData.question_type === 'fill_blank') {
// //         questionData.correct_answer = formData.correct_answer
// //         questionData.question_options = null
// //       } else {
// //         // essay
// //         questionData.correct_answer = null
// //         questionData.question_options = null
// //       }

// //       let questionId: number
// //       if (question) {
// //         await questionsAPI.update(question.id, questionData)
// //         questionId = question.id
// //       } else {
// //         const created = await questionsAPI.create(questionData)
// //         questionId = created.id
// //       }

// //       if (pdfFile) {
// //         const { publicUrl, storagePath } = await uploadQuestionPdf(questionId, pdfFile)
// //         await questionsAPI.update(questionId, {
// //           pdf_url: publicUrl,
// //           pdf_storage_path: storagePath,
// //           pdf_filename: pdfFile.name,
// //         })
// //       }
// //       onSuccess()
// //     } catch (err: any) {
// //       setError(err.message || 'حدث خطأ')
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   return (
// //     <form onSubmit={handleSubmit} className="space-y-4">
// //       {error && (
// //         <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
// //           {error}
// //         </div>
// //       )}

// //       <div>
// //         <label className="block text-sm font-medium text-gray-700 mb-2">
// //           نص السؤال <span className="text-red-500">*</span>
// //         </label>
// //         <textarea
// //           value={formData.question_text}
// //           onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
// //           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
// //           rows={3}
// //           required
// //         />
// //       </div>

// //       <div>
// //         <label className="block text-sm font-medium text-gray-700 mb-2">
// //           نوع السؤال <span className="text-red-500">*</span>
// //         </label>
// //         <select
// //           value={formData.question_type}
// //           onChange={(e) => setFormData({ ...formData, question_type: e.target.value as QuestionType })}
// //           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
// //         >
// //           <option value="multiple_choice">اختيار من متعدد</option>
// //           <option value="true_false">صح وخطأ</option>
// //           <option value="essay">مقالي</option>
// //           <option value="fill_blank">فراغات</option>
// //         </select>
// //       </div>

// //       {/* Multiple Choice Options */}
// //       {formData.question_type === 'multiple_choice' && (
// //         <div className="space-y-3">
// //           <label className="block text-sm font-medium text-gray-700">الخيارات <span className="text-red-500">*</span></label>
// //           {options.map((option, index) => (
// //             <div key={index} className="flex items-center gap-3">
// //               <input
// //                 type="radio"
// //                 name="correct_option"
// //                 checked={correctOptionIndex === index}
// //                 onChange={() => setCorrectOptionIndex(index)}
// //                 className="w-4 h-4 text-primary-600"
// //               />
// //               <input
// //                 type="text"
// //                 value={option}
// //                 onChange={(e) => {
// //                   const newOptions = [...options]
// //                   newOptions[index] = e.target.value
// //                   setOptions(newOptions)
// //                 }}
// //                 placeholder={`الخيار ${index + 1}`}
// //                 className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
// //                 required
// //               />
// //             </div>
// //           ))}
// //         </div>
// //       )}

// //       {/* True/False — الإجابة الصحيحة */}
// //       {formData.question_type === 'true_false' && (
// //         <div>
// //           <label className="block text-sm font-medium text-gray-700 mb-2">الإجابة الصحيحة <span className="text-red-500">*</span></label>
// //           <div className="flex items-center gap-4">
// //             <label className="flex items-center gap-2">
// //               <input
// //                 type="radio"
// //                 name="true_false"
// //                 checked={['صحيح','A','True','true'].includes(formData.correct_answer)}
// //                 onChange={() => setFormData({ ...formData, correct_answer: 'صحيح' })}
// //                 className="w-4 h-4 text-primary-600"
// //               />
// //               <span>صحيح</span>
// //             </label>
// //             <label className="flex items-center gap-2">
// //               <input
// //                 type="radio"
// //                 name="true_false"
// //                 checked={['خطأ','B','False','false'].includes(formData.correct_answer)}
// //                 onChange={() => setFormData({ ...formData, correct_answer: 'خطأ' })}
// //                 className="w-4 h-4 text-primary-600"
// //               />
// //               <span>خطأ</span>
// //             </label>
// //           </div>
// //         </div>
// //       )}

// //       {/* Fill Blank Answer */}
// //       {formData.question_type === 'fill_blank' && (
// //         <div>
// //           <label className="block text-sm font-medium text-gray-700 mb-2">
// //             الإجابة الصحيحة <span className="text-red-500">*</span>
// //           </label>
// //           <input
// //             type="text"
// //             value={formData.correct_answer}
// //             onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
// //             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
// //             required
// //           />
// //         </div>
// //       )}

// //       {/* Essay - No additional fields */}

// //       <div className="grid grid-cols-2 gap-4">
// //         <div>
// //           <label className="block text-sm font-medium text-gray-700 mb-2">
// //             الصعوبة <span className="text-red-500">*</span>
// //           </label>
// //           <select
// //             value={formData.difficulty_level}
// //             onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value as DifficultyLevel })}
// //             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
// //           >
// //             <option value="easy">سهل</option>
// //             <option value="medium">متوسط</option>
// //             <option value="hard">صعب</option>
// //           </select>
// //         </div>

// //         <div>
// //           <label className="block text-sm font-medium text-gray-700 mb-2">
// //             المادة <span className="text-red-500">*</span>
// //           </label>
// //           <select
// //             value={formData.subject_id}
// //             onChange={(e) => setFormData({ ...formData, subject_id: Number(e.target.value), chapter_id: 0 })}
// //             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
// //             required
// //           >
// //             <option value={0} disabled>اختر المادة</option>
// //             {subjects.map((subject) => (
// //               <option key={subject.id} value={subject.id}>
// //                 {subject.name}
// //               </option>
// //             ))}
// //           </select>
// //         </div>
// //       </div>

// //       {/* ── FIX 1: حقل الفصل — يظهر بعد اختيار المادة ────────────────────── */}
// //       <div>
// //         <label className="block text-sm font-medium text-gray-700 mb-2">
// //           الفصل <span className="text-red-500">*</span>
// //         </label>
// //         <select
// //           value={formData.chapter_id}
// //           onChange={(e) => setFormData({ ...formData, chapter_id: Number(e.target.value) })}
// //           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:text-gray-400"
// //           required
// //           disabled={!formData.subject_id || chaptersLoading}
// //         >
// //           <option value={0} disabled>
// //             {chaptersLoading
// //               ? 'جاري التحميل...'
// //               : !formData.subject_id
// //               ? 'اختر المادة أولاً'
// //               : chapters.length === 0
// //               ? 'لا توجد فصول لهذه المادة'
// //               : 'اختر الفصل'}
// //           </option>
// //           {chapters.map((chapter) => (
// //             <option key={chapter.id} value={chapter.id}>
// //               {chapter.name}
// //             </option>
// //           ))}
// //         </select>
// //         {formData.subject_id && !chaptersLoading && chapters.length === 0 && (
// //           <p className="mt-1 text-xs text-amber-600">
// //             ⚠️ هذه المادة لا تحتوي على فصول — أضف فصلاً أولاً قبل إضافة أسئلة.
// //           </p>
// //         )}
// //       </div>

// //       {/* ── مهارة بلوم + رقم الصفحة ──────────────────────────────────────── */}
// //       <div className="grid grid-cols-2 gap-4">
// //         <div>
// //           <label className="block text-sm font-medium text-gray-700 mb-2">
// //             مهارة بلوم
// //             <span className="mr-1 text-xs text-gray-400">(تُستخدم في تحليلات الطالب)</span>
// //           </label>
// //           {/* الـ dropdown + زر تحديد تلقائي */}
// //           <div className="flex gap-2">
// //             <select
// //               value={formData.skill}
// //               onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
// //               className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
// //             >
// //               <option value="">— اختر المهارة —</option>
// //               <option value="remember">🧠 تذكر (Remember)</option>
// //               <option value="understand">💡 فهم (Understand)</option>
// //               <option value="apply">🔧 تطبيق (Apply)</option>
// //               <option value="analyze">🔍 تحليل (Analyze)</option>
// //             </select>
// //             <button
// //               type="button"
// //               onClick={detectSkill}
// //               disabled={skillLoading}
// //               title="تحديد المهارة تلقائياً باستخدام الذكاء الاصطناعي"
// //               className={`
// //                 flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold
// //                 transition-all duration-200 whitespace-nowrap border
// //                 ${skillLoading
// //                   ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
// //                   : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white border-transparent hover:shadow-md hover:scale-105'
// //                 }
// //               `}
// //             >
// //               {skillLoading ? (
// //                 <>
// //                   <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
// //                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
// //                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
// //                   </svg>
// //                   <span>جاري...</span>
// //                 </>
// //               ) : (
// //                 <>
// //                   <Sparkles size={15} />
// //                   <span>تلقائي</span>
// //                 </>
// //               )}
// //             </button>
// //           </div>
// //           {/* بادج المهارة المحددة */}
// //           {formData.skill && (
// //             <div className="mt-2 flex items-center gap-1">
// //               <span className="text-xs text-gray-500">تم التحديد:</span>
// //               <span className={`
// //                 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold
// //                 ${formData.skill === 'remember'   ? 'bg-blue-100 text-blue-700'   : ''}
// //                 ${formData.skill === 'understand' ? 'bg-green-100 text-green-700' : ''}
// //                 ${formData.skill === 'apply'      ? 'bg-yellow-100 text-yellow-700' : ''}
// //                 ${formData.skill === 'analyze'    ? 'bg-purple-100 text-purple-700' : ''}
// //               `}>
// //                 {formData.skill === 'remember'   && '🧠 تذكر'}
// //                 {formData.skill === 'understand' && '💡 فهم'}
// //                 {formData.skill === 'apply'      && '🔧 تطبيق'}
// //                 {formData.skill === 'analyze'    && '🔍 تحليل'}
// //               </span>
// //             </div>
// //           )}
// //         </div>
// //         <div>
// //           <label className="block text-sm font-medium text-gray-700 mb-2">
// //             رقم الصفحة المرجعية
// //             <span className="mr-1 text-xs text-gray-400">(اختياري)</span>
// //           </label>
// //           <input
// //             type="text"
// //             value={formData.reference_page}
// //             onChange={(e) => setFormData({ ...formData, reference_page: e.target.value })}
// //             placeholder="مثال: صفحة 42"
// //             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
// //           />
// //         </div>
// //       </div>

// //       {/* ── شرح الإجابة ──────────────────────────────────────────────────── */}
// //       <div>
// //         <label className="block text-sm font-medium text-gray-700 mb-2">
// //           شرح الإجابة
// //           <span className="mr-1 text-xs text-gray-400">(يظهر للطالب بعد الإجابة الخاطئة)</span>
// //         </label>
// //         <textarea
// //           value={formData.explanation}
// //           onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
// //           placeholder="اكتب شرحاً مفصلاً للإجابة الصحيحة..."
// //           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
// //           rows={3}
// //         />
// //       </div>

// //       <div>
// //         <label className="block text-sm font-medium text-gray-700 mb-2">
// //           ملف PDF مرفق (اختياري، حد أقصى {FILE_LIMITS.pdfMaxMB} ميجابايت)
// //         </label>
// //         <input
// //           ref={pdfInputRef}
// //           type="file"
// //           accept="application/pdf"
// //           onChange={handlePdfChange}
// //           className="hidden"
// //         />
// //         <div className="flex items-center gap-3">
// //           <button
// //             type="button"
// //             onClick={() => pdfInputRef.current?.click()}
// //             className="flex items-center gap-2 px-4 py-2 border-2 border-primary-500 text-primary-600 rounded-lg hover:bg-primary-50 font-medium"
// //           >
// //             <Upload size={18} />
// //             {pdfFile ? pdfFile.name : 'اختيار ملف PDF'}
// //           </button>
// //           {question?.pdf_filename && !pdfFile && (
// //             <span className="text-sm text-gray-500">الملف الحالي: {question.pdf_filename}</span>
// //           )}
// //         </div>
// //         {pdfError && <p className="mt-1 text-sm text-red-600">{pdfError}</p>}
// //       </div>

// //       <div className="flex items-center justify-end gap-3 pt-4">
// //         <button
// //           type="button"
// //           onClick={onSuccess}
// //           className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
// //         >
// //           إلغاء
// //         </button>
// //         <button
// //           type="submit"
// //           disabled={loading}
// //           className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
// //         >
// //           {loading ? 'جاري الحفظ...' : question ? 'تحديث' : 'إضافة'}
// //         </button>
// //       </div>
// //     </form>
// //   )
// // }


// import { useState, useEffect, useRef } from 'react'
// import { questionsAPI } from '../services/apiQuestions'
// import { subjectsAPI, chaptersAPI, gradesAPI, sectionsAPI } from '../services/api'
// import { useAuthStore } from '../store/authStore'
// import { supabase } from '../lib/supabase'
// import Table from '../components/Table'
// import Modal from '../components/Modal'
// import { Plus, Edit, Trash2, Filter, Upload, Sparkles, ChevronRight } from 'lucide-react'
// import { uploadQuestionPdf, validatePdfFile, FILE_LIMITS } from '../services/storageService'
// import type { Question, QuestionType, DifficultyLevel, Grade, Subject, Chapter } from '../types'

// // ── Semester Configuration ────────────────────────────────────────────────
// const SEMESTER_CONFIG = {
//   first: { label: 'الفصل الأول', color: 'from-blue-500 to-indigo-600', badge: 'bg-blue-50 text-blue-700' },
//   second: { label: 'الفصل الثاني', color: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-50 text-emerald-700' },
//   null: { label: 'الفصلان', color: 'from-gray-400 to-gray-500', badge: 'bg-gray-50 text-gray-600' },
// } as const

// type SemesterKey = 'first' | 'second' | null

// export default function QuestionBank() {
//   useAuthStore()
//   const [questions, setQuestions] = useState<Question[]>([])
//   const [grades, setGrades] = useState<Grade[]>([])
//   const [subjects, setSubjects] = useState<Subject[]>([])
//   const [loading, setLoading] = useState(true)
//   const [modalOpen, setModalOpen] = useState(false)
//   const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
//   const [deleteConfirm, setDeleteConfirm] = useState<Question | null>(null)

//   // ── Filters ──────────────────────────────────────────────────────────────
//   const [selectedGrade, setSelectedGrade] = useState<number | undefined>()
//   const [selectedSemester, setSelectedSemester] = useState<SemesterKey>(null)
//   const [typeFilter, setTypeFilter] = useState<string>('كل')
//   const [difficultyFilter, setDifficultyFilter] = useState<string>('كل')
//   const [skillFilter, setSkillFilter] = useState<string>('كل')

//   useEffect(() => {
//     loadGrades()
//   }, [])

//   useEffect(() => {
//     loadSubjects()
//   }, [selectedGrade, selectedSemester])

//   useEffect(() => {
//     loadQuestions()
//   }, [typeFilter, difficultyFilter, selectedGrade, selectedSemester, skillFilter])

//   const loadGrades = async () => {
//     try {
//       const data = await gradesAPI.getAll()
//       setGrades(data)
//       // اختر الصف الأول تلقائياً
//       if (data.length > 0) {
//         setSelectedGrade(data[0].id)
//       }
//     } catch (error) {
//       console.error('Error loading grades:', error)
//     }
//   }

//   const loadSubjects = async () => {
//     try {
//       if (!selectedGrade) {
//         setSubjects([])
//         return
//       }

//       const data = await subjectsAPI.getAll()
      
//       // فلترة المواد حسب الصف والترم
//       const filtered = data.filter(subject => {
//         // تحقق من أن المادة مرتبطة بهذا الصف
//         const isBoundToGrade = true // يتم التحقق من خلال section_subjects
        
//         // فلترة حسب الترم
//         if (selectedSemester === null) {
//           return isBoundToGrade // الفصلان معاً
//         }
//         return isBoundToGrade && (subject as any).semester === selectedSemester
//       })

//       setSubjects(filtered)
//     } catch (error) {
//       console.error('Error loading subjects:', error)
//     }
//   }

//   const loadQuestions = async () => {
//     try {
//       setLoading(true)

//       let query = supabase
//         .from('questions')
//         .select(`
//           *,
//           teachers ( full_name )
//         `)
//         .order('id', { ascending: false })

//       if (typeFilter !== 'كل') query = query.eq('question_type', typeFilter)
//       if (difficultyFilter !== 'كل') query = query.eq('difficulty_level', difficultyFilter)
//       if (skillFilter !== 'كل') query = query.eq('skill', skillFilter)

//       // فلترة حسب الصف والترم
//       if (selectedGrade && selectedSemester !== undefined) {
//         const subjectIds = subjects.map(s => s.id)
//         if (subjectIds.length > 0) {
//           query = query.in('subject_id', subjectIds)
//         } else {
//           setQuestions([])
//           return
//         }
//       }

//       const { data, error } = await query
//       if (error) throw error

//       const enriched = (data || []).map((q: any) => ({
//         ...q,
//         teacher_name: q.teachers?.full_name || null,
//       }))

//       setQuestions(enriched)
//     } catch (error) {
//       console.error('Error loading questions:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleDelete = async (question: Question) => {
//     try {
//       await questionsAPI.delete(question.id)
//       loadQuestions()
//       setDeleteConfirm(null)
//     } catch (error: any) {
//       alert(error.message || 'حدث خطأ أثناء حذف السؤال')
//     }
//   }

//   const getQuestionTypeLabel = (type: QuestionType) => {
//     const labels: Record<QuestionType, string> = {
//       multiple_choice: 'اختيار من متعدد',
//       true_false: 'صح وخطأ',
//       essay: 'مقالي',
//       fill_blank: 'فراغات',
//     }
//     return labels[type]
//   }

//   const getDifficultyLabel = (difficulty: DifficultyLevel) => {
//     const labels: Record<DifficultyLevel, string> = {
//       easy: 'سهل',
//       medium: 'متوسط',
//       hard: 'صعب',
//     }
//     return labels[difficulty]
//   }

//   const truncateText = (text: string, maxLength: number = 50) => {
//     return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
//   }

//   const columns = [
//     {
//       key: 'question_text',
//       label: 'نص السؤال',
//       render: (q: Question) => truncateText(q.question_text),
//     },
//     {
//       key: 'question_type',
//       label: 'النوع',
//       render: (q: Question) => getQuestionTypeLabel(q.question_type),
//     },
//     {
//       key: 'difficulty_level',
//       label: 'الصعوبة',
//       render: (q: Question) => getDifficultyLabel(q.difficulty_level),
//     },
//     {
//       key: 'subject',
//       label: 'المادة',
//       render: (q: Question) => {
//         const subject = subjects.find(s => s.id === q.subject_id)
//         return subject?.name || '—'
//       },
//     },
//     {
//       key: 'added_by',
//       label: 'أضافه',
//       render: (q: any) => {
//         if (q.teacher_name) {
//           return (
//             <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">
//               👨‍🏫 {q.teacher_name}
//             </span>
//           )
//         }
//         return (
//           <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold">
//             🛡️ الإدارة
//           </span>
//         )
//       },
//     },
//   ]

//   return (
//     <div className="space-y-6 w-full">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent mb-2">
//             بنك الأسئلة
//           </h1>
//           <p className="text-gray-600 text-lg">إضافة وإدارة الأسئلة حسب الصف والترم</p>
//         </div>
//         <button
//           onClick={() => {
//             setEditingQuestion(null)
//             setModalOpen(true)
//           }}
//           className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
//         >
//           <Plus size={20} />
//           <span>إضافة سؤال</span>
//         </button>
//       </div>

//       {/* ── Filters Section ──────────────────────────────────────────────── */}
//       <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 space-y-6">
//         {/* المرحلة 1: اختيار الصف الدراسي */}
//         <div>
//           <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
//             <span className="flex items-center justify-center w-6 h-6 bg-primary-100 text-primary-600 rounded-full text-xs font-bold">1</span>
//             <span>الصف الدراسي</span>
//             <span className="text-red-500">*</span>
//           </label>
//           <select
//             value={selectedGrade || ''}
//             onChange={(e) => {
//               setSelectedGrade(e.target.value ? Number(e.target.value) : undefined)
//               setSelectedSemester(null) // Reset semester
//             }}
//             className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium"
//           >
//             <option value="">اختر الصف الدراسي</option>
//             {grades.map((grade) => (
//               <option key={grade.id} value={grade.id}>
//                 {grade.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* المرحلة 2: اختيار الترم (يعتمد على اختيار الصف) */}
//         {selectedGrade && (
//           <div>
//             <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
//               <span className="flex items-center justify-center w-6 h-6 bg-primary-100 text-primary-600 rounded-full text-xs font-bold">2</span>
//               <span>الفصل الدراسي</span>
//               <span className="text-red-500">*</span>
//             </label>
//             <div className="grid grid-cols-3 gap-3">
//               {(['first', 'second', null] as SemesterKey[]).map((sem) => {
//                 const cfg = SEMESTER_CONFIG[sem ?? 'null']
//                 return (
//                   <button
//                     key={String(sem)}
//                     type="button"
//                     onClick={() => setSelectedSemester(sem)}
//                     className={`
//                       py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 border-2
//                       ${selectedSemester === sem
//                         ? `border-primary-500 bg-primary-50 text-primary-700 shadow-md`
//                         : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
//                       }
//                     `}
//                   >
//                     {cfg.label}
//                   </button>
//                 )
//               })}
//             </div>
//           </div>
//         )}

//         {/* الفلاتر الإضافية */}
//         {selectedGrade && selectedSemester !== undefined && (
//           <div>
//             <label className="block text-sm font-bold text-gray-800 mb-3">الفلاتر الإضافية:</label>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <label className="block text-xs font-medium text-gray-600 mb-2">نوع السؤال</label>
//                 <select
//                   value={typeFilter}
//                   onChange={(e) => setTypeFilter(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
//                 >
//                   <option value="كل">كل</option>
//                   <option value="multiple_choice">اختيار من متعدد</option>
//                   <option value="true_false">صح وخطأ</option>
//                   <option value="essay">مقالي</option>
//                   <option value="fill_blank">فراغات</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-xs font-medium text-gray-600 mb-2">الصعوبة</label>
//                 <select
//                   value={difficultyFilter}
//                   onChange={(e) => setDifficultyFilter(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
//                 >
//                   <option value="كل">كل</option>
//                   <option value="easy">سهل</option>
//                   <option value="medium">متوسط</option>
//                   <option value="hard">صعب</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-xs font-medium text-gray-600 mb-2">المهارة</label>
//                 <select
//                   value={skillFilter}
//                   onChange={(e) => setSkillFilter(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
//                 >
//                   <option value="كل">كل</option>
//                   <option value="remember">تذكر</option>
//                   <option value="understand">فهم</option>
//                   <option value="apply">تطبيق</option>
//                   <option value="analyze">تحليل</option>
//                 </select>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ── Results ──────────────────────────────────────────────────────── */}
//       {!selectedGrade || selectedSemester === undefined ? (
//         <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
//           <p className="text-blue-700 font-medium">اختر الصف والترم لعرض الأسئلة</p>
//         </div>
//       ) : (
//         <>
//           <div className="bg-white rounded-xl p-4 border border-gray-100">
//             <p className="text-sm text-gray-600">
//               عدد الأسئلة: <span className="font-bold text-primary-600">{questions.length}</span>
//             </p>
//           </div>

//           <Table
//             columns={columns}
//             data={questions}
//             loading={loading}
//             actions={(question) => (
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => {
//                     setEditingQuestion(question)
//                     setModalOpen(true)
//                   }}
//                   className="text-blue-600 hover:text-blue-800"
//                 >
//                   <Edit size={18} />
//                 </button>
//                 <button
//                   onClick={() => setDeleteConfirm(question)}
//                   className="text-red-600 hover:text-red-800"
//                 >
//                   <Trash2 size={18} />
//                 </button>
//               </div>
//             )}
//           />
//         </>
//       )}

//       {/* Modals */}
//       <Modal
//         isOpen={modalOpen}
//         onClose={() => {
//           setModalOpen(false)
//           setEditingQuestion(null)
//         }}
//         title={editingQuestion ? 'تحديث سؤال' : 'إضافة سؤال'}
//         size="lg"
//       >
//         <QuestionForm
//           question={editingQuestion}
//           grades={grades}
//           subjects={subjects}
//           selectedGradeId={selectedGrade}
//           selectedSemester={selectedSemester}
//           onSuccess={() => {
//             setModalOpen(false)
//             setEditingQuestion(null)
//             loadQuestions()
//           }}
//         />
//       </Modal>

//       <Modal
//         isOpen={!!deleteConfirm}
//         onClose={() => setDeleteConfirm(null)}
//         title="تأكيد الحذف"
//         size="sm"
//       >
//         <div className="space-y-4">
//           <p className="text-gray-700">هل أنت متأكد من حذف هذا السؤال؟</p>
//           <div className="flex items-center justify-end gap-3">
//             <button
//               onClick={() => setDeleteConfirm(null)}
//               className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//             >
//               إلغاء
//             </button>
//             <button
//               onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
//               className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//             >
//               نعم، احذف
//             </button>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   )
// }

// // ── QuestionForm Component ────────────────────────────────────────────────
// function QuestionForm({
//   question,
//   grades,
//   subjects,
//   selectedGradeId,
//   selectedSemester,
//   onSuccess,
// }: {
//   question: Question | null
//   grades: Grade[]
//   subjects: Subject[]
//   selectedGradeId?: number
//   selectedSemester?: SemesterKey
//   onSuccess: () => void
// }) {
//   const { admin } = useAuthStore()
//   const [formData, setFormData] = useState({
//     question_text: question?.question_text || '',
//     question_type: (question?.question_type || 'multiple_choice') as QuestionType,
//     difficulty_level: (question?.difficulty_level || 'easy') as DifficultyLevel,
//     grade_id: selectedGradeId || 0,
//     subject_id: question?.subject_id || 0,
//     chapter_id: (question as any)?.chapter_id || 0,
//     question_options: question?.question_options || null,
//     correct_answer: question?.correct_answer || '',
//     skill: (question as any)?.skill || '',
//     explanation: (question as any)?.explanation || '',
//     reference_page: (question as any)?.reference_page || '',
//   })
//   const [options, setOptions] = useState<string[]>(() => {
//     const opts = question?.question_options
//     if (!opts) return ['', '', '', '']
//     if ('A' in opts) return [opts['A'] || '', opts['B'] || '', opts['C'] || '', opts['D'] || '']
//     if ('options' in opts) return [...(opts.options as string[]), ...['','','','']].slice(0, 4)
//     return ['', '', '', '']
//   })
//   const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(0)
//   const [chapters, setChapters] = useState<Chapter[]>([])
//   const [chaptersLoading, setChaptersLoading] = useState(false)
//   const [pdfFile, setPdfFile] = useState<File | null>(null)
//   const [pdfError, setPdfError] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [skillLoading, setSkillLoading] = useState(false)
//   const pdfInputRef = useRef<HTMLInputElement>(null)

//   // ── تحديث الفصول عند تغيير المادة ────────────────────────────────────────
//   useEffect(() => {
//     const loadChapters = async () => {
//       if (!formData.subject_id) {
//         setChapters([])
//         setFormData(prev => ({ ...prev, chapter_id: 0 }))
//         return
//       }
//       try {
//         setChaptersLoading(true)
//         const data = await chaptersAPI.getBySubject(formData.subject_id)
//         setChapters(data)
//         if (!(question as any)?.chapter_id && data.length > 0) {
//           setFormData(prev => ({ ...prev, chapter_id: data[0].id }))
//         }
//       } catch (e) {
//         console.error('Error loading chapters:', e)
//         setChapters([])
//       } finally {
//         setChaptersLoading(false)
//       }
//     }
//     loadChapters()
//   }, [formData.subject_id])

//   const detectSkill = async () => {
//     const questionText = formData.question_text.trim()
//     if (!questionText) {
//       setError('اكتب نص السؤال أولاً')
//       return
//     }
//     setSkillLoading(true)
//     setError('')
//     try {
//       const { data, error: fnError } = await supabase.functions.invoke('detect-skill', {
//         body: { question_text: questionText },
//       })
//       if (fnError) throw new Error(fnError.message)
//       const skill = data?.skill ?? ''
//       const validSkills = ['remember', 'understand', 'apply', 'analyze']
//       if (skill && validSkills.includes(skill)) {
//         setFormData(prev => ({ ...prev, skill }))
//       } else {
//         setError('لم يتمكن النظام من تحديد المهارة — اختر يدويًا')
//       }
//     } catch (err: any) {
//       setError('فشل تحديد المهارة — تحقق من الاتصال')
//     } finally {
//       setSkillLoading(false)
//     }
//   }

//   const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     setPdfError('')
//     if (!file) {
//       setPdfFile(null)
//       return
//     }
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
//     setError('')

//     if (!formData.question_text.trim()) {
//       setError('نص السؤال إلزامي')
//       return
//     }

//     if (!formData.chapter_id) {
//       setError('يجب اختيار الفصل')
//       return
//     }

//     if (formData.question_type === 'multiple_choice') {
//       if (options.some(opt => !opt.trim())) {
//         setError('جميع الخيارات إلزامية')
//         return
//       }
//     }

//     setLoading(true)
//     try {
//       const questionData: any = {
//         question_text: formData.question_text,
//         question_type: formData.question_type,
//         difficulty_level: formData.difficulty_level,
//         subject_id: formData.subject_id,
//         chapter_id: formData.chapter_id,
//         status: 'approved',
//         created_by_admin: admin?.id || null,
//         created_by_teacher: null,
//         is_active: true,
//         skill: formData.skill || null,
//         explanation: formData.explanation.trim() || null,
//         reference_page: formData.reference_page.trim() || null,
//       }

//       if (formData.question_type === 'multiple_choice') {
//         questionData.question_options = {
//           A: options[0] || '',
//           B: options[1] || '',
//           C: options[2] || '',
//           D: options[3] || '',
//         }
//         const letters = ['A', 'B', 'C', 'D']
//         questionData.correct_answer = letters[correctOptionIndex] || 'A'
//       } else if (formData.question_type === 'true_false') {
//         questionData.question_options = { A: 'صحيح', B: 'خطأ' }
//         questionData.correct_answer = formData.correct_answer === 'خطأ' ? 'B' : 'A'
//       } else if (formData.question_type === 'fill_blank') {
//         questionData.correct_answer = formData.correct_answer
//         questionData.question_options = null
//       } else {
//         questionData.correct_answer = null
//         questionData.question_options = null
//       }

//       let questionId: number
//       if (question) {
//         await questionsAPI.update(question.id, questionData)
//         questionId = question.id
//       } else {
//         const created = await questionsAPI.create(questionData)
//         questionId = created.id
//       }

//       if (pdfFile) {
//         const { publicUrl, storagePath } = await uploadQuestionPdf(questionId, pdfFile)
//         await questionsAPI.update(questionId, {
//           pdf_url: publicUrl,
//           pdf_storage_path: storagePath,
//           pdf_filename: pdfFile.name,
//         })
//       }
//       onSuccess()
//     } catch (err: any) {
//       setError(err.message || 'حدث خطأ')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-5">
//       {error && (
//         <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
//           {error}
//         </div>
//       )}

//       {/* الصف الدراسي */}
//       <div>
//         <label className="block text-sm font-semibold text-gray-700 mb-2">
//           الصف الدراسي <span className="text-red-500">*</span>
//         </label>
//         <select
//           value={formData.grade_id}
//           onChange={(e) => setFormData({ ...formData, grade_id: Number(e.target.value), subject_id: 0, chapter_id: 0 })}
//           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
//           required
//         >
//           <option value={0} disabled>اختر الصف</option>
//           {grades.map((grade) => (
//             <option key={grade.id} value={grade.id}>
//               {grade.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* نص السؤال */}
//       <div>
//         <label className="block text-sm font-semibold text-gray-700 mb-2">
//           نص السؤال <span className="text-red-500">*</span>
//         </label>
//         <textarea
//           value={formData.question_text}
//           onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
//           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
//           rows={3}
//           required
//         />
//       </div>

//       {/* نوع السؤال */}
//       <div>
//         <label className="block text-sm font-semibold text-gray-700 mb-2">
//           نوع السؤال <span className="text-red-500">*</span>
//         </label>
//         <select
//           value={formData.question_type}
//           onChange={(e) => setFormData({ ...formData, question_type: e.target.value as QuestionType })}
//           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
//         >
//           <option value="multiple_choice">اختيار من متعدد</option>
//           <option value="true_false">صح وخطأ</option>
//           <option value="essay">مقالي</option>
//           <option value="fill_blank">فراغات</option>
//         </select>
//       </div>

//       {/* Multiple Choice Options */}
//       {formData.question_type === 'multiple_choice' && (
//         <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
//           <label className="block text-sm font-semibold text-gray-700">الخيارات <span className="text-red-500">*</span></label>
//           {options.map((option, index) => (
//             <div key={index} className="flex items-center gap-3">
//               <input
//                 type="radio"
//                 name="correct_option"
//                 checked={correctOptionIndex === index}
//                 onChange={() => setCorrectOptionIndex(index)}
//                 className="w-4 h-4 text-primary-600 cursor-pointer"
//               />
//               <input
//                 type="text"
//                 value={option}
//                 onChange={(e) => {
//                   const newOptions = [...options]
//                   newOptions[index] = e.target.value
//                   setOptions(newOptions)
//                 }}
//                 placeholder={`الخيار ${index + 1}`}
//                 className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
//                 required
//               />
//             </div>
//           ))}
//         </div>
//       )}

//       {/* True/False */}
//       {formData.question_type === 'true_false' && (
//         <div>
//           <label className="block text-sm font-semibold text-gray-700 mb-2">الإجابة الصحيحة <span className="text-red-500">*</span></label>
//           <div className="flex items-center gap-4">
//             <label className="flex items-center gap-2 cursor-pointer">
//               <input
//                 type="radio"
//                 name="true_false"
//                 checked={['صحيح','A','True','true'].includes(formData.correct_answer)}
//                 onChange={() => setFormData({ ...formData, correct_answer: 'صحيح' })}
//                 className="w-4 h-4"
//               />
//               <span>صحيح</span>
//             </label>
//             <label className="flex items-center gap-2 cursor-pointer">
//               <input
//                 type="radio"
//                 name="true_false"
//                 checked={['خطأ','B','False','false'].includes(formData.correct_answer)}
//                 onChange={() => setFormData({ ...formData, correct_answer: 'خطأ' })}
//                 className="w-4 h-4"
//               />
//               <span>خطأ</span>
//             </label>
//           </div>
//         </div>
//       )}

//       {/* Fill Blank */}
//       {formData.question_type === 'fill_blank' && (
//         <div>
//           <label className="block text-sm font-semibold text-gray-700 mb-2">الإجابة الصحيحة <span className="text-red-500">*</span></label>
//           <input
//             type="text"
//             value={formData.correct_answer}
//             onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
//             className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
//             required
//           />
//         </div>
//       )}

//       {/* الصعوبة والمادة */}
//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-semibold text-gray-700 mb-2">الصعوبة <span className="text-red-500">*</span></label>
//           <select
//             value={formData.difficulty_level}
//             onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value as DifficultyLevel })}
//             className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
//           >
//             <option value="easy">سهل</option>
//             <option value="medium">متوسط</option>
//             <option value="hard">صعب</option>
//           </select>
//         </div>

//         <div>
//           <label className="block text-sm font-semibold text-gray-700 mb-2">المادة <span className="text-red-500">*</span></label>
//           <select
//             value={formData.subject_id}
//             onChange={(e) => setFormData({ ...formData, subject_id: Number(e.target.value), chapter_id: 0 })}
//             className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
//             required
//           >
//             <option value={0} disabled>اختر المادة</option>
//             {subjects.map((subject) => (
//               <option key={subject.id} value={subject.id}>
//                 {subject.name} {subject.semester ? `(${subject.semester === 'first' ? 'الأول' : 'الثاني'})` : '(الفصلان)'}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* الفصل */}
//       <div>
//         <label className="block text-sm font-semibold text-gray-700 mb-2">الفصل <span className="text-red-500">*</span></label>
//         <select
//           value={formData.chapter_id}
//           onChange={(e) => setFormData({ ...formData, chapter_id: Number(e.target.value) })}
//           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
//           required
//           disabled={!formData.subject_id || chaptersLoading}
//         >
//           <option value={0} disabled>
//             {chaptersLoading ? 'جاري التحميل...' : !formData.subject_id ? 'اختر المادة أولاً' : 'اختر الفصل'}
//           </option>
//           {chapters.map((chapter) => (
//             <option key={chapter.id} value={chapter.id}>
//               {chapter.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* المهارة والمرجع */}
//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-semibold text-gray-700 mb-2">مهارة بلوم</label>
//           <div className="flex gap-2">
//             <select
//               value={formData.skill}
//               onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
//               className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
//             >
//               <option value="">— اختر —</option>
//               <option value="remember">تذكر</option>
//               <option value="understand">فهم</option>
//               <option value="apply">تطبيق</option>
//               <option value="analyze">تحليل</option>
//             </select>
//             <button
//               type="button"
//               onClick={detectSkill}
//               disabled={skillLoading}
//               className="px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:shadow-md disabled:opacity-50 flex items-center gap-2"
//             >
//               <Sparkles size={16} />
//             </button>
//           </div>
//         </div>

//         <div>
//           <label className="block text-sm font-semibold text-gray-700 mb-2">رقم الصفحة</label>
//           <input
//             type="text"
//             value={formData.reference_page}
//             onChange={(e) => setFormData({ ...formData, reference_page: e.target.value })}
//             placeholder="مثال: صفحة 42"
//             className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
//           />
//         </div>
//       </div>

//       {/* الشرح */}
//       <div>
//         <label className="block text-sm font-semibold text-gray-700 mb-2">شرح الإجابة</label>
//         <textarea
//           value={formData.explanation}
//           onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
//           placeholder="اشرح الإجابة الصحيحة..."
//           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
//           rows={3}
//         />
//       </div>

//       {/* PDF */}
//       <div>
//         <label className="block text-sm font-semibold text-gray-700 mb-2">ملف PDF (اختياري)</label>
//         <input ref={pdfInputRef} type="file" accept="application/pdf" onChange={handlePdfChange} className="hidden" />
//         <button
//           type="button"
//           onClick={() => pdfInputRef.current?.click()}
//           className="flex items-center gap-2 px-4 py-2 border-2 border-primary-500 text-primary-600 rounded-xl hover:bg-primary-50 font-medium"
//         >
//           <Upload size={18} />
//           {pdfFile ? pdfFile.name : 'اختيار ملف'}
//         </button>
//         {pdfError && <p className="mt-1 text-sm text-red-600">{pdfError}</p>}
//       </div>

//       {/* Submit */}
//       <div className="flex items-center justify-end gap-3 pt-4 border-t">
//         <button type="button" onClick={onSuccess} className="px-5 py-2.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium">
//           إلغاء
//         </button>
//         <button type="submit" disabled={loading} className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl hover:shadow-lg font-medium disabled:opacity-50">
//           {loading ? 'جاري...' : question ? 'تحديث' : 'إضافة'}
//         </button>
//       </div>
//     </form>
//   )
// }











import { useState, useEffect, useRef } from 'react'
import { questionsAPI } from '../services/apiQuestions'
import { subjectsAPI, chaptersAPI, gradesAPI, sectionsAPI, sectionSubjectsAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import Table from '../components/Table'
import Modal from '../components/Modal'
import { Plus, Edit, Trash2, Filter, Upload, Sparkles, ChevronRight } from 'lucide-react'
import { uploadQuestionPdf, validatePdfFile, FILE_LIMITS } from '../services/storageService'
import type { Question, QuestionType, DifficultyLevel, Grade, Subject, Chapter } from '../types'

// ── Semester Configuration ────────────────────────────────────────────────
const SEMESTER_CONFIG = {
  first: { label: 'الفصل الأول', color: 'from-blue-500 to-indigo-600', badge: 'bg-blue-50 text-blue-700' },
  second: { label: 'الفصل الثاني', color: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-50 text-emerald-700' },
  null: { label: 'الفصلان', color: 'from-gray-400 to-gray-500', badge: 'bg-gray-50 text-gray-600' },
} as const

type SemesterKey = 'first' | 'second' | null

export default function QuestionBank() {
  useAuthStore()
  const [questions, setQuestions] = useState<Question[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Question | null>(null)

  // ── Filters ──────────────────────────────────────────────────────────────
  const [selectedGrade, setSelectedGrade] = useState<number | undefined>()
  const [selectedSemester, setSelectedSemester] = useState<SemesterKey>(null)
  const [typeFilter, setTypeFilter] = useState<string>('كل')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('كل')
  const [skillFilter, setSkillFilter] = useState<string>('كل')

  useEffect(() => {
    loadGrades()
  }, [])

  useEffect(() => {
    loadSubjects()
  }, [selectedGrade, selectedSemester])

  useEffect(() => {
    loadQuestions()
  }, [typeFilter, difficultyFilter, selectedGrade, selectedSemester, skillFilter])

  const loadGrades = async () => {
    try {
      const data = await gradesAPI.getAll()
      setGrades(data)
      // اختر الصف الأول تلقائياً
      if (data.length > 0) {
        setSelectedGrade(data[0].id)
      }
    } catch (error) {
      console.error('Error loading grades:', error)
    }
  }

  const loadSubjects = async () => {
    try {
      if (!selectedGrade) {
        setSubjects([])
        return
      }

      // ✅ جلب المواد المرتبطة بالصف والترم من section_subjects
      const ssList = await sectionSubjectsAPI.getByGradeAndSemester(selectedGrade, selectedSemester)
      const subjectIds = [...new Set(ssList.map((ss: any) => ss.subject_id))]

      if (subjectIds.length === 0) {
        setSubjects([])
        return
      }

      const allSubjects = await subjectsAPI.getAll()
      const filtered = allSubjects.filter(s => subjectIds.includes(s.id))

      setSubjects(filtered)
    } catch (error) {
      console.error('Error loading subjects:', error)
    }
  }

  const loadQuestions = async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('questions')
        .select(`
          *,
          teachers ( full_name )
        `)
        .order('id', { ascending: false })

      if (typeFilter !== 'كل') query = query.eq('question_type', typeFilter)
      if (difficultyFilter !== 'كل') query = query.eq('difficulty_level', difficultyFilter)
      if (skillFilter !== 'كل') query = query.eq('skill', skillFilter)

      // فلترة حسب الصف والترم
      if (selectedGrade && selectedSemester !== undefined && subjects.length > 0) {
        const subjectIds = subjects.map(s => s.id)
        if (subjectIds.length > 0) {
          query = query.in('subject_id', subjectIds)
        } else {
          setQuestions([])
          return
        }
      }

      const { data, error } = await query
      if (error) throw error

      const enriched = (data || []).map((q: any) => ({
        ...q,
        teacher_name: q.teachers?.full_name || null,
      }))

      setQuestions(enriched)
    } catch (error) {
      console.error('Error loading questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (question: Question) => {
    try {
      await questionsAPI.delete(question.id)
      loadQuestions()
      setDeleteConfirm(null)
    } catch (error: any) {
      alert(error.message || 'حدث خطأ أثناء حذف السؤال')
    }
  }

  const getQuestionTypeLabel = (type: QuestionType) => {
    const labels: Record<QuestionType, string> = {
      multiple_choice: 'اختيار من متعدد',
      true_false: 'صح وخطأ',
      essay: 'مقالي',
      fill_blank: 'فراغات',
    }
    return labels[type]
  }

  const getDifficultyLabel = (difficulty: DifficultyLevel) => {
    const labels: Record<DifficultyLevel, string> = {
      easy: 'سهل',
      medium: 'متوسط',
      hard: 'صعب',
    }
    return labels[difficulty]
  }

  const truncateText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  const columns = [
    {
      key: 'question_text',
      label: 'نص السؤال',
      render: (q: Question) => truncateText(q.question_text),
    },
    {
      key: 'question_type',
      label: 'النوع',
      render: (q: Question) => getQuestionTypeLabel(q.question_type),
    },
    {
      key: 'difficulty_level',
      label: 'الصعوبة',
      render: (q: Question) => getDifficultyLabel(q.difficulty_level),
    },
    {
      key: 'subject',
      label: 'المادة',
      render: (q: Question) => {
        const subject = subjects.find(s => s.id === q.subject_id)
        return subject?.name || '—'
      },
    },
    {
      key: 'added_by',
      label: 'أضافه',
      render: (q: any) => {
        if (q.teacher_name) {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">
              👨‍🏫 {q.teacher_name}
            </span>
          )
        }
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold">
            🛡️ الإدارة
          </span>
        )
      },
    },
  ]

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent mb-2">
            بنك الأسئلة
          </h1>
          <p className="text-gray-600 text-lg">إضافة وإدارة الأسئلة حسب الصف والترم</p>
        </div>
        <button
          onClick={() => {
            setEditingQuestion(null)
            setModalOpen(true)
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
        >
          <Plus size={20} />
          <span>إضافة سؤال</span>
        </button>
      </div>

      {/* ── Filters Section ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 space-y-6">
        {/* المرحلة 1: اختيار الصف الدراسي */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 bg-primary-100 text-primary-600 rounded-full text-xs font-bold">1</span>
            <span>الصف الدراسي</span>
            <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedGrade || ''}
            onChange={(e) => {
              setSelectedGrade(e.target.value ? Number(e.target.value) : undefined)
              setSelectedSemester(null) // Reset semester
            }}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium"
          >
            <option value="">اختر الصف الدراسي</option>
            {grades.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.name}
              </option>
            ))}
          </select>
        </div>

        {/* المرحلة 2: اختيار الترم (يعتمد على اختيار الصف) */}
        {selectedGrade && (
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 bg-primary-100 text-primary-600 rounded-full text-xs font-bold">2</span>
              <span>الفصل الدراسي</span>
              <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['first', 'second', null] as SemesterKey[]).map((sem) => {
                const cfg = SEMESTER_CONFIG[sem ?? 'null']
                return (
                  <button
                    key={String(sem)}
                    type="button"
                    onClick={() => setSelectedSemester(sem)}
                    className={`
                      py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 border-2
                      ${selectedSemester === sem
                        ? `border-primary-500 bg-primary-50 text-primary-700 shadow-md`
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }
                    `}
                  >
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* الفلاتر الإضافية */}
        {selectedGrade && selectedSemester !== undefined && (
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-3">الفلاتر الإضافية:</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">نوع السؤال</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="كل">كل</option>
                  <option value="multiple_choice">اختيار من متعدد</option>
                  <option value="true_false">صح وخطأ</option>
                  <option value="essay">مقالي</option>
                  <option value="fill_blank">فراغات</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">الصعوبة</label>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="كل">كل</option>
                  <option value="easy">سهل</option>
                  <option value="medium">متوسط</option>
                  <option value="hard">صعب</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">المهارة</label>
                <select
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="كل">كل</option>
                  <option value="remember">تذكر</option>
                  <option value="understand">فهم</option>
                  <option value="apply">تطبيق</option>
                  <option value="analyze">تحليل</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {!selectedGrade || selectedSemester === undefined ? (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <p className="text-blue-700 font-medium">اختر الصف والترم لعرض الأسئلة</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-600">
              عدد الأسئلة: <span className="font-bold text-primary-600">{questions.length}</span>
            </p>
          </div>

          <Table
            columns={columns}
            data={questions}
            loading={loading}
            actions={(question) => (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingQuestion(question)
                    setModalOpen(true)
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => setDeleteConfirm(question)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          />
        </>
      )}

      {/* Modals */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingQuestion(null)
        }}
        title={editingQuestion ? 'تحديث سؤال' : 'إضافة سؤال'}
        size="lg"
      >
        <QuestionForm
          question={editingQuestion}
          grades={grades}
          subjects={subjects}
          selectedGradeId={selectedGrade}
          selectedSemester={selectedSemester}
          onSuccess={() => {
            setModalOpen(false)
            setEditingQuestion(null)
            loadQuestions()
          }}
        />
      </Modal>

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="تأكيد الحذف"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">هل أنت متأكد من حذف هذا السؤال؟</p>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              نعم، احذف
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ── QuestionForm Component ────────────────────────────────────────────────
function QuestionForm({
  question,
  grades,
  subjects,
  selectedGradeId,
  selectedSemester,
  onSuccess,
}: {
  question: Question | null
  grades: Grade[]
  subjects: Subject[]
  selectedGradeId?: number
  selectedSemester?: SemesterKey
  onSuccess: () => void
}) {
  const { admin } = useAuthStore()
  const [formData, setFormData] = useState({
    question_text: question?.question_text || '',
    question_type: (question?.question_type || 'multiple_choice') as QuestionType,
    difficulty_level: (question?.difficulty_level || 'easy') as DifficultyLevel,
    grade_id: selectedGradeId || 0,
    subject_id: question?.subject_id || 0,
    chapter_id: (question as any)?.chapter_id || 0,
    question_options: question?.question_options || null,
    correct_answer: question?.correct_answer || '',
    skill: (question as any)?.skill || '',
    explanation: (question as any)?.explanation || '',
    reference_page: (question as any)?.reference_page || '',
  })
  const [options, setOptions] = useState<string[]>(() => {
    const opts = question?.question_options
    if (!opts) return ['', '', '', '']
    if ('A' in opts) return [opts['A'] || '', opts['B'] || '', opts['C'] || '', opts['D'] || '']
    if ('options' in opts) return [...(opts.options as string[]), ...['','','','']].slice(0, 4)
    return ['', '', '', '']
  })
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(0)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [chaptersLoading, setChaptersLoading] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfError, setPdfError] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [skillLoading, setSkillLoading] = useState(false)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  // ── تحديث الفصول عند تغيير المادة ────────────────────────────────────────
  useEffect(() => {
    const loadChapters = async () => {
      if (!formData.subject_id) {
        setChapters([])
        setFormData(prev => ({ ...prev, chapter_id: 0 }))
        return
      }
      try {
        setChaptersLoading(true)
        const data = await chaptersAPI.getBySubject(formData.subject_id)
        setChapters(data)
        if (!(question as any)?.chapter_id && data.length > 0) {
          setFormData(prev => ({ ...prev, chapter_id: data[0].id }))
        }
      } catch (e) {
        console.error('Error loading chapters:', e)
        setChapters([])
      } finally {
        setChaptersLoading(false)
      }
    }
    loadChapters()
  }, [formData.subject_id])

  const detectSkill = async () => {
    const questionText = formData.question_text.trim()
    if (!questionText) {
      setError('اكتب نص السؤال أولاً')
      return
    }
    setSkillLoading(true)
    setError('')
    try {
      const { data, error: fnError } = await supabase.functions.invoke('detect-skill', {
        body: { question_text: questionText },
      })
      if (fnError) throw new Error(fnError.message)
      const skill = data?.skill ?? ''
      const validSkills = ['remember', 'understand', 'apply', 'analyze']
      if (skill && validSkills.includes(skill)) {
        setFormData(prev => ({ ...prev, skill }))
      } else {
        setError('لم يتمكن النظام من تحديد المهارة — اختر يدويًا')
      }
    } catch (err: any) {
      setError('فشل تحديد المهارة — تحقق من الاتصال')
    } finally {
      setSkillLoading(false)
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
    setError('')

    if (!formData.question_text.trim()) {
      setError('نص السؤال إلزامي')
      return
    }

    if (!formData.chapter_id) {
      setError('يجب اختيار الفصل')
      return
    }

    if (formData.question_type === 'multiple_choice') {
      if (options.some(opt => !opt.trim())) {
        setError('جميع الخيارات إلزامية')
        return
      }
    }

    setLoading(true)
    try {
      const questionData: any = {
        question_text: formData.question_text,
        question_type: formData.question_type,
        difficulty_level: formData.difficulty_level,
        subject_id: formData.subject_id,
        chapter_id: formData.chapter_id,
        status: 'approved',
        created_by_admin: admin?.id || null,
        created_by_teacher: null,
        is_active: true,
        skill: formData.skill || null,
        explanation: formData.explanation.trim() || null,
        reference_page: formData.reference_page.trim() || null,
      }

      if (formData.question_type === 'multiple_choice') {
        questionData.question_options = {
          A: options[0] || '',
          B: options[1] || '',
          C: options[2] || '',
          D: options[3] || '',
        }
        const letters = ['A', 'B', 'C', 'D']
        questionData.correct_answer = letters[correctOptionIndex] || 'A'
      } else if (formData.question_type === 'true_false') {
        questionData.question_options = { A: 'صحيح', B: 'خطأ' }
        questionData.correct_answer = formData.correct_answer === 'خطأ' ? 'B' : 'A'
      } else if (formData.question_type === 'fill_blank') {
        questionData.correct_answer = formData.correct_answer
        questionData.question_options = null
      } else {
        questionData.correct_answer = null
        questionData.question_options = null
      }

      let questionId: number
      if (question) {
        await questionsAPI.update(question.id, questionData)
        questionId = question.id
      } else {
        const created = await questionsAPI.create(questionData)
        questionId = created.id
      }

      if (pdfFile) {
        const { publicUrl, storagePath } = await uploadQuestionPdf(questionId, pdfFile)
        await questionsAPI.update(questionId, {
          pdf_url: publicUrl,
          pdf_storage_path: storagePath,
          pdf_filename: pdfFile.name,
        })
      }
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* الصف الدراسي */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          الصف الدراسي <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.grade_id}
          onChange={(e) => setFormData({ ...formData, grade_id: Number(e.target.value), subject_id: 0, chapter_id: 0 })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          required
        >
          <option value={0} disabled>اختر الصف</option>
          {grades.map((grade) => (
            <option key={grade.id} value={grade.id}>
              {grade.name}
            </option>
          ))}
        </select>
      </div>

      {/* نص السؤال */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          نص السؤال <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.question_text}
          onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          rows={3}
          required
        />
      </div>

      {/* نوع السؤال */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          نوع السؤال <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.question_type}
          onChange={(e) => setFormData({ ...formData, question_type: e.target.value as QuestionType })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
        >
          <option value="multiple_choice">اختيار من متعدد</option>
          <option value="true_false">صح وخطأ</option>
          <option value="essay">مقالي</option>
          <option value="fill_blank">فراغات</option>
        </select>
      </div>

      {/* Multiple Choice Options */}
      {formData.question_type === 'multiple_choice' && (
        <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
          <label className="block text-sm font-semibold text-gray-700">الخيارات <span className="text-red-500">*</span></label>
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="radio"
                name="correct_option"
                checked={correctOptionIndex === index}
                onChange={() => setCorrectOptionIndex(index)}
                className="w-4 h-4 text-primary-600 cursor-pointer"
              />
              <input
                type="text"
                value={option}
                onChange={(e) => {
                  const newOptions = [...options]
                  newOptions[index] = e.target.value
                  setOptions(newOptions)
                }}
                placeholder={`الخيار ${index + 1}`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
          ))}
        </div>
      )}

      {/* True/False */}
      {formData.question_type === 'true_false' && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">الإجابة الصحيحة <span className="text-red-500">*</span></label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="true_false"
                checked={['صحيح','A','True','true'].includes(formData.correct_answer)}
                onChange={() => setFormData({ ...formData, correct_answer: 'صحيح' })}
                className="w-4 h-4"
              />
              <span>صحيح</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="true_false"
                checked={['خطأ','B','False','false'].includes(formData.correct_answer)}
                onChange={() => setFormData({ ...formData, correct_answer: 'خطأ' })}
                className="w-4 h-4"
              />
              <span>خطأ</span>
            </label>
          </div>
        </div>
      )}

      {/* Fill Blank */}
      {formData.question_type === 'fill_blank' && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">الإجابة الصحيحة <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={formData.correct_answer}
            onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>
      )}

      {/* الصعوبة والمادة */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">الصعوبة <span className="text-red-500">*</span></label>
          <select
            value={formData.difficulty_level}
            onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value as DifficultyLevel })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
          >
            <option value="easy">سهل</option>
            <option value="medium">متوسط</option>
            <option value="hard">صعب</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">المادة <span className="text-red-500">*</span></label>
          <select
            value={formData.subject_id}
            onChange={(e) => setFormData({ ...formData, subject_id: Number(e.target.value), chapter_id: 0 })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value={0} disabled>اختر المادة</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* الفصل */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">الفصل <span className="text-red-500">*</span></label>
        <select
          value={formData.chapter_id}
          onChange={(e) => setFormData({ ...formData, chapter_id: Number(e.target.value) })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
          required
          disabled={!formData.subject_id || chaptersLoading}
        >
          <option value={0} disabled>
            {chaptersLoading ? 'جاري التحميل...' : !formData.subject_id ? 'اختر المادة أولاً' : 'اختر الفصل'}
          </option>
          {chapters.map((chapter) => (
            <option key={chapter.id} value={chapter.id}>
              {chapter.name}
            </option>
          ))}
        </select>
      </div>

      {/* المهارة والمرجع */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">مهارة بلوم</label>
          <div className="flex gap-2">
            <select
              value={formData.skill}
              onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
            >
              <option value="">— اختر —</option>
              <option value="remember">تذكر</option>
              <option value="understand">فهم</option>
              <option value="apply">تطبيق</option>
              <option value="analyze">تحليل</option>
            </select>
            <button
              type="button"
              onClick={detectSkill}
              disabled={skillLoading}
              className="px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              <Sparkles size={16} />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">رقم الصفحة</label>
          <input
            type="text"
            value={formData.reference_page}
            onChange={(e) => setFormData({ ...formData, reference_page: e.target.value })}
            placeholder="مثال: صفحة 42"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* الشرح */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">شرح الإجابة</label>
        <textarea
          value={formData.explanation}
          onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
          placeholder="اشرح الإجابة الصحيحة..."
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
          rows={3}
        />
      </div>

      {/* PDF */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">ملف PDF (اختياري)</label>
        <input ref={pdfInputRef} type="file" accept="application/pdf" onChange={handlePdfChange} className="hidden" />
        <button
          type="button"
          onClick={() => pdfInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 border-2 border-primary-500 text-primary-600 rounded-xl hover:bg-primary-50 font-medium"
        >
          <Upload size={18} />
          {pdfFile ? pdfFile.name : 'اختيار ملف'}
        </button>
        {pdfError && <p className="mt-1 text-sm text-red-600">{pdfError}</p>}
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <button type="button" onClick={onSuccess} className="px-5 py-2.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium">
          إلغاء
        </button>
        <button type="submit" disabled={loading} className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl hover:shadow-lg font-medium disabled:opacity-50">
          {loading ? 'جاري...' : question ? 'تحديث' : 'إضافة'}
        </button>
      </div>
    </form>
  )
}