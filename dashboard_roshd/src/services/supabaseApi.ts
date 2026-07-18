
// import { supabase, setUserContext } from '../lib/supabase'
// import { parseRowDates, parseRowsDates } from '../lib/supabaseHelpers'
// import type {
//   Admin, Teacher, Student, Parent, Grade, Semester, Section, Subject,
//   SectionSubject, Question, Exam, ExamQuestion, ExamResult, Attendance,
//   Message, Report, PendingContent, SchoolSettings,
//   ParentStudent, ApprovalStatus, Chapter
// } from '../types'

// // =====================================================
// // Helper: Execute query with user context
// // =====================================================
// async function withUserContext<T>(
//   userId: number | null,
//   userType: 'admin' | 'teacher' | 'student' | 'parent' | null,
//   fn: () => Promise<T>
// ): Promise<T> {
//   if (userId && userType) {
//     await setUserContext(userId, userType)
//   }
//   return fn()
// }

// // =====================================================
// // AUTH API
// // =====================================================
// export const authSupabaseAPI = {
//   // Login is handled in authStore.ts
// }

// // =====================================================
// // SCHOOL SETTINGS API
// // =====================================================
// export const schoolSettingsSupabaseAPI = {
//   /** Public fetch (no auth) - for Login page and Layout header */
//   getPublic: async (): Promise<Record<string, unknown>> => {
//     const { data, error } = await supabase
//       .from('school_settings')
//       .select('*')
//       .single()
//     if (error) throw error
//     return parseRowDates(data || {}) as any
//   },

//   get: async (userId: number, userType: 'admin'): Promise<SchoolSettings> => {
//     return withUserContext(userId, userType, async () => {
//       const { data, error } = await supabase
//         .from('school_settings')
//         .select('*')
//         .single()
//       if (error) throw error
//       return parseRowDates(data || {}) as SchoolSettings
//     })
//   },

//   update: async (data: Partial<SchoolSettings>, userId: number, userType: 'admin'): Promise<SchoolSettings> => {
//     return withUserContext(userId, userType, async () => {
//       const { error } = await supabase
//         .from('school_settings')
//         .update({ ...data, updated_at: new Date().toISOString() })
//         .eq('id', 1)

//       if (error) throw error

//       // Return updated data
//       const { data: updated, error: fetchError } = await supabase
//         .from('school_settings')
//         .select('*')
//         .single()

//       if (fetchError) throw fetchError
//       return parseRowDates(updated || {}) as SchoolSettings
//     })
//   },
// }

// // =====================================================
// // ADMINS API
// // =====================================================
// export const adminsSupabaseAPI = {
//   getAll: async (userId: number, userType: 'admin'): Promise<Admin[]> => {
//     return withUserContext(userId, userType, async () => {
//       const { data, error } = await supabase
//         .from('admins')
//         .select('*')
//         .is('deleted_at', null)
//         .order('created_at', { ascending: false })

//       if (error) throw error
//       return parseRowsDates((data || []).map((admin: any) => ({ ...admin, password_hash: '' }))) as Admin[]
//     })
//   },

//   getById: async (adminId: number, userId: number, userType: 'admin'): Promise<Admin> => {
//     const { data: rows, error } = await supabase.rpc('get_admin_by_id_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//       p_admin_id: adminId,
//     })
//     if (error) throw error
//     const row = Array.isArray(rows) ? rows[0] : rows
//     if (!row) throw new Error('المسؤول غير موجود')
//     return parseRowDates({ ...row, password_hash: '' }) as Admin
//   },

//   updateProfileImage: async (
//     adminId: number,
//     profile_image_url: string,
//     profile_image_storage_path: string,
//     userId: number,
//     userType: 'admin'
//   ): Promise<Admin> => {
//     const { data: rows, error } = await supabase.rpc('update_admin_profile_image_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//       p_admin_id: adminId,
//       p_profile_image_url: profile_image_url,
//       p_profile_image_storage_path: profile_image_storage_path,
//     })
//     if (error) throw error
//     const row = Array.isArray(rows) ? rows[0] : rows
//     if (!row) throw new Error('المسؤول غير موجود أو لا يسمح بتحديث الصورة')
//     return parseRowDates({ ...row, password_hash: '' }) as Admin
//   },

//   updatePassword: async (
//     adminId: number,
//     currentPassword: string,
//     newPassword: string,
//     userId: number,
//     userType: 'admin'
//   ): Promise<void> => {
//     return withUserContext(userId, userType, async () => {
//       // Get current admin
//       const { data: admin, error: fetchError } = await supabase
//         .from('admins')
//         .select('password_hash')
//         .eq('id', adminId)
//         .single()

//       if (fetchError || !admin) throw new Error('المسؤول غير موجود')

//       // Verify current password
//       const { data: verified, error: verifyError } = await supabase.rpc('verify_password', {
//         p_password_hash: admin.password_hash,
//         p_password: currentPassword,
//       })

//       if (verifyError || !verified) {
//         throw new Error('كلمة السر الحالية غير صحيحة')
//       }

//       // Hash new password (using Supabase function or client-side)
//       // Note: You might need to create a hash_password function in Supabase
//       // For now, we'll use a workaround
//       const { data: newHash, error: hashError } = await supabase.rpc('hash_password', {
//         p_password: newPassword,
//       })

//       if (hashError) {
//         // Fallback: You'll need to implement password hashing
//         throw new Error('خطأ في تشفير كلمة السر الجديدة')
//       }

//       // Update password
//       const { error: updateError } = await supabase
//         .from('admins')
//         .update({
//           password_hash: newHash,
//           updated_at: new Date().toISOString(),
//         })
//         .eq('id', adminId)

//       if (updateError) throw updateError
//     })
//   },
// }

// // =====================================================
// // TEACHERS API
// // =====================================================
// export const teachersSupabaseAPI = {
//   getAll: async (
//     userId: number,
//     userType: 'admin' | 'teacher',
//     params?: { search?: string; sortBy?: string }
//   ): Promise<Teacher[]> => {
//     const { data, error } = await supabase.rpc('get_teachers_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//       p_search: params?.search || null,
//       p_sort_by: params?.sortBy || 'created_at',
//     })
//     if (error) throw error
//     return parseRowsDates((data || []).map((t: Record<string, unknown>) => ({ ...t, password_hash: '' }))) as unknown as Teacher[]
//   },

//   getById: async (id: number, userId: number, userType: 'admin' | 'teacher'): Promise<Teacher> => {
//     const { data, error } = await supabase.rpc('get_teacher_by_id_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//       p_id: id,
//     })
//     if (error) throw new Error('المعلم غير موجود')
//     const row = Array.isArray(data) ? data[0] : data
//     if (!row) throw new Error('المعلم غير موجود')
//     return parseRowDates({ ...row, password_hash: '' }) as Teacher
//   },

//   create: async (
//     data: Omit<Teacher, 'id' | 'teacher_code' | 'created_at' | 'updated_at' | 'deleted_at' | 'deleted_by'>,
//     userId: number,
//     userType: 'admin'
//   ): Promise<Teacher> => {
//     const rawPassword = (data.password_hash && String(data.password_hash).trim()) ? data.password_hash : '123456'
//     const { data: hashedPassword, error: hashError } = await supabase.rpc('hash_password', {
//       p_password: rawPassword,
//     })
//     if (hashError) throw new Error('خطأ في تشفير كلمة السر')
//     const payload = {
//       full_name: data.full_name,
//       phone_number: data.phone_number ?? '',
//       email: data.email ?? null,
//       password_hash: hashedPassword || rawPassword,
//       is_active: data.is_active ?? true,
//     }
//     const { data: rows, error } = await supabase.rpc('insert_teacher_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//       p_payload: payload,
//     })
//     if (error) throw error
//     const row = Array.isArray(rows) ? rows[0] : rows
//     if (!row) throw new Error('فشل إضافة المعلم')
//     return parseRowDates({ ...row, password_hash: '' }) as Teacher
//   },

//   update: async (
//     id: number,
//     data: Partial<Teacher>,
//     userId: number,
//     userType: 'admin'
//   ): Promise<Teacher> => {
//     const payload: Record<string, unknown> = {}
//     if (data.full_name !== undefined) payload.full_name = data.full_name
//     if (data.phone_number !== undefined) payload.phone_number = data.phone_number
//     if (data.email !== undefined) payload.email = data.email
//     if (data.is_active !== undefined) payload.is_active = data.is_active
//     const { data: rows, error } = await supabase.rpc('update_teacher_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//       p_id: id,
//       p_payload: payload,
//     })
//     if (error) throw error
//     const row = Array.isArray(rows) ? rows[0] : rows
//     if (!row) throw new Error('المعلم غير موجود')
//     return parseRowDates({ ...row, password_hash: '' }) as Teacher
//   },

//   delete: async (id: number, deletedBy: number, userId: number, userType: 'admin'): Promise<void> => {
//   const { error } = await supabase.rpc('delete_teacher_with_context', {
//     p_user_id: userId,
//     p_user_type: userType,
//     p_teacher_id: id,
//     p_deleted_by: deletedBy,
//   })
//   if (error) throw new Error(error.message)
// },
// }

// // =====================================================
// // GRADES API
// // =====================================================
// export const gradesSupabaseAPI = {
//   getAll: async (userId: number, userType: 'admin' | 'teacher' | 'student' | 'parent'): Promise<Grade[]> => {
//     const { data, error } = await supabase.rpc('get_grades_with_context', { p_user_id: userId, p_user_type: userType })
//     if (error) throw error
//     return parseRowsDates(data || []) as unknown as Grade[]
//   },

//   getById: async (id: number, userId: number, userType: 'admin' | 'teacher' | 'student' | 'parent'): Promise<Grade> => {
//     const all = await gradesSupabaseAPI.getAll(userId, userType)
//     const row = all.find((g) => g.id === id)
//     if (!row) throw new Error('الصف غير موجود')
//     return row
//   },
// }

// // =====================================================
// // SEMESTERS API
// // =====================================================
// export const semestersSupabaseAPI = {
//   getAll: async (userId: number, userType: 'admin' | 'teacher' | 'student' | 'parent'): Promise<Semester[]> => {
//     const { data, error } = await supabase.rpc('get_semesters_with_context', { p_user_id: userId, p_user_type: userType })
//     if (error) throw error
//     return parseRowsDates(data || []) as unknown as Semester[]
//   },
// }

// // =====================================================
// // SECTIONS API
// // =====================================================
// export const sectionsSupabaseAPI = {
//   getByGrade: async (gradeId: number, userId: number, userType: 'admin' | 'teacher' | 'student' | 'parent'): Promise<Section[]> => {
//     const { data, error } = await supabase.rpc('get_sections_with_context', { p_user_id: userId, p_user_type: userType, p_grade_id: gradeId })
//     if (error) throw error
//     return parseRowsDates(data || []) as unknown as Section[]
//   },

//   create: async (
//     data: Omit<Section, 'id' | 'created_at' | 'updated_at'>,
//     userId: number,
//     userType: 'admin'
//   ): Promise<Section> => {
//     const payload = {
//       name: data.name,
//       grade_id: data.grade_id,
//       capacity: data.capacity ?? null,
//       is_active: data.is_active ?? true,
//     }
//     const { data: rows, error } = await supabase.rpc('insert_section_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//       p_payload: payload,
//     })
//     if (error) throw error
//     const row = Array.isArray(rows) ? rows[0] : rows
//     if (!row) throw new Error('فشل إضافة الشعبة')
//     return parseRowDates(row) as Section
//   },

//   delete: async (id: number, userId: number, userType: 'admin'): Promise<void> => {
//     return withUserContext(userId, userType, async () => {
//       // Check if section has students
//       const { data: students, error: checkError } = await supabase
//         .from('students')
//         .select('id')
//         .eq('section_id', id)
//         .is('deleted_at', null)
//         .limit(1)

//       if (checkError) throw checkError

//       if (students && students.length > 0) {
//         throw new Error('لا يمكن حذف الشعبة لأن فيها طلاب')
//       }

//       // Soft delete (set is_active to false)
//       const { error } = await supabase
//         .from('sections')
//         .update({ is_active: false, updated_at: new Date().toISOString() })
//         .eq('id', id)

//       if (error) throw error
//     })
//   },

//   getStudentCount: async (sectionId: number, userId: number, userType: 'admin' | 'teacher'): Promise<number> => {
//     const { data, error } = await supabase.rpc('get_student_count_by_section_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//       p_section_id: sectionId,
//     })
//     if (error) throw error
//     return typeof data === 'number' ? data : Number(data) || 0
//   },
// }

// // =====================================================
// // SUBJECTS API
// // =====================================================
// export const subjectsSupabaseAPI = {
//   getAll: async (
//     userId: number,
//     userType: 'admin' | 'teacher' | 'student' | 'parent',
//     _params?: { sortBy?: string }
//   ): Promise<Subject[]> => {
//     const { data, error } = await supabase.rpc('get_subjects_with_context', { p_user_id: userId, p_user_type: userType })
//     if (error) throw error
//     return parseRowsDates(data || []) as unknown as Subject[]
//   },

//   getById: async (id: number, userId: number, userType: 'admin' | 'teacher' | 'student' | 'parent'): Promise<Subject> => {
//     const { data, error } = await supabase.rpc('get_subject_by_id_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//       p_id: id,
//     })
//     if (error) throw new Error('المادة غير موجودة')
//     const row = Array.isArray(data) ? data[0] : data
//     if (!row) throw new Error('المادة غير موجودة')
//     return parseRowDates(row) as Subject
//   },

//   getByIds: async (ids: number[], userId: number, userType: 'admin' | 'teacher' | 'student' | 'parent'): Promise<Subject[]> => {
//     if (ids.length === 0) return []
//     return withUserContext(userId, userType, async () => {
//       const { data, error } = await supabase.from('subjects').select('*').in('id', ids)
//       if (error) throw error
//       return parseRowsDates(data || []) as unknown as Subject[]
//     })
//   },

//   create: async (
//     data: Omit<Subject, 'id' | 'subject_code' | 'created_at' | 'updated_at'>,
//     userId: number,
//     userType: 'admin'
//   ): Promise<Subject> => {
//     const payload = {
//       name: data.name,
//       description: data.description ?? null,
//       is_active: data.is_active ?? true,
//         semester:    (data as any).semester ?? null, 
//     }
//     const { data: rows, error } = await supabase.rpc('insert_subject_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//       p_payload: payload,
//     })
//     if (error) throw error
//     const row = Array.isArray(rows) ? rows[0] : rows
//     if (!row) throw new Error('فشل إضافة المادة')
//     return parseRowDates(row) as Subject
//   },

//   update: async (
//     id: number,
//     data: Partial<Subject>,
//     userId: number,
//     userType: 'admin'
//   ): Promise<Subject> => {
//     const payload: Record<string, unknown> = {}
//     if (data.name !== undefined) payload.name = data.name
//     if (data.description !== undefined) payload.description = data.description
//     if (data.is_active !== undefined) payload.is_active = data.is_active
//     if (data.pdf_url !== undefined) payload.pdf_url = data.pdf_url
//     if (data.pdf_storage_path !== undefined) payload.pdf_storage_path = data.pdf_storage_path
//     if (data.pdf_filename !== undefined) payload.pdf_filename = data.pdf_filename
//     if (data.pdf_size !== undefined) payload.pdf_size = data.pdf_size

// if ((data as any).semester !== undefined) payload.semester = (data as any).semester ?? null  // ← أضف هذا السطر
//     const { data: rows, error } = await supabase.rpc('update_subject_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//       p_id: id,
//       p_payload: payload,
//     })
//     if (error) throw error
//     const row = Array.isArray(rows) ? rows[0] : rows
//     if (!row) throw new Error('المادة غير موجودة')
//     return parseRowDates(row) as Subject
//   },

//   delete: async (id: number, userId: number, userType: 'admin'): Promise<void> => {
//     return withUserContext(userId, userType, async () => {
//       // Check if subject is linked to section_subjects
//       const { data: linked, error: checkError } = await supabase
//         .from('section_subjects')
//         .select('id')
//         .eq('subject_id', id)
//         .eq('is_active', true)
//         .limit(1)

//       if (checkError) throw checkError

//       if (linked && linked.length > 0) {
//         throw new Error('لا يمكن حذف المادة لأنها مرتبطة بصفوف ومعلمين')
//       }

//       // Soft delete
//       const { error } = await supabase
//         .from('subjects')
//         .update({ is_active: false, updated_at: new Date().toISOString() })
//         .eq('id', id)

//       if (error) throw error
//     })
//   },
// }

// // =====================================================
// // CHAPTERS API
// // =====================================================
// export const chaptersSupabaseAPI = {

//   getAll: async (
//     userId: number,
//     userType: 'admin' | 'teacher',
//     params?: { subjectId?: number }
//   ): Promise<Chapter[]> => {
//     const { data, error } = await supabase.rpc('get_chapters_with_context', {
//       p_user_id:   userId,
//       p_user_type: userType,
//       p_subject_id: params?.subjectId ?? null,
//     })
//     if (error) throw error
//     return parseRowsDates(data || []) as unknown as Chapter[]
//   },

//   getBySubject: async (
//     subjectId: number,
//     userId: number,
//     userType: 'admin' | 'teacher'
//   ): Promise<Chapter[]> => {
//     const { data, error } = await supabase.rpc('get_chapters_with_context', {
//       p_user_id:    userId,
//       p_user_type:  userType,
//       p_subject_id: subjectId,
//     })
//     if (error) throw error
//     return parseRowsDates(data || []) as unknown as Chapter[]
//   },

//   getById: async (
//     id: number,
//     userId: number,
//     userType: 'admin' | 'teacher'
//   ): Promise<Chapter> => {
//     const { data, error } = await supabase.rpc('get_chapters_with_context', {
//       p_user_id:    userId,
//       p_user_type:  userType,
//       p_subject_id: null,
//     })
//     if (error) throw new Error('الفصل غير موجود')
//     const rows = (Array.isArray(data) ? data : []) as any[]
//     const row = rows.find((r: any) => r.id === id)
//     if (!row) throw new Error('الفصل غير موجود')
//     return parseRowDates(row) as Chapter
//   },

//   create: async (
//     data: Omit<Chapter, 'id' | 'created_at' | 'updated_at'>,
//     userId: number,
//     userType: 'admin'
//   ): Promise<Chapter> => {
//     const payload = {
//       subject_id:  data.subject_id,
//       name:        data.name,
//       description: data.description ?? null,
//       order_index: data.order_index ?? 0,
//       is_active:   data.is_active ?? true,
//     }
//     const { data: rows, error } = await supabase.rpc('insert_chapter_with_context', {
//       p_user_id:   userId,
//       p_user_type: userType,
//       p_payload:   payload,
//     })
//     if (error) throw error
//     const row = Array.isArray(rows) ? rows[0] : rows
//     if (!row) throw new Error('فشل إضافة الفصل')
//     return parseRowDates(row) as Chapter
//   },

//   update: async (
//     id: number,
//     data: Partial<Chapter>,
//     userId: number,
//     userType: 'admin'
//   ): Promise<Chapter> => {
//     const payload: Record<string, unknown> = {}
//     if (data.name        !== undefined) payload.name        = data.name
//     if (data.description !== undefined) payload.description = data.description
//     if (data.order_index !== undefined) payload.order_index = data.order_index
//     if (data.is_active   !== undefined) payload.is_active   = data.is_active
//     const { data: rows, error } = await supabase.rpc('update_chapter_with_context', {
//       p_user_id:   userId,
//       p_user_type: userType,
//       p_id:        id,
//       p_payload:   payload,
//     })
//     if (error) throw error
//     const row = Array.isArray(rows) ? rows[0] : rows
//     if (!row) throw new Error('الفصل غير موجود')
//     return parseRowDates(row) as Chapter
//   },

//   delete: async (id: number, userId: number, userType: 'admin'): Promise<void> => {
//     // تحقق من عدم وجود أسئلة مرتبطة
//     const { data: used } = await supabase
//       .from('questions')
//       .select('id')
//       .eq('chapter_id', id)
//       .eq('is_active', true)
//       .limit(1)
//     if (used && used.length > 0) {
//       throw new Error('لا يمكن حذف الفصل لأنه يحتوي على أسئلة')
//     }
//     const payload = { is_active: false }
//     const { error } = await supabase.rpc('update_chapter_with_context', {
//       p_user_id:   userId,
//       p_user_type: userType,
//       p_id:        id,
//       p_payload:   payload,
//     })
//     if (error) throw error
//   },
// }


// export const sectionSubjectsSupabaseAPI = {

//   getByGrade: async (
//     gradeId:  number,
//     userId:   number,
//     userType: 'admin' | 'teacher'
//   ): Promise<Array<SectionSubject & {
//     subject_name: string
//     teacher_name: string
//     section_name: string
//   }>> => {
//     const { data, error } = await supabase.rpc(
//       'get_section_subjects_with_names_by_grade_with_context',
//       {
//         p_user_id:   userId,
//         p_user_type: userType,
//         p_grade_id:  gradeId,
//       }
//     )
//     if (error) throw error
//     return parseRowsDates(data ?? []) as unknown as Array<
//       SectionSubject & {
//         subject_name: string
//         teacher_name: string
//         section_name: string
//       }
//     >
//   },

//   getBySection: async (
//     sectionId: number,
//     userId:    number,
//     userType:  'admin' | 'teacher'
//   ): Promise<SectionSubject[]> => {
//     return withUserContext(userId, userType, async () => {
//       const { data, error } = await supabase
//         .from('section_subjects')
//         .select('*')
//         .eq('section_id', sectionId)
//         .eq('is_active', true)       // ← النشطة فقط
//       if (error) throw error
//       return parseRowsDates(data ?? []) as unknown as SectionSubject[]
//     })
//   },

//   getByTeacher: async (
//     teacherId: number,
//     userId:    number,
//     userType:  'admin' | 'teacher'
//   ): Promise<SectionSubject[]> => {
//     const { data, error } = await supabase.rpc(
//       'get_section_subjects_by_teacher_with_context',
//       {
//         p_user_id:   userId,
//         p_user_type: userType,
//         p_teacher_id: teacherId,
//       }
//     )
//     if (error) throw error
//     return parseRowsDates(data ?? []) as unknown as SectionSubject[]
//   },

//   create: async (
//     data:     Omit<SectionSubject, 'id' | 'assigned_at' | 'updated_at'>,
//     userId:   number,
//     userType: 'admin'
//   ): Promise<SectionSubject> => {
//     const { data: rows, error } = await supabase.rpc(
//       'insert_section_subject_with_context',
//       {
//         p_user_id:   userId,
//         p_user_type: userType,
//         p_section_id: data.section_id,
//         p_subject_id: data.subject_id,
//         p_teacher_id: data.teacher_id,
//       }
//     )
//     if (error) {
//       // ✅ رسالة واضحة عند تكرار الربط
//       if (
//         error.message?.includes('duplicate') ||
//         error.message?.includes('uq_section_subject')
//       ) {
//         throw new Error(
//           'هذه المادة في هذه الشعبة مرتبطة بمعلم آخر بالفعل'
//         )
//       }
//       throw error
//     }
//     const row = Array.isArray(rows) ? rows[0] : rows
//     if (!row) throw new Error('فشل ربط المادة بالشعبة')
//     return parseRowDates(row) as SectionSubject
//   },

//   // ✅ Hard Delete — حذف فعلي بدل التعطيل
//   delete: async (
//     id:       number,
//     userId:   number,
//     userType: 'admin'
//   ): Promise<void> => {
//     const { error } = await supabase.rpc(
//       'delete_section_subject_with_context',
//       {
//         p_user_id:   userId,
//         p_user_type: userType,
//         p_id:        id,
//       }
//     )
//     if (error) throw error
//   },
// }

// // =====================================================
// // STUDENTS API
// // =====================================================
// export const studentsSupabaseAPI = {
//   getAll: async (
//     userId: number,
//     userType: 'admin' | 'teacher',
//     params?: { search?: string; gradeId?: number }
//   ): Promise<Student[]> => {
//     const { data, error } = await supabase.rpc('get_students_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//       p_search: params?.search || null,
//       p_grade_id: params?.gradeId || null,
//     })
//     if (error) throw error
//     return parseRowsDates((data || []).map((s: Record<string, unknown>) => ({ ...s, password_hash: '' }))) as unknown as Student[]
//   },
//   getById: async (id: number, userId: number, userType: 'admin' | 'teacher'): Promise<Student> => {
//     const { data, error } = await supabase.rpc('get_student_by_id_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//       p_id: id,
//     })
//     if (error) throw new Error('الطالب غير موجود')
//     const row = Array.isArray(data) ? data[0] : data
//     if (!row) throw new Error('الطالب غير موجود')
//     return parseRowDates({ ...row, password_hash: '' }) as Student
//   },
//   create: async (
//     data: Omit<Student, 'id' | 'student_code' | 'created_at' | 'updated_at' | 'deleted_at' | 'deleted_by'>,
//     userId: number,
//     userType: 'admin'
//   ): Promise<Student> => {
//     const { data: hashed, error: hashErr } = await supabase.rpc('hash_password', { p_password: data.password_hash || '123456' })
//     if (hashErr) throw new Error('خطأ في تشفير كلمة السر')
//     const payload = {
//       full_name: data.full_name,
//       phone_number: data.phone_number ?? null,
//       email: data.email ?? null,
//       section_id: data.section_id ?? null,
//       password_hash: hashed ?? data.password_hash,
//       is_active: data.is_active ?? true,
//     }
//     const { data: rows, error } = await supabase.rpc('insert_student_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//       p_payload: payload,
//     })
//     if (error) throw error
//     const row = Array.isArray(rows) ? rows[0] : rows
//     if (!row) throw new Error('فشل إضافة الطالب')
//     return parseRowDates({ ...row, password_hash: '' }) as Student
//   },
//   update: async (id: number, data: Partial<Student>, userId: number, userType: 'admin'): Promise<Student> => {
//     const payload: Record<string, unknown> = {}
//     if (data.full_name !== undefined) payload.full_name = data.full_name
//     if (data.phone_number !== undefined) payload.phone_number = data.phone_number
//     if (data.email !== undefined) payload.email = data.email
//     if (data.section_id !== undefined) payload.section_id = data.section_id
//     if (data.is_active !== undefined) payload.is_active = data.is_active
//     const { data: rows, error } = await supabase.rpc('update_student_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//       p_id: id,
//       p_payload: payload,
//     })
//     if (error) throw error
//     const row = Array.isArray(rows) ? rows[0] : rows
//     if (!row) throw new Error('الطالب غير موجود')
//     return parseRowDates({ ...row, password_hash: '' }) as Student
//   },
//   delete: async (id: number, deletedBy: number, userId: number, userType: 'admin'): Promise<void> => {
//     return withUserContext(userId, userType, async () => {
//       const { error } = await supabase
//         .from('students')
//         .update({ deleted_at: new Date().toISOString(), deleted_by: deletedBy })
//         .eq('id', id)
//       if (error) throw error
//     })
//   },
//   importFromExcel: async (
//     students: Array<{ full_name: string; phone_number?: string; gradeName: string; sectionName: string }>,
//     userId: number,
//     userType: 'admin'
//   ): Promise<{ success: number; failed: number; errors: string[] }> => {
//     return withUserContext(userId, userType, async () => {
//       const errors: string[] = []
//       let success = 0
//       const { data: grades } = await supabase.from('grades').select('id, name').eq('is_active', true)
//       const gradeByName = new Map((grades || []).map((g: any) => [g.name, g.id]))
//       for (const s of students) {
//         const gradeId = gradeByName.get(s.gradeName)
//         if (!gradeId) {
//           errors.push(`الصف "${s.gradeName}" غير موجود`)
//           continue
//         }
//         const { data: secs } = await supabase.from('sections').select('id').eq('grade_id', gradeId).eq('name', s.sectionName).eq('is_active', true).limit(1)
//         const sectionId = secs?.[0]?.id
//         if (!sectionId) {
//           errors.push(`الشعبة "${s.sectionName}" غير موجودة في ${s.gradeName}`)
//           continue
//         }
//         const { data: hash } = await supabase.rpc('hash_password', { p_password: '123456' })
//         const { error: ins } = await supabase.from('students').insert({
//           full_name: s.full_name,
//           phone_number: s.phone_number || null,
//           email: null,
//           section_id: sectionId,
//           password_hash: hash || 'hash',
//           is_active: true,
//         })
//         if (ins) errors.push(`خطأ في إضافة ${s.full_name}: ${ins.message}`)
//         else success++
//       }
//       return { success, failed: students.length - success, errors }
//     })
//   },
// }

// // =====================================================
// // PARENTS API
// // =====================================================
// export const parentsSupabaseAPI = {
//   getAll: async (userId: number, userType: 'admin'): Promise<Parent[]> => {
//     const { data, error } = await supabase.rpc('get_parents_with_context', { p_user_id: userId, p_user_type: userType })
//     if (error) throw error
//     return parseRowsDates((data || []).map((p: Record<string, unknown>) => ({ ...p, password_hash: '' }))) as unknown as Parent[]
//   },
//   getByStudent: async (studentId: number, userId: number, userType: 'admin'): Promise<Parent[]> => {
//     const { data, error } = await supabase.rpc('get_parents_by_student_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//       p_student_id: studentId,
//     })
//     if (error) throw error
//     return parseRowsDates((data || []).map((p: Record<string, unknown>) => ({ ...p, password_hash: '' }))) as unknown as Parent[]
//   },
// }

// // =====================================================
// // PARENT STUDENTS API
// // =====================================================
// export const parentStudentsSupabaseAPI = {
//   getAll: async (userId: number, userType: 'admin'): Promise<Array<ParentStudent & { parent: Parent; student: Student }>> => {
//     const { data, error } = await supabase.rpc('get_parent_students_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//     })
//     if (error) throw error
//     const rows = (data || []) as any[]
//     return parseRowsDates(rows) as Array<ParentStudent & { parent: Parent; student: Student }>
//   },
//   getByStudent: async (studentId: number, userId: number, userType: 'admin'): Promise<ParentStudent[]> => {
//     return withUserContext(userId, userType, async () => {
//       const { data, error } = await supabase.from('parent_students').select('*').eq('student_id', studentId)
//       if (error) throw error
//       return parseRowsDates(data || []) as ParentStudent[]
//     })
//   },
//   link: async (parentId: number, studentId: number, relationship: string | null, userId: number, userType: 'admin'): Promise<ParentStudent> => {
//     const { data, error } = await supabase.rpc('link_parent_student_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//       p_parent_id: parentId,
//       p_student_id: studentId,
//       p_relationship: relationship,
//     })
//     if (error) throw error
//     const row = Array.isArray(data) ? data[0] : data
//     return parseRowDates(row || {}) as ParentStudent
//   },
//   delete: async (id: number, userId: number, userType: 'admin'): Promise<void> => {
//     const { error } = await supabase.rpc('delete_parent_student_link_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//       p_id: id,
//     })
//     if (error) throw error
//   },
// }

// // =====================================================
// // QUESTIONS API
// // =====================================================
// export const questionsSupabaseAPI = {
//   getAll: async (
//     userId: number,
//     userType: 'admin' | 'teacher',
//     params?: { type?: string; difficulty?: string; subjectId?: number }
//   ): Promise<Question[]> => {
//     const { data, error } = await supabase.rpc('get_questions_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//       p_type: params?.type || null,
//       p_difficulty: params?.difficulty || null,
//       p_subject_id: params?.subjectId || null,
//     })
//     if (error) throw error
//     return parseRowsDates(data || []) as unknown as Question[]
//   },
//   getById: async (id: number, userId: number, userType: 'admin' | 'teacher'): Promise<Question> => {
//     const { data, error } = await supabase.rpc('get_question_by_id_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//       p_id: id,
//     })
//     if (error) throw new Error('السؤال غير موجود')
//     const row = Array.isArray(data) ? data[0] : data
//     if (!row) throw new Error('السؤال غير موجود')
//     return parseRowDates(row) as Question
//   },
//   create: async (
//     data: Omit<Question, 'id' | 'created_at' | 'updated_at' | 'status'> & { status?: ApprovalStatus },
//     userId: number,
//     userType: 'admin'
//   ): Promise<Question> => {

//     const payload: Record<string, unknown> = {
//   question_text: data.question_text,
//   question_type: data.question_type,
//   question_options: data.question_options ?? null,
//   correct_answer: data.correct_answer ?? null,
//   difficulty_level: data.difficulty_level,
//   subject_id: data.subject_id,
//   chapter_id: data.chapter_id ?? null,   // ← أضف هذا السطر
//   created_by_admin: userId,
//   created_by_teacher: null,
//   status: data.status ?? 'approved',
//   is_active: data.is_active ?? true,
// }

//     if (data.pdf_url !== undefined) payload.pdf_url = data.pdf_url
//     if (data.pdf_storage_path !== undefined) payload.pdf_storage_path = data.pdf_storage_path
//     if (data.pdf_filename !== undefined) payload.pdf_filename = data.pdf_filename
//     if ((data as any).skill !== undefined) payload.skill = (data as any).skill || null
//     if ((data as any).explanation !== undefined) payload.explanation = (data as any).explanation || null
//     if ((data as any).reference_page !== undefined) payload.reference_page = (data as any).reference_page || null
//     const { data: rows, error } = await supabase.rpc('insert_question_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//       p_payload: payload,
//     })
//     if (error) throw error
//     const row = Array.isArray(rows) ? rows[0] : rows
//     if (!row) throw new Error('فشل إضافة السؤال')
//     return parseRowDates(row) as Question
//   },
//   update: async (id: number, data: Partial<Question>, userId: number, userType: 'admin'): Promise<Question> => {
//     const payload: Record<string, unknown> = {}
//     if (data.chapter_id !== undefined) payload.chapter_id = data.chapter_id  // ← أضف هذا السطر
// if (data.subject_id !== undefined) payload.subject_id = data.subject_id
//     if (data.question_text !== undefined) payload.question_text = data.question_text
//     if (data.question_type !== undefined) payload.question_type = data.question_type
//     if (data.question_options !== undefined) payload.question_options = data.question_options
//     if (data.correct_answer !== undefined) payload.correct_answer = data.correct_answer
//     if (data.difficulty_level !== undefined) payload.difficulty_level = data.difficulty_level
//     if (data.subject_id !== undefined) payload.subject_id = data.subject_id
//     if (data.is_active !== undefined) payload.is_active = data.is_active
//     if (data.pdf_url !== undefined) payload.pdf_url = data.pdf_url
//     if (data.pdf_storage_path !== undefined) payload.pdf_storage_path = data.pdf_storage_path
//     if (data.pdf_filename !== undefined) payload.pdf_filename = data.pdf_filename
//     if ((data as any).skill !== undefined) payload.skill = (data as any).skill || null
//     if ((data as any).explanation !== undefined) payload.explanation = (data as any).explanation || null
//     if ((data as any).reference_page !== undefined) payload.reference_page = (data as any).reference_page || null
//     const { data: rows, error } = await supabase.rpc('update_question_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//       p_id: id,
//       p_payload: payload,
//     })
//     if (error) throw error
//     const row = Array.isArray(rows) ? rows[0] : rows
//     if (!row) throw new Error('السؤال غير موجود')
//     return parseRowDates(row) as Question
//   },
 
//   delete: async (id: number, userId: number, userType: 'admin'): Promise<void> => {
//   const { error } = await supabase.rpc('delete_question_with_context', {
//     p_user_id: userId,
//     p_user_type: userType,
//     p_question_id: id,
//   })
//   if (error) throw new Error(error.message)
// },
// }

// // =====================================================
// // EXAMS API
// // =====================================================
// export const examsSupabaseAPI = {
//   getAll: async (userId: number, userType: 'admin' | 'teacher'): Promise<Exam[]> => {
//     const { data, error } = await supabase.rpc('get_exams_with_context', { p_user_id: userId, p_user_type: userType })
//     if (error) throw error
//     return parseRowsDates(data || []) as unknown as Exam[]
//   },
//   getById: async (id: number, userId: number, userType: 'admin' | 'teacher'): Promise<Exam> => {
//     const { data, error } = await supabase.rpc('get_exam_by_id_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//       p_id: id,
//     })
//     if (error) throw new Error('الاختبار غير موجود')
//     const row = Array.isArray(data) ? data[0] : data
//     if (!row) throw new Error('الاختبار غير موجود')
//     return parseRowDates(row) as Exam
//   },
//   create: async (
//     data: Omit<Exam, 'id' | 'created_at' | 'updated_at' | 'total_marks'>,
//     userId: number,
//     userType: 'admin'
//   ): Promise<Exam> => {
//     const payload = {
//       title: data.title,
//       description: data.description ?? null,
//       subject_id: data.subject_id,
//       grade_id: data.grade_id,
//       section_id: data.section_id,
//       semester_id: data.semester_id,
//       total_marks: 0,
//       passing_marks: data.passing_marks ?? 0,
//       duration_minutes: data.duration_minutes ?? null,
//       difficulty_level: data.difficulty_level ?? null,
//       created_by_admin: userId,
//       created_by_teacher: null,
//       status: data.status ?? 'draft',
//     }
//     const { data: rows, error } = await supabase.rpc('insert_exam_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//       p_payload: payload,
//     })
//     if (error) throw error
//     const row = Array.isArray(rows) ? rows[0] : rows
//     if (!row) throw new Error('فشل إضافة الاختبار')
//     return parseRowDates(row) as Exam
//   },
//   update: async (id: number, data: Partial<Exam>, userId: number, userType: 'admin'): Promise<Exam> => {
//     const payload: Record<string, unknown> = {}
//     if (data.title !== undefined) payload.title = data.title
//     if (data.description !== undefined) payload.description = data.description
//     if (data.subject_id !== undefined) payload.subject_id = data.subject_id
//     if (data.grade_id !== undefined) payload.grade_id = data.grade_id
//     if (data.section_id !== undefined) payload.section_id = data.section_id
//     if (data.semester_id !== undefined) payload.semester_id = data.semester_id
//     if (data.total_marks !== undefined) payload.total_marks = data.total_marks
//     if (data.passing_marks !== undefined) payload.passing_marks = data.passing_marks
//     if (data.duration_minutes !== undefined) payload.duration_minutes = data.duration_minutes
//     if (data.difficulty_level !== undefined) payload.difficulty_level = data.difficulty_level
//     if (data.status !== undefined) payload.status = data.status
//     if (data.pdf_url !== undefined) payload.pdf_url = data.pdf_url
//     if (data.pdf_storage_path !== undefined) payload.pdf_storage_path = data.pdf_storage_path
//     if (data.pdf_filename !== undefined) payload.pdf_filename = data.pdf_filename
//     if (data.pdf_size !== undefined) payload.pdf_size = data.pdf_size
//     const { data: rows, error } = await supabase.rpc('update_exam_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//       p_id: id,
//       p_payload: payload,
//     })
//     if (error) throw error
//     const row = Array.isArray(rows) ? rows[0] : rows
//     if (!row) throw new Error('الاختبار غير موجود')
//     return parseRowDates(row) as Exam
//   },
//   delete: async (id: number, userId: number, userType: 'admin'): Promise<void> => {
//     return withUserContext(userId, userType, async () => {
//       const { error } = await supabase.from('exams').delete().eq('id', id)
//       if (error) throw error
//     })
//   },
//   publish: async (id: number, userId: number, userType: 'admin'): Promise<void> => {
//     return withUserContext(userId, userType, async () => {
//       const { data: exam } = await supabase.from('exams').select('status').eq('id', id).single()
//       if (exam?.status !== 'approved') throw new Error('يجب الموافقة على الاختبار قبل النشر')
//       const { error } = await supabase.from('exams').update({ status: 'published', published_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', id)
//       if (error) throw error
//     })
//   },
// }

// // =====================================================
// // EXAM QUESTIONS API
// // =====================================================
// export const examQuestionsSupabaseAPI = {
//   getByExam: async (examId: number, userId: number, userType: 'admin' | 'teacher'): Promise<ExamQuestion[]> => {
//     const { data, error } = await supabase.rpc('get_exam_questions_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//       p_exam_id: examId,
//     })
//     if (error) throw error
//     return parseRowsDates(data || []) as unknown as ExamQuestion[]
//   },
//   addQuestion: async (examId: number, questionId: number, order: number, marks: number, userId: number, userType: 'admin'): Promise<ExamQuestion> => {
//     return withUserContext(userId, userType, async () => {
//       const { data, error } = await supabase.from('exam_questions').insert({ exam_id: examId, question_id: questionId, question_order: order, marks }).select().single()
//       if (error) throw error
//       return parseRowDates(data || {}) as ExamQuestion
//     })
//   },
//   removeQuestion: async (examId: number, questionId: number, userId: number, userType: 'admin'): Promise<void> => {
//     return withUserContext(userId, userType, async () => {
//       const { error } = await supabase.from('exam_questions').delete().eq('exam_id', examId).eq('question_id', questionId)
//       if (error) throw error
//     })
//   },
// }

// // =====================================================
// // EXAM RESULTS API
// // =====================================================
// export const examResultsSupabaseAPI = {
//   getByExam: async (examId: number, userId: number, userType: 'admin' | 'teacher'): Promise<ExamResult[]> => {
//     return withUserContext(userId, userType, async () => {
//       const { data, error } = await supabase.from('exam_results').select('*').eq('exam_id', examId).order('submitted_at', { ascending: false })
//       if (error) throw error
//       return parseRowsDates(data || []) as ExamResult[]
//     })
//   },
//   getByStudent: async (studentId: number, userId: number, userType: 'admin' | 'teacher'): Promise<ExamResult[]> => {
//     return withUserContext(userId, userType, async () => {
//       const { data, error } = await supabase.from('exam_results').select('*').eq('student_id', studentId).eq('status', 'completed').order('submitted_at', { ascending: false })
//       if (error) throw error
//       return parseRowsDates(data || []) as ExamResult[]
//     })
//   },
// }

// // =====================================================
// // REPORTS GRADES (student averages & details)
// // =====================================================
// export const reportsGradesSupabaseAPI = {
//   getAll: async (
//     userId: number,
//     userType: 'admin',
//     params?: { gradeId?: number }
//   ): Promise<Array<{ student: Student; averagePercentage: number }>> => {
//     const { data, error } = await supabase.rpc('get_reports_grades_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//       p_grade_id: params?.gradeId ?? null,
//     })
//     if (error) throw error
//     const rows = (Array.isArray(data) ? data : []) as Array<{ student_id: number; student_code: string; full_name: string; phone_number?: string; email?: string; section_id: number; average_percentage: number | null }>
//     return rows.map(row => ({
//       student: {
//         id: row.student_id,
//         student_code: Number(row.student_code) || row.student_code,
//         full_name: row.full_name,
//         phone_number: row.phone_number ?? '',
//         email: row.email ?? '',
//         section_id: row.section_id,
//         password_hash: '',
//         profile_image: null,
//         profile_image_filename: null,
//         profile_image_mime_type: null,
//         profile_image_size: null,
//         is_active: true,
//         last_login_at: null,
//         created_at: new Date(),
//         updated_at: new Date(),
//         deleted_at: null,
//         deleted_by: null,
//       } as Student,
//       averagePercentage: Number(row.average_percentage) || 0,
//     }))
//   },
//   getStudentDetails: async (
//     studentId: number,
//     userId: number,
//     userType: 'admin'
//   ): Promise<{ student: Student; results: Array<{ exam: Exam; result: ExamResult; subject: Subject }> }> => {
//     const { data: raw, error } = await supabase.rpc('get_student_details_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//       p_student_id: studentId,
//     })
//     if (error) throw new Error('الطالب غير موجود')
//     const obj = raw as { student: Record<string, unknown>; results: Array<{ exam: Record<string, unknown>; result: Record<string, unknown>; subject: Record<string, unknown> }> } | null
//     if (!obj || !obj.student) throw new Error('الطالب غير موجود')
//     const student = parseRowDates({ ...obj.student, password_hash: '' }) as Student
//     const results = (obj.results || []).map((r) => ({
//       exam: parseRowDates(r.exam || {}) as unknown as Exam,
//       result: parseRowDates(r.result || {}) as unknown as ExamResult,
//       subject: parseRowDates(r.subject || {}) as unknown as Subject,
//     }))
//     return { student, results }
//   },
// }

// // =====================================================
// // ATTENDANCE API
// // =====================================================
// export const attendanceSupabaseAPI = {
//   // getByDate: async (date: Date, userId: number, userType: 'admin' | 'teacher'): Promise<Attendance[]> => {
//   //   const dateStr = date.toISOString().split('T')[0]
//   //   const { data, error } = await supabase.rpc('get_attendance_by_date_with_context', {
//   //     p_user_id: userId,
//   //     p_user_type: userType,
//   //     p_date: dateStr,
//   //   })
//   //   if (error) throw error
//   //   return parseRowsDates(data || []) as unknown as Attendance[]
//   // },
//   getByDate: async (date: Date, userId: number, userType: 'admin' | 'teacher'): Promise<Attendance[]> => {
//   // const dateStr = date.toISOString().split('T')[0]
//   const dateStr = [
//   date.getFullYear(),
//   String(date.getMonth() + 1).padStart(2, '0'),
//   String(date.getDate()).padStart(2, '0'),
// ].join('-')
//   // ✅ نجرب RPC أولاً، وإذا فشل نستخدم direct query
//   try {
//     const { data, error } = await supabase.rpc('get_attendance_by_date_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//       p_date: dateStr,
//     })
//     if (!error && data && data.length > 0) {
//       return parseRowsDates(data) as unknown as Attendance[]
//     }
//   } catch (_) {}

//   // ✅ Fallback: direct query (يعمل مع anon policy)
//   const { data, error } = await supabase
//     .from('attendance')
//     .select('*')
//     .eq('attendance_date', dateStr)
//     .order('section_id')
  
//   if (error) throw error
//   return parseRowsDates(data || []) as unknown as Attendance[]
// },
//   getBySectionAndDate: async (sectionId: number, date: Date, userId: number, userType: 'admin' | 'teacher'): Promise<Attendance[]> => {
//     return withUserContext(userId, userType, async () => {
//       const dateStr = date.toISOString().split('T')[0]
//       const { data, error } = await supabase.from('attendance').select('*').eq('section_id', sectionId).eq('attendance_date', dateStr)
//       if (error) throw error
//       return parseRowsDates(data || []) as unknown as Attendance[]
//     })
//   },
//   upsert: async (rows: Array<{ student_id: number; section_id: number; attendance_date: string; status: string; notes?: string | null; marked_by: number }>, userId: number, userType: 'admin' | 'teacher'): Promise<void> => {
//     return withUserContext(userId, userType, async () => {
//       for (const row of rows) {
//         const { error } = await supabase.from('attendance').upsert(row, { onConflict: 'student_id,attendance_date' })
//         if (error) throw error
//       }
//     })
//   },
// }

// // =====================================================
// // MESSAGES API
// // =====================================================
// export const messagesSupabaseAPI = {
//   getForAdmin: async (userId: number, userType: 'admin'): Promise<Message[]> => {
//     const { data, error } = await supabase.rpc('get_messages_for_admin_with_context', { p_user_id: userId, p_user_type: userType })
//     if (error) throw error
//     const all = parseRowsDates(data || []) as unknown as Message[]
//     return all.filter(m => m.recipient_admin_id === userId).sort((a, b) => new Date(b.sent_at ?? 0).getTime() - new Date(a.sent_at ?? 0).getTime())
//   },
//   getConversations: async (userId: number, userType: 'admin'): Promise<Array<{ parent: Parent; lastMessage: Message; unreadCount: number }>> => {
//     const { data: messagesData, error } = await supabase.rpc('get_messages_for_admin_with_context', { p_user_id: userId, p_user_type: userType })
//     if (error) throw error
//     const messages = parseRowsDates(messagesData || []) as unknown as Message[]
//     const byParent = new Map<number, { parent: Parent | null; messages: Message[] }>()
//     for (const m of messages) {
//       const pid = m.sender_parent_id ?? m.recipient_parent_id
//       if (!pid) continue
//       if (!byParent.has(pid)) byParent.set(pid, { parent: null, messages: [] })
//       const rec = byParent.get(pid)!
//       rec.messages.push(m)
//     }
//     const parentIds = Array.from(byParent.keys())
//     const parentsMap = new Map<number, Parent>()
//     if (parentIds.length > 0) {
//       const { data: parentsList } = await supabase.rpc('get_parents_with_context', { p_user_id: userId, p_user_type: userType })
//       for (const p of parentsList || []) {
//         if (parentIds.includes(p.id)) parentsMap.set(p.id, parseRowDates({ ...p, password_hash: '' }) as Parent)
//       }
//     }
//     return Array.from(byParent.entries())
//       .map(([pid, rec]) => {
//         const parent = parentsMap.get(pid)
//         if (!parent) return null
//         const sorted = [...rec.messages].sort((a, b) => new Date(b.sent_at ?? 0).getTime() - new Date(a.sent_at ?? 0).getTime())
//         return {
//           parent,
//           lastMessage: sorted[0],
//           unreadCount: rec.messages.filter(m => !m.is_read && m.recipient_admin_id === userId).length,
//         }
//       })
//       .filter((x): x is NonNullable<typeof x> => x !== null)
//   },
//   getMessages: async (parentId: number, userId: number, userType: 'admin'): Promise<Message[]> => {
//     const { data, error } = await supabase.rpc('get_messages_for_admin_with_context', { p_user_id: userId, p_user_type: userType })
//     if (error) throw error
//     const allMessages = parseRowsDates(data || []) as unknown as Message[]
//     return allMessages
//       .filter(m => m.sender_parent_id === parentId || m.recipient_parent_id === parentId)
//       .sort((a, b) => new Date(a.sent_at ?? 0).getTime() - new Date(b.sent_at ?? 0).getTime())
//   },
//   send: async (payload: { sender_admin_id?: number; sender_parent_id?: number; recipient_admin_id?: number; recipient_parent_id?: number; subject: string | null; message_text: string }, userId: number, userType: 'admin'): Promise<Message> => {
//     const { data, error } = await supabase.rpc('send_message_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//       p_sender_admin_id: payload.sender_admin_id ?? null,
//       p_sender_parent_id: payload.sender_parent_id ?? null,
//       p_recipient_admin_id: payload.recipient_admin_id ?? null,
//       p_recipient_parent_id: payload.recipient_parent_id ?? null,
//       p_subject: payload.subject ?? null,
//       p_message_text: payload.message_text,
//     })
//     if (error) throw error
//     return parseRowDates(data || {}) as Message
//   },
//   markAsRead: async (messageId: number, userId: number, userType: 'admin'): Promise<void> => {
//     return withUserContext(userId, userType, async () => {
//       await supabase.from('messages').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', messageId).eq('recipient_admin_id', userId)
//     })
//   },
// }

// // =====================================================
// // REPORTS API
// // =====================================================
// export const reportsSupabaseAPI = {
//   getAll: async (userId: number, userType: 'admin'): Promise<Report[]> => {
//     const { data, error } = await supabase.rpc('get_reports_with_names_and_context', { p_user_id: userId, p_user_type: userType })
//     if (error) throw error
//     const rows = (data || []) as any[]
//     return parseRowsDates(rows) as unknown as Report[]
//   },
//   create: async (data: Omit<Report, 'id' | 'sent_at' | 'is_read' | 'read_at'>, userId: number, userType: 'admin'): Promise<Report> => {
//     const { data: row, error } = await supabase.rpc('send_report_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//       p_student_id: data.student_id,
//       p_parent_id: data.parent_id,
//       p_title: data.title,
//       p_report_text: data.report_text,
//       p_sent_by: data.sent_by,
//     })
//     if (error) throw error
//     const result = Array.isArray(row) ? row[0] : row
//     return parseRowDates(result || {}) as Report
//   },
// }

// // =====================================================
// // PENDING CONTENT API
// // =====================================================
// export const pendingContentSupabaseAPI = {
//   getPendingQuestions: async (userId: number, userType: 'admin'): Promise<PendingContent[]> => {
//     const { data, error } = await supabase.rpc('get_pending_questions_with_context', { p_user_id: userId, p_user_type: userType })
//     if (error) throw error
//     return parseRowsDates(data || []) as unknown as PendingContent[]
//   },
//   getPendingExams: async (userId: number, userType: 'admin'): Promise<PendingContent[]> => {
//     const { data, error } = await supabase.rpc('get_pending_exams_with_context', { p_user_id: userId, p_user_type: userType })
//     if (error) throw error
//     return parseRowsDates(data || []) as unknown as PendingContent[]
//   },
//   approve: async (id: number, reviewedBy: number, userId: number, userType: 'admin'): Promise<void> => {
//     return withUserContext(userId, userType, async () => {
//       const { data: pc, error: fe } = await supabase.from('pending_content').select('*').eq('id', id).single()
//       if (fe || !pc) throw new Error('المحتوى غير موجود')
//       await supabase.from('pending_content').update({ status: 'approved', reviewed_by: reviewedBy, reviewed_at: new Date().toISOString() }).eq('id', id)
//       if (pc.content_type === 'question') {
//         const q = pc.content_data as Record<string, unknown>
//         await supabase.from('questions').insert({
//           question_text: q.question_text,
//           question_type: q.question_type,
//           question_options: q.question_options ?? null,
//           correct_answer: q.correct_answer ?? null,
//           difficulty_level: q.difficulty_level,
//           subject_id: q.subject_id,
//           created_by_teacher: pc.teacher_id,
//           created_by_admin: null,
//           status: 'approved',
//           is_active: true,
//         })
//       } else {
//         const ex = pc.content_data as Record<string, unknown>
//         await supabase.from('exams').insert({
//           title: ex.title as string,
//           description: (ex.description as string) ?? null,
//           subject_id: ex.subject_id as number,
//           grade_id: ex.grade_id as number,
//           section_id: ex.section_id as number,
//           semester_id: ex.semester_id as number,
//           total_marks: 0,
//           passing_marks: (ex.passing_marks as number) ?? 0,
//           duration_minutes: (ex.duration_minutes as number) ?? null,
//           difficulty_level: (ex.difficulty_level as string) ?? null,
//           created_by_teacher: pc.teacher_id,
//           created_by_admin: null,
//           status: 'approved',
//         })
//       }
//     })
//   },
//   reject: async (id: number, reason: string, reviewedBy: number, userId: number, userType: 'admin'): Promise<void> => {
//     return withUserContext(userId, userType, async () => {
//       if (!reason?.trim()) throw new Error('سبب الرفض إلزامي')
//       const { error } = await supabase.from('pending_content').update({ status: 'rejected', rejection_reason: reason, reviewed_by: reviewedBy, reviewed_at: new Date().toISOString() }).eq('id', id)
//       if (error) throw error
//     })
//   },
// }

// // =====================================================
// // DASHBOARD API
// // =====================================================
// export const dashboardSupabaseAPI = {
//   getStats: async (userId: number, userType: 'admin'): Promise<{
//     totalStudents: number
//     totalTeachers: number
//     totalSubjects: number
//     totalQuestions: number
//     pendingExams: number
//     unreadMessages: number
//   }> => {
//     const { data, error } = await supabase.rpc('get_dashboard_stats_with_context', { p_user_id: userId, p_user_type: userType })
//     if (error) throw error
//     const r = (data || {}) as Record<string, number>
//     return {
//       totalStudents: r.totalStudents ?? 0,
//       totalTeachers: r.totalTeachers ?? 0,
//       totalSubjects: r.totalSubjects ?? 0,
//       totalQuestions: r.totalQuestions ?? 0,
//       pendingExams: r.pendingExams ?? 0,
//       unreadMessages: r.unreadMessages ?? 0,
//     }
//   },
//   getWeeklyActivity: async (userId: number, userType: 'admin'): Promise<Array<{ day: string; students: number; teachers: number }>> => {
//     const { data, error } = await supabase.rpc('get_weekly_activity_with_context', { p_user_id: userId, p_user_type: userType })
//     if (error) throw error
//     const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
//     const byDay = days.map(day => ({ day, students: 0, teachers: 0 }))
//     const rows = (Array.isArray(data) ? data : []) as Array<{ day_index: number; students: number; teachers: number }>
//     for (const row of rows) {
//       const i = Number(row.day_index)
//       if (i >= 0 && i <= 6) {
//         byDay[i].students = row.students ?? 0
//         byDay[i].teachers = row.teachers ?? 0
//       }
//     }
//     return byDay
//   },
//   getAverageGradesBySubject: async (userId: number, userType: 'admin'): Promise<Array<{ name: string; average: number }>> => {
//     const { data, error } = await supabase.rpc('get_average_grades_by_subject_with_context', { p_user_id: userId, p_user_type: userType })
//     if (error) throw error
//     const rows = (Array.isArray(data) ? data : []) as Array<{ name: string; average: number }>
//     return rows.map(r => ({ name: r.name ?? 'غير معروف', average: Number(r.average) || 0 }))
//   },


  
// }
// // =====================================================
// // HELPER FUNCTIONS - SEMESTER & GRADE FILTERING
// // =====================================================

// /**
//  * ✅ Helper: جلب المواد حسب الصف والترم
//  * الاستخدام: getSubjectsByGradeAndSemester(gradeId, 'first', userId, userType)
//  */
// export const getSubjectsByGradeAndSemester = async (
//   gradeId: number,
//   semester: 'first' | 'second' | null,
//   userId: number,
//   userType: 'admin' | 'teacher' | 'student' | 'parent'
// ): Promise<Subject[]> => {
//   return withUserContext(userId, userType, async () => {
//     const { data, error } = await supabase
//       .from('subjects')
//       .select('*')
//       .eq('is_active', true)
//       .in(
//         'id',
//         supabase
//           .from('section_subjects')
//           .select('subject_id')
//           .in(
//             'section_id',
//             supabase
//               .from('sections')
//               .select('id')
//               .eq('grade_id', gradeId)
//           )
//       )

//     if (error) throw error

//     let filteredData = data || []

//     // فلترة حسب الترم
//     if (semester !== null) {
//       filteredData = filteredData.filter(
//         (subject: any) => subject.semester === semester || subject.semester === null
//       )
//     }

//     return parseRowsDates(filteredData) as Subject[]
//   })
// }

// /**
//  * ✅ Helper: جلب المواد المتاحة للمعلم مقسمة حسب الترم
//  * الاستخدام: getTeacherSubjectsByGrade(teacherId, gradeId, userId, userType)
//  * العائد: { first: Subject[], second: Subject[], both: Subject[] }
//  */
// export const getTeacherSubjectsByGrade = async (
//   teacherId: number,
//   gradeId: number,
//   userId: number,
//   userType: 'admin' | 'teacher'
// ): Promise<{ first: Subject[]; second: Subject[]; both: Subject[] }> => {
//   return withUserContext(userId, userType, async () => {
//     // جلب جميع الأقسام في الصف
//     const { data: sectionsData, error: sectionsError } = await supabase
//       .from('sections')
//       .select('id')
//       .eq('grade_id', gradeId)

//     if (sectionsError) throw sectionsError

//     const sectionIds = (sectionsData || []).map((s: any) => s.id)

//     if (sectionIds.length === 0) {
//       return { first: [], second: [], both: [] }
//     }

//     // جلب المواد المرتبطة بهذا المعلم في هذه الأقسام
//     const { data: sectionSubjectsData, error: ssError } = await supabase
//       .from('section_subjects')
//       .select('subject_id, subjects(*)')
//       .eq('teacher_id', teacherId)
//       .eq('is_active', true)
//       .in('section_id', sectionIds)

//     if (ssError) throw ssError

//     const subjects = (sectionSubjectsData || [])
//       .map((item: any) => item.subjects)
//       .filter((s: any) => s && s.is_active)
//       .map((s: any) => parseRowDates(s))

//     // إزالة التكرارات
//     const uniqueSubjects = Array.from(
//       new Map(subjects.map((s: Subject) => [s.id, s])).values()
//     )

//     return {
//       first: uniqueSubjects.filter((s: Subject) => (s as any).semester === 'first'),
//       second: uniqueSubjects.filter((s: Subject) => (s as any).semester === 'second'),
//       both: uniqueSubjects.filter((s: Subject) => (s as any).semester === null),
//     }
//   })
// }

// /**
//  * ✅ Helper: جلب الفصول (Chapters) حسب المادة
//  * الاستخدام: getChaptersWithSemester(subjectId, userId, userType)
//  */
// export const getChaptersWithSemester = async (
//   subjectId: number,
//   userId: number,
//   userType: 'admin' | 'teacher' | 'student' | 'parent'
// ): Promise<Chapter[]> => {
//   return withUserContext(userId, userType, async () => {
//     const { data, error } = await supabase.rpc('get_chapters_with_context', {
//       p_user_id: userId,
//       p_user_type: userType,
//       p_subject_id: subjectId,
//     })

//     if (error) throw error
//     return parseRowsDates(data || []) as Chapter[]
//   })
// }

// /**
//  * ✅ Helper: جلب جميع المواد مع معلومات الترم
//  * الاستخدام: getAllSubjectsWithSemester(userId, userType)
//  */
// export const getAllSubjectsWithSemester = async (
//   userId: number,
//   userType: 'admin' | 'teacher' | 'student' | 'parent'
// ): Promise<Subject[]> => {
//   return withUserContext(userId, userType, async () => {
//     const { data, error } = await supabase
//       .from('subjects')
//       .select('*')
//       .eq('is_active', true)
//       .order('semester', { ascending: true })
//       .order('name', { ascending: true })

//     if (error) throw error
//     return parseRowsDates(data || []) as Subject[]
//   })
// }

// /**
//  * ✅ Helper: جلب المواد المرتبطة بالشعبة مع معلومات الترم
//  * الاستخدام: getSectionSubjectsWithSemester(sectionId, userId, userType)
//  */
// export const getSectionSubjectsWithSemester = async (
//   sectionId: number,
//   userId: number,
//   userType: 'admin' | 'teacher' | 'student' | 'parent'
// ): Promise<Array<SectionSubject & { subject_name: string; semester: 'first' | 'second' | null }>> => {
//   return withUserContext(userId, userType, async () => {
//     const { data, error } = await supabase
//       .from('section_subjects')
//       .select(`
//         id,
//         section_id,
//         subject_id,
//         teacher_id,
//         is_active,
//         assigned_at,
//         updated_at,
//         subjects (
//           id,
//           name,
//           semester
//         )
//       `)
//       .eq('section_id', sectionId)
//       .eq('is_active', true)

//     if (error) throw error

//     return (data || []).map((item: any) => ({
//       id: item.id,
//       section_id: item.section_id,
//       subject_id: item.subject_id,
//       teacher_id: item.teacher_id,
//       is_active: item.is_active,
//       assigned_at: item.assigned_at,
//       updated_at: item.updated_at,
//       subject_name: item.subjects?.name || '',
//       semester: item.subjects?.semester || null,
//     }))
//   })
// }

// /**
//  * ✅ Helper: جلب الأسئلة حسب الصف والترم والمادة
//  * الاستخدام: getQuestionsByGradeAndSemester(gradeId, semester, userId, userType)
//  */
// export const getQuestionsByGradeAndSemester = async (
//   gradeId: number,
//   semester: 'first' | 'second' | null,
//   userId: number,
//   userType: 'admin' | 'teacher'
// ): Promise<Question[]> => {
//   return withUserContext(userId, userType, async () => {
//     // جلب المواد أولاً
//     const subjectsData = await getSubjectsByGradeAndSemester(gradeId, semester, userId, userType)
//     const subjectIds = subjectsData.map((s) => s.id)

//     if (subjectIds.length === 0) {
//       return []
//     }

//     // جلب الأسئلة
//     const { data, error } = await supabase
//       .from('questions')
//       .select('*')
//       .in('subject_id', subjectIds)
//       .eq('is_active', true)
//       .eq('status', 'approved')
//       .order('created_at', { ascending: false })

//     if (error) throw error
//     return parseRowsDates(data || []) as Question[]
//   })
// }

// /**
//  * ✅ Helper: فحص ما إذا كانت المادة مرتبطة بالترم المحدد
//  * الاستخدام: isSubjectBoundToSemester(subjectId, semester)
//  */
// export const isSubjectBoundToSemester = async (
//   subjectId: number,
//   semester: 'first' | 'second' | null
// ): Promise<boolean> => {
//   const { data, error } = await supabase
//     .from('subjects')
//     .select('semester')
//     .eq('id', subjectId)
//     .single()

//   if (error) return false

//   if (semester === null) return true // الفصلان معاً
//   return data?.semester === semester || data?.semester === null
// }

// /**
//  * ✅ Helper: جلب درجات الطالب حسب المادة والترم
//  * الاستخدام: getStudentGradesBySubjectAndSemester(studentId, subjectId, semester)
//  */
// export const getStudentGradesBySubjectAndSemester = async (
//   studentId: number,
//   subjectId: number,
//   semester: 'first' | 'second' | null,
//   userId: number,
//   userType: 'admin' | 'teacher' | 'parent'
// ): Promise<ExamResult[]> => {
//   return withUserContext(userId, userType, async () => {
//     const { data, error } = await supabase
//       .from('exam_results')
//       .select(`
//         *,
//         exams (
//           subject_id,
//           semester_id
//         )
//       `)
//       .eq('student_id', studentId)
//       .eq('status', 'completed')
//       .filter('exams.subject_id', 'eq', subjectId)

//     if (error) throw error

//     // فلترة حسب الترم إذا لزم الأمر
//     if (semester !== null) {
//       return parseRowsDates(
//         (data || []).filter((result: any) => {
//           // يمكن إضافة فلترة الترم هنا بناءً على semester_id
//           return true
//         })
//       ) as ExamResult[]
//     }

//     return parseRowsDates(data || []) as ExamResult[]
//   })
// }

// /**
//  * ✅ Helper: جلب إحصائيات المادة حسب الترم
//  * الاستخدام: getSubjectStatisticsBySemester(gradeId, semester)
//  */
// export const getSubjectStatisticsBySemester = async (
//   gradeId: number,
//   semester: 'first' | 'second' | null,
//   userId: number,
//   userType: 'admin' | 'teacher'
// ): Promise<Array<{
//   subjectId: number
//   subjectName: string
//   semester: 'first' | 'second' | null
//   questionsCount: number
//   chaptersCount: number
//   assignedTeachers: number
// }>> => {
//   return withUserContext(userId, userType, async () => {
//     const subjects = await getSubjectsByGradeAndSemester(gradeId, semester, userId, userType)

//     const stats = await Promise.all(
//       subjects.map(async (subject) => {
//         // عد الأسئلة
//         const { count: questionsCount } = await supabase
//           .from('questions')
//           .select('id', { count: 'exact', head: true })
//           .eq('subject_id', subject.id)
//           .eq('is_active', true)
//           .eq('status', 'approved')

//         // عد الفصول
//         const { count: chaptersCount } = await supabase
//           .from('chapters')
//           .select('id', { count: 'exact', head: true })
//           .eq('subject_id', subject.id)
//           .eq('is_active', true)

//         // عد المعلمين المرتبطين
//         const { count: assignedTeachers } = await supabase
//           .from('section_subjects')
//           .select('teacher_id', { count: 'exact', head: true })
//           .eq('subject_id', subject.id)
//           .eq('is_active', true)

//         return {
//           subjectId: subject.id,
//           subjectName: subject.name,
//           semester: (subject as any).semester as 'first' | 'second' | null,
//           questionsCount: questionsCount || 0,
//           chaptersCount: chaptersCount || 0,
//           assignedTeachers: assignedTeachers || 0,
//         }
//       })
//     )

//     return stats
//   })
// }

// /**
//  * ✅ Helper: جلب معلمي الصف مع مواده حسب الترم
//  * الاستخدام: getGradeTeachersWithSubjects(gradeId, semester)
//  */
// export const getGradeTeachersWithSubjects = async (
//   gradeId: number,
//   semester: 'first' | 'second' | null,
//   userId: number,
//   userType: 'admin' | 'teacher'
// ): Promise<Array<{
//   teacherId: number
//   teacherName: string
//   subjects: Array<{
//     subjectId: number
//     subjectName: string
//     sections: string[]
//   }>
// }>> => {
//   return withUserContext(userId, userType, async () => {
//     // جلب الأقسام في الصف
//     const { data: sectionsData } = await supabase
//       .from('sections')
//       .select('id, name')
//       .eq('grade_id', gradeId)

//     const sectionIds = (sectionsData || []).map((s) => s.id)
//     const sectionIdToName: Record<number, string> = {}
//     sectionsData?.forEach((s: any) => {
//       sectionIdToName[s.id] = s.name
//     })

//     if (sectionIds.length === 0) {
//       return []
//     }

//     // جلب المعلمين والمواد
//     const { data: ssData } = await supabase
//       .from('section_subjects')
//       .select(`
//         teacher_id,
//         subject_id,
//         section_id,
//         teachers (
//           id,
//           full_name
//         ),
//         subjects (
//           id,
//           name,
//           semester
//         )
//       `)
//       .in('section_id', sectionIds)
//       .eq('is_active', true)

//     if (!ssData) return []

//     // فلترة حسب الترم
//     const filtered = ssData.filter((item: any) => {
//       if (semester === null) return true
//       return item.subjects?.semester === semester || item.subjects?.semester === null
//     })

//     // تجميع البيانات
//     const teacherMap = new Map<
//       number,
//       { teacherName: string; subjectsMap: Map<number, { subjectName: string; sections: Set<string> }> }
//     >()

//     filtered.forEach((item: any) => {
//       const teacherId = item.teacher_id
//       const subjectId = item.subject_id
//       const sectionId = item.section_id

//       if (!teacherMap.has(teacherId)) {
//         teacherMap.set(teacherId, {
//           teacherName: item.teachers?.full_name || '',
//           subjectsMap: new Map(),
//         })
//       }

//       const teacher = teacherMap.get(teacherId)!
//       if (!teacher.subjectsMap.has(subjectId)) {
//         teacher.subjectsMap.set(subjectId, {
//           subjectName: item.subjects?.name || '',
//           sections: new Set(),
//         })
//       }

//       teacher.subjectsMap.get(subjectId)!.sections.add(sectionIdToName[sectionId] || '')
//     })

//     // تحويل إلى array
//     return Array.from(teacherMap.entries()).map(([teacherId, teacher]) => ({
//       teacherId,
//       teacherName: teacher.teacherName,
//       subjects: Array.from(teacher.subjectsMap.entries()).map(([subjectId, subject]) => ({
//         subjectId,
//         subjectName: subject.subjectName,
//         sections: Array.from(subject.sections),
//       })),
//     }))
//   })
// }

// /**
//  * ✅ Helper: التحقق من تعارض الربط (نفس المادة بمعلمات مختلفة)
//  * الاستخدام: checkSubjectTeacherConflict(sectionId, subjectId)
//  */
// export const checkSubjectTeacherConflict = async (
//   sectionId: number,
//   subjectId: number
// ): Promise<{ conflict: boolean; existingTeacher?: string }> => {
//   const { data, error } = await supabase
//     .from('section_subjects')
//     .select(`
//       teacher_id,
//       teachers (
//         full_name
//       )
//     `)
//     .eq('section_id', sectionId)
//     .eq('subject_id', subjectId)
//     .eq('is_active', true)
//     .limit(1)

//   if (error) throw error

//   if (data && data.length > 0) {
//     return {
//       conflict: true,
//       existingTeacher: data[0].teachers?.full_name,
//     }
//   }

//   return { conflict: false }
// }

// /**
//  * ✅ Helper: جلب الأسئلة المشتركة بين الترمين
//  * الاستخدام: getSharedQuestionsBetweenSemesters(gradeId)
//  */
// export const getSharedQuestionsBetweenSemesters = async (
//   gradeId: number,
//   userId: number,
//   userType: 'admin' | 'teacher'
// ): Promise<Question[]> => {
//   return withUserContext(userId, userType, async () => {
//     // جلب المواد التي الفصلان معاً (semester = null)
//     const { data: subjectsData } = await supabase
//       .from('subjects')
//       .select('id')
//       .is('semester', null)
//       .eq('is_active', true)

//     const subjectIds = (subjectsData || []).map((s) => s.id)

//     if (subjectIds.length === 0) {
//       return []
//     }

//     // جلب الأسئلة من هذه المواد
//     const { data, error } = await supabase
//       .from('questions')
//       .select('*')
//       .in('subject_id', subjectIds)
//       .eq('is_active', true)
//       .eq('status', 'approved')

//     if (error) throw error
//     return parseRowsDates(data || []) as Question[]
//   })
// }



import { supabase, setUserContext } from '../lib/supabase'
import { parseRowDates, parseRowsDates } from '../lib/supabaseHelpers'
import type {
  Admin, Teacher, Student, Parent, Grade, Semester, Section, Subject,
  SectionSubject, Question, Exam, ExamQuestion, ExamResult, Attendance,
  Message, Report, PendingContent, SchoolSettings,
  ParentStudent, ApprovalStatus, Chapter
} from '../types'

// =====================================================
// TYPE DEFINITIONS - جديدة
// =====================================================
type SemesterKey = 'first' | 'second' | null

interface SectionSubjectWithSemester extends SectionSubject {
  subject_name: string
  teacher_name: string
  section_name: string
  semester: SemesterKey
}

interface SubjectsGroupedBySemester {
  first: Subject[]
  second: Subject[]
  both: Subject[]
}

// =====================================================
// Helper: Execute query with user context
// =====================================================
async function withUserContext<T>(
  userId: number | null,
  userType: 'admin' | 'teacher' | 'student' | 'parent' | null,
  fn: () => Promise<T>
): Promise<T> {
  if (userId && userType) {
    await setUserContext(userId, userType)
  }
  return fn()
}

// =====================================================
// HELPER FUNCTIONS - جديدة للترم
// =====================================================

/**
 * ✅ Helper: تحويل قيمة الترم إلى label
 */
export function getSemesterLabel(semester: SemesterKey): string {
  if (semester === 'first') return 'الفصل الدراسي الأول'
  if (semester === 'second') return 'الفصل الدراسي الثاني'
  return 'الفصلان الدراسيان معاً'
}

/**
 * ✅ Helper: تحويل قيمة الترم إلى رمز
 */
export function getSemesterBadge(semester: SemesterKey): { label: string; color: string; badge: string } {
  if (semester === 'first') {
    return {
      label: 'الأول',
      color: 'from-blue-500 to-indigo-600',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
    }
  }
  if (semester === 'second') {
    return {
      label: 'الثاني',
      color: 'from-emerald-500 to-teal-600',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    }
  }
  return {
    label: 'الفصلان',
    color: 'from-gray-400 to-gray-500',
    badge: 'bg-gray-50 text-gray-600 border-gray-200',
  }
}

/**
 * ✅ Helper: جلب المواد حسب الترم من قائمة
 */
export function filterSubjectsBySemester(subjects: Subject[], semester: SemesterKey): Subject[] {
  if (semester === null) {
    return subjects
  }
  return subjects.filter((s) => (s as any).semester === semester || (s as any).semester === null)
}

/**
 * ✅ Helper: تجميع المواد حسب الترم
 */
export function groupSubjectsBySemester(subjects: Subject[]): SubjectsGroupedBySemester {
  return {
    first: subjects.filter((s) => (s as any).semester === 'first'),
    second: subjects.filter((s) => (s as any).semester === 'second'),
    both: subjects.filter((s) => (s as any).semester === null),
  }
}

// =====================================================
// AUTH API
// =====================================================
export const authSupabaseAPI = {
  // Login is handled in authStore.ts
}

// =====================================================
// SCHOOL SETTINGS API
// =====================================================
export const schoolSettingsSupabaseAPI = {
  /** Public fetch (no auth) - for Login page and Layout header */
  getPublic: async (): Promise<Record<string, unknown>> => {
    const { data, error } = await supabase
      .from('school_settings')
      .select('*')
      .single()
    if (error) throw error
    return parseRowDates(data || {}) as any
  },

  get: async (userId: number, userType: 'admin'): Promise<SchoolSettings> => {
    return withUserContext(userId, userType, async () => {
      const { data, error } = await supabase
        .from('school_settings')
        .select('*')
        .single()
      if (error) throw error
      return parseRowDates(data || {}) as SchoolSettings
    })
  },

  update: async (data: Partial<SchoolSettings>, userId: number, userType: 'admin'): Promise<SchoolSettings> => {
    return withUserContext(userId, userType, async () => {
      const { error } = await supabase
        .from('school_settings')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', 1)

      if (error) throw error

      const { data: updated, error: fetchError } = await supabase
        .from('school_settings')
        .select('*')
        .single()

      if (fetchError) throw fetchError
      return parseRowDates(updated || {}) as SchoolSettings
    })
  },
}

// =====================================================
// ADMINS API
// =====================================================
export const adminsSupabaseAPI = {
  getAll: async (userId: number, userType: 'admin'): Promise<Admin[]> => {
    return withUserContext(userId, userType, async () => {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      return parseRowsDates((data || []).map((admin: any) => ({ ...admin, password_hash: '' }))) as Admin[]
    })
  },

  getById: async (adminId: number, userId: number, userType: 'admin'): Promise<Admin> => {
    const { data: rows, error } = await supabase.rpc('get_admin_by_id_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_admin_id: adminId,
    })
    if (error) throw error
    const row = Array.isArray(rows) ? rows[0] : rows
    if (!row) throw new Error('المسؤول غير موجود')
    return parseRowDates({ ...row, password_hash: '' }) as Admin
  },

  updateProfileImage: async (
    adminId: number,
    profile_image_url: string,
    profile_image_storage_path: string,
    userId: number,
    userType: 'admin'
  ): Promise<Admin> => {
    const { data: rows, error } = await supabase.rpc('update_admin_profile_image_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_admin_id: adminId,
      p_profile_image_url: profile_image_url,
      p_profile_image_storage_path: profile_image_storage_path,
    })
    if (error) throw error
    const row = Array.isArray(rows) ? rows[0] : rows
    if (!row) throw new Error('المسؤول غير موجود أو لا يسمح بتحديث الصورة')
    return parseRowDates({ ...row, password_hash: '' }) as Admin
  },

  updatePassword: async (
    adminId: number,
    currentPassword: string,
    newPassword: string,
    userId: number,
    userType: 'admin'
  ): Promise<void> => {
    return withUserContext(userId, userType, async () => {
      const { data: admin, error: fetchError } = await supabase
        .from('admins')
        .select('password_hash')
        .eq('id', adminId)
        .single()

      if (fetchError || !admin) throw new Error('المسؤول غير موجود')

      const { data: verified, error: verifyError } = await supabase.rpc('verify_password', {
        p_password_hash: admin.password_hash,
        p_password: currentPassword,
      })

      if (verifyError || !verified) {
        throw new Error('كلمة السر الحالية غير صحيحة')
      }

      const { data: newHash, error: hashError } = await supabase.rpc('hash_password', {
        p_password: newPassword,
      })

      if (hashError) {
        throw new Error('خطأ في تشفير كلمة السر الجديدة')
      }

      const { error: updateError } = await supabase
        .from('admins')
        .update({
          password_hash: newHash,
          updated_at: new Date().toISOString(),
        })
        .eq('id', adminId)

      if (updateError) throw updateError
    })
  },
}

// =====================================================
// TEACHERS API
// =====================================================
export const teachersSupabaseAPI = {
  getAll: async (
    userId: number,
    userType: 'admin' | 'teacher',
    params?: { search?: string; sortBy?: string }
  ): Promise<Teacher[]> => {
    const { data, error } = await supabase.rpc('get_teachers_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_search: params?.search || null,
      p_sort_by: params?.sortBy || 'created_at',
    })
    if (error) throw error
    return parseRowsDates((data || []).map((t: Record<string, unknown>) => ({ ...t, password_hash: '' }))) as unknown as Teacher[]
  },

  getById: async (id: number, userId: number, userType: 'admin' | 'teacher'): Promise<Teacher> => {
    const { data, error } = await supabase.rpc('get_teacher_by_id_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_id: id,
    })
    if (error) throw new Error('المعلم غير موجود')
    const row = Array.isArray(data) ? data[0] : data
    if (!row) throw new Error('المعلم غير موجود')
    return parseRowDates({ ...row, password_hash: '' }) as Teacher
  },

  create: async (
    data: Omit<Teacher, 'id' | 'teacher_code' | 'created_at' | 'updated_at' | 'deleted_at' | 'deleted_by'>,
    userId: number,
    userType: 'admin'
  ): Promise<Teacher> => {
    const rawPassword = (data.password_hash && String(data.password_hash).trim()) ? data.password_hash : '123456'
    const { data: hashedPassword, error: hashError } = await supabase.rpc('hash_password', {
      p_password: rawPassword,
    })
    if (hashError) throw new Error('خطأ في تشفير كلمة السر')
    const payload = {
      full_name: data.full_name,
      phone_number: data.phone_number ?? '',
      email: data.email ?? null,
      password_hash: hashedPassword || rawPassword,
      is_active: data.is_active ?? true,
    }
    const { data: rows, error } = await supabase.rpc('insert_teacher_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_payload: payload,
    })
    if (error) throw error
    const row = Array.isArray(rows) ? rows[0] : rows
    if (!row) throw new Error('فشل إضافة المعلم')
    return parseRowDates({ ...row, password_hash: '' }) as Teacher
  },

  update: async (
    id: number,
    data: Partial<Teacher>,
    userId: number,
    userType: 'admin'
  ): Promise<Teacher> => {
    const payload: Record<string, unknown> = {}
    if (data.full_name !== undefined) payload.full_name = data.full_name
    if (data.phone_number !== undefined) payload.phone_number = data.phone_number
    if (data.email !== undefined) payload.email = data.email
    if (data.is_active !== undefined) payload.is_active = data.is_active
    const { data: rows, error } = await supabase.rpc('update_teacher_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_id: id,
      p_payload: payload,
    })
    if (error) throw error
    const row = Array.isArray(rows) ? rows[0] : rows
    if (!row) throw new Error('المعلم غير موجود')
    return parseRowDates({ ...row, password_hash: '' }) as Teacher
  },

  delete: async (id: number, deletedBy: number, userId: number, userType: 'admin'): Promise<void> => {
    const { error } = await supabase.rpc('delete_teacher_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_teacher_id: id,
      p_deleted_by: deletedBy,
    })
    if (error) throw new Error(error.message)
  },
}

// =====================================================
// GRADES API
// =====================================================
export const gradesSupabaseAPI = {
  getAll: async (userId: number, userType: 'admin' | 'teacher' | 'student' | 'parent'): Promise<Grade[]> => {
    const { data, error } = await supabase.rpc('get_grades_with_context', {
      p_user_id: userId,
      p_user_type: userType,
    })
    if (error) throw error
    return parseRowsDates(data || []) as unknown as Grade[]
  },

  getById: async (id: number, userId: number, userType: 'admin' | 'teacher' | 'student' | 'parent'): Promise<Grade> => {
    const all = await gradesSupabaseAPI.getAll(userId, userType)
    const row = all.find((g) => g.id === id)
    if (!row) throw new Error('الصف غير موجود')
    return row
  },
}

// =====================================================
// SEMESTERS API
// =====================================================
export const semestersSupabaseAPI = {
  getAll: async (userId: number, userType: 'admin' | 'teacher' | 'student' | 'parent'): Promise<Semester[]> => {
    const { data, error } = await supabase.rpc('get_semesters_with_context', {
      p_user_id: userId,
      p_user_type: userType,
    })
    if (error) throw error
    return parseRowsDates(data || []) as unknown as Semester[]
  },
}

// =====================================================
// SECTIONS API
// =====================================================
export const sectionsSupabaseAPI = {
  getByGrade: async (
    gradeId: number,
    userId: number,
    userType: 'admin' | 'teacher' | 'student' | 'parent'
  ): Promise<Section[]> => {
    const { data, error } = await supabase.rpc('get_sections_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_grade_id: gradeId,
    })
    if (error) throw error
    return parseRowsDates(data || []) as unknown as Section[]
  },

  create: async (
    data: Omit<Section, 'id' | 'created_at' | 'updated_at'>,
    userId: number,
    userType: 'admin'
  ): Promise<Section> => {
    const payload = {
      name: data.name,
      grade_id: data.grade_id,
      capacity: data.capacity ?? null,
      is_active: data.is_active ?? true,
    }
    const { data: rows, error } = await supabase.rpc('insert_section_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_payload: payload,
    })
    if (error) throw error
    const row = Array.isArray(rows) ? rows[0] : rows
    if (!row) throw new Error('فشل إضافة الشعبة')
    return parseRowDates(row) as Section
  },

  delete: async (id: number, userId: number, userType: 'admin'): Promise<void> => {
    return withUserContext(userId, userType, async () => {
      const { data: students, error: checkError } = await supabase
        .from('students')
        .select('id')
        .eq('section_id', id)
        .is('deleted_at', null)
        .limit(1)

      if (checkError) throw checkError

      if (students && students.length > 0) {
        throw new Error('لا يمكن حذف الشعبة لأن فيها طلاب')
      }

      const { error } = await supabase
        .from('sections')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
    })
  },

  getStudentCount: async (sectionId: number, userId: number, userType: 'admin' | 'teacher'): Promise<number> => {
    const { data, error } = await supabase.rpc('get_student_count_by_section_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_section_id: sectionId,
    })
    if (error) throw error
    return typeof data === 'number' ? data : Number(data) || 0
  },
}

// =====================================================
// SUBJECTS API
// =====================================================
export const subjectsSupabaseAPI = {
  getAll: async (
    userId: number,
    userType: 'admin' | 'teacher' | 'student' | 'parent',
    _params?: { sortBy?: string }
  ): Promise<Subject[]> => {
    const { data, error } = await supabase.rpc('get_subjects_with_context', {
      p_user_id: userId,
      p_user_type: userType,
    })
    if (error) throw error
    return parseRowsDates(data || []) as unknown as Subject[]
  },

  getById: async (
    id: number,
    userId: number,
    userType: 'admin' | 'teacher' | 'student' | 'parent'
  ): Promise<Subject> => {
    const { data, error } = await supabase.rpc('get_subject_by_id_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_id: id,
    })
    if (error) throw new Error('المادة غير موجودة')
    const row = Array.isArray(data) ? data[0] : data
    if (!row) throw new Error('المادة غير موجودة')
    return parseRowDates(row) as Subject
  },

  getByIds: async (
    ids: number[],
    userId: number,
    userType: 'admin' | 'teacher' | 'student' | 'parent'
  ): Promise<Subject[]> => {
    if (ids.length === 0) return []
    return withUserContext(userId, userType, async () => {
      const { data, error } = await supabase.from('subjects').select('*').in('id', ids)
      if (error) throw error
      return parseRowsDates(data || []) as unknown as Subject[]
    })
  },

  create: async (
    data: Omit<Subject, 'id' | 'subject_code' | 'created_at' | 'updated_at'>,
    userId: number,
    userType: 'admin'
  ): Promise<Subject> => {
    const payload = {
      name: data.name,
      description: data.description ?? null,
      is_active: data.is_active ?? true,
      semester: (data as any).semester ?? null,
    }
    const { data: rows, error } = await supabase.rpc('insert_subject_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_payload: payload,
    })
    if (error) throw error
    const row = Array.isArray(rows) ? rows[0] : rows
    if (!row) throw new Error('فشل إضافة المادة')
    return parseRowDates(row) as Subject
  },

  update: async (
    id: number,
    data: Partial<Subject>,
    userId: number,
    userType: 'admin'
  ): Promise<Subject> => {
    const payload: Record<string, unknown> = {}
    if (data.name !== undefined) payload.name = data.name
    if (data.description !== undefined) payload.description = data.description
    if (data.is_active !== undefined) payload.is_active = data.is_active
    if (data.pdf_url !== undefined) payload.pdf_url = data.pdf_url
    if (data.pdf_storage_path !== undefined) payload.pdf_storage_path = data.pdf_storage_path
    if (data.pdf_filename !== undefined) payload.pdf_filename = data.pdf_filename
    if (data.pdf_size !== undefined) payload.pdf_size = data.pdf_size
    if ((data as any).semester !== undefined) payload.semester = (data as any).semester ?? null

    const { data: rows, error } = await supabase.rpc('update_subject_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_id: id,
      p_payload: payload,
    })
    if (error) throw error
    const row = Array.isArray(rows) ? rows[0] : rows
    if (!row) throw new Error('المادة غير موجودة')
    return parseRowDates(row) as Subject
  },

  delete: async (id: number, userId: number, userType: 'admin'): Promise<void> => {
    return withUserContext(userId, userType, async () => {
      const { data: linked, error: checkError } = await supabase
        .from('section_subjects')
        .select('id')
        .eq('subject_id', id)
        .eq('is_active', true)
        .limit(1)

      if (checkError) throw checkError

      if (linked && linked.length > 0) {
        throw new Error('لا يمكن حذف المادة لأنها مرتبطة بصفوف ومعلمين')
      }

      const { error } = await supabase
        .from('subjects')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
    })
  },

  // ✅ جديدة: جلب المواد حسب الترم
  getAll_BySemester: async (
    userId: number,
    userType: 'admin' | 'teacher' | 'student' | 'parent',
    semester: SemesterKey
  ): Promise<Subject[]> => {
    const all = await subjectsSupabaseAPI.getAll(userId, userType)
    return filterSubjectsBySemester(all, semester)
  },

  // ✅ جديدة: جلب المواد مجمعة حسب الترم
  getAll_Grouped: async (
    userId: number,
    userType: 'admin' | 'teacher' | 'student' | 'parent'
  ): Promise<SubjectsGroupedBySemester> => {
    const all = await subjectsSupabaseAPI.getAll(userId, userType)
    return groupSubjectsBySemester(all)
  },
}

// =====================================================
// CHAPTERS API
// =====================================================
export const chaptersSupabaseAPI = {
  getAll: async (
    userId: number,
    userType: 'admin' | 'teacher',
    params?: { subjectId?: number }
  ): Promise<Chapter[]> => {
    const { data, error } = await supabase.rpc('get_chapters_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_subject_id: params?.subjectId ?? null,
    })
    if (error) throw error
    return parseRowsDates(data || []) as unknown as Chapter[]
  },

  getBySubject: async (
    subjectId: number,
    userId: number,
    userType: 'admin' | 'teacher'
  ): Promise<Chapter[]> => {
    const { data, error } = await supabase.rpc('get_chapters_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_subject_id: subjectId,
    })
    if (error) throw error
    return parseRowsDates(data || []) as unknown as Chapter[]
  },

  getById: async (
    id: number,
    userId: number,
    userType: 'admin' | 'teacher'
  ): Promise<Chapter> => {
    const { data, error } = await supabase.rpc('get_chapters_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_subject_id: null,
    })
    if (error) throw new Error('الفصل غير موجود')
    const rows = (Array.isArray(data) ? data : []) as any[]
    const row = rows.find((r: any) => r.id === id)
    if (!row) throw new Error('الفصل غير موجود')
    return parseRowDates(row) as Chapter
  },

  create: async (
    data: Omit<Chapter, 'id' | 'created_at' | 'updated_at'>,
    userId: number,
    userType: 'admin'
  ): Promise<Chapter> => {
    const payload = {
      subject_id: data.subject_id,
      name: data.name,
      description: data.description ?? null,
      order_index: data.order_index ?? 0,
      is_active: data.is_active ?? true,
    }
    const { data: rows, error } = await supabase.rpc('insert_chapter_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_payload: payload,
    })
    if (error) throw error
    const row = Array.isArray(rows) ? rows[0] : rows
    if (!row) throw new Error('فشل إضافة الفصل')
    return parseRowDates(row) as Chapter
  },

  update: async (
    id: number,
    data: Partial<Chapter>,
    userId: number,
    userType: 'admin'
  ): Promise<Chapter> => {
    const payload: Record<string, unknown> = {}
    if (data.name !== undefined) payload.name = data.name
    if (data.description !== undefined) payload.description = data.description
    if (data.order_index !== undefined) payload.order_index = data.order_index
    if (data.is_active !== undefined) payload.is_active = data.is_active
    const { data: rows, error } = await supabase.rpc('update_chapter_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_id: id,
      p_payload: payload,
    })
    if (error) throw error
    const row = Array.isArray(rows) ? rows[0] : rows
    if (!row) throw new Error('الفصل غير موجود')
    return parseRowDates(row) as Chapter
  },

  delete: async (id: number, userId: number, userType: 'admin'): Promise<void> => {
    const { data: used } = await supabase
      .from('questions')
      .select('id')
      .eq('chapter_id', id)
      .eq('is_active', true)
      .limit(1)
    if (used && used.length > 0) {
      throw new Error('لا يمكن حذف الفصل لأنه يحتوي على أسئلة')
    }
    const payload = { is_active: false }
    const { error } = await supabase.rpc('update_chapter_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_id: id,
      p_payload: payload,
    })
    if (error) throw error
  },
}

// =====================================================
// SECTION SUBJECTS API
// =====================================================
export const sectionSubjectsSupabaseAPI = {
  getByGrade: async (
    gradeId: number,
    userId: number,
    userType: 'admin' | 'teacher',
    semesterId?: number 
  ): Promise<
    Array<
      SectionSubject & {
        subject_name: string
        teacher_name: string
        section_name: string
      }
    >
  > => {
    const { data, error } = await supabase.rpc(
      'get_section_subjects_with_names_by_grade_with_context',
      {
        p_user_id: userId,
        p_user_type: userType,
        p_grade_id: gradeId,
          p_semester_id: semesterId || null, 
      }
    )
    if (error) throw error
    return parseRowsDates(data ?? []) as unknown as Array<
      SectionSubject & {
        subject_name: string
        teacher_name: string
        section_name: string
      }
    >
  },

  // ✅ جديدة: جلب مع معلومات الترم
  getByGrade_WithSemester: async (
    gradeId: number,
    userId: number,
    userType: 'admin' | 'teacher'
  ): Promise<SectionSubjectWithSemester[]> => {
    const { data, error } = await supabase.rpc(
      'get_section_subjects_with_names_by_grade_with_context',
      {
        p_user_id: userId,
        p_user_type: userType,
        p_grade_id: gradeId,
      }
    )
    if (error) throw error

    // جلب معلومات الترم من جدول subjects
    const enrichedData = await Promise.all(
      (data ?? []).map(async (item: any) => {
        const subjectData = await supabase
          .from('subjects')
          .select('semester')
          .eq('id', item.subject_id)
          .single()

        return {
          ...item,
          semester: (subjectData.data?.semester as SemesterKey) ?? null,
        }
      })
    )

    return parseRowsDates(enrichedData) as unknown as SectionSubjectWithSemester[]
  },

  getBySection: async (
    sectionId: number,
    userId: number,
    userType: 'admin' | 'teacher'
  ): Promise<SectionSubject[]> => {
    return withUserContext(userId, userType, async () => {
      const { data, error } = await supabase
        .from('section_subjects')
        .select('*')
        .eq('section_id', sectionId)
        .eq('is_active', true)
      if (error) throw error
      return parseRowsDates(data ?? []) as unknown as SectionSubject[]
    })
  },

  getByTeacher: async (
    teacherId: number,
    userId: number,
    userType: 'admin' | 'teacher'
  ): Promise<SectionSubject[]> => {
    const { data, error } = await supabase.rpc(
      'get_section_subjects_by_teacher_with_context',
      {
        p_user_id: userId,
        p_user_type: userType,
        p_teacher_id: teacherId,
      }
    )
    if (error) throw error
    return parseRowsDates(data ?? []) as unknown as SectionSubject[]
  },

  create: async (
    data: Omit<SectionSubject, 'id' | 'assigned_at' | 'updated_at'>,
    userId: number,
    userType: 'admin'
  ): Promise<SectionSubject> => {
    const { data: rows, error } = await supabase.rpc(
      'insert_section_subject_with_context',
      {
        p_user_id: userId,
        p_user_type: userType,
        p_section_id: data.section_id,
        p_subject_id: data.subject_id,
        p_teacher_id: data.teacher_id,
         p_semester_id: data.semester_id || null,
      }
    )
    if (error) {
      if (
        error.message?.includes('duplicate') ||
        error.message?.includes('uq_section_subject')
      ) {
        throw new Error('هذه المادة في هذه الشعبة مرتبطة بمعلم آخر بالفعل')
      }
      throw error
    }
    const row = Array.isArray(rows) ? rows[0] : rows
    if (!row) throw new Error('فشل ربط المادة بالشعبة')
    return parseRowDates(row) as SectionSubject
  },

  delete: async (id: number, userId: number, userType: 'admin'): Promise<void> => {
    const { error } = await supabase.rpc(
      'delete_section_subject_with_context',
      {
        p_user_id: userId,
        p_user_type: userType,
        p_id: id,
      }
    )
    if (error) throw error
  },

  // ✅ جديدة: فحص التضارب قبل الربط
  checkConflict: async (
    sectionId: number,
    subjectId: number,
    userId: number,
    userType: 'admin' | 'teacher'
  ): Promise<{ conflict: boolean; existingTeacherId?: number; existingTeacherName?: string }> => {
    return withUserContext(userId, userType, async () => {
      const { data, error } = await supabase
        .from('section_subjects')
        .select(`
          teacher_id,
          teachers (
            full_name
          )
        `)
        .eq('section_id', sectionId)
        .eq('subject_id', subjectId)
        .eq('is_active', true)
        .limit(1)

      if (error) throw error

      if (data && data.length > 0) {
        return {
          conflict: true,
          existingTeacherId: data[0].teacher_id,
          existingTeacherName: (data[0].teachers as any)?.full_name,
        }
      }

      return { conflict: false }
    })
  },
}

// =====================================================
// STUDENTS API
// =====================================================
export const studentsSupabaseAPI = {
  getAll: async (
    userId: number,
    userType: 'admin' | 'teacher',
    params?: { search?: string; gradeId?: number }
  ): Promise<Student[]> => {
    const { data, error } = await supabase.rpc('get_students_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_search: params?.search || null,
      p_grade_id: params?.gradeId || null,
    })
    if (error) throw error
    return parseRowsDates((data || []).map((s: Record<string, unknown>) => ({ ...s, password_hash: '' }))) as unknown as Student[]
  },

  getById: async (
    id: number,
    userId: number,
    userType: 'admin' | 'teacher'
  ): Promise<Student> => {
    const { data, error } = await supabase.rpc('get_student_by_id_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_id: id,
    })
    if (error) throw new Error('الطالب غير موجود')
    const row = Array.isArray(data) ? data[0] : data
    if (!row) throw new Error('الطالب غير موجود')
    return parseRowDates({ ...row, password_hash: '' }) as Student
  },

  create: async (
    data: Omit<Student, 'id' | 'student_code' | 'created_at' | 'updated_at' | 'deleted_at' | 'deleted_by'>,
    userId: number,
    userType: 'admin'
  ): Promise<Student> => {
    const { data: hashed, error: hashErr } = await supabase.rpc('hash_password', {
      p_password: data.password_hash || '123456',
    })
    if (hashErr) throw new Error('خطأ في تشفير كلمة السر')
    const payload = {
      full_name: data.full_name,
      phone_number: data.phone_number ?? null,
      email: data.email ?? null,
      section_id: data.section_id ?? null,
      password_hash: hashed ?? data.password_hash,
      is_active: data.is_active ?? true,
    }
    const { data: rows, error } = await supabase.rpc('insert_student_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_payload: payload,
    })
    if (error) throw error
    const row = Array.isArray(rows) ? rows[0] : rows
    if (!row) throw new Error('فشل إضافة الطالب')
    return parseRowDates({ ...row, password_hash: '' }) as Student
  },

  update: async (
    id: number,
    data: Partial<Student>,
    userId: number,
    userType: 'admin'
  ): Promise<Student> => {
    const payload: Record<string, unknown> = {}
    if (data.full_name !== undefined) payload.full_name = data.full_name
    if (data.phone_number !== undefined) payload.phone_number = data.phone_number
    if (data.email !== undefined) payload.email = data.email
    if (data.section_id !== undefined) payload.section_id = data.section_id
    if (data.is_active !== undefined) payload.is_active = data.is_active
    const { data: rows, error } = await supabase.rpc('update_student_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_id: id,
      p_payload: payload,
    })
    if (error) throw error
    const row = Array.isArray(rows) ? rows[0] : rows
    if (!row) throw new Error('الطالب غير موجود')
    return parseRowDates({ ...row, password_hash: '' }) as Student
  },

  delete: async (
    id: number,
    deletedBy: number,
    userId: number,
    userType: 'admin'
  ): Promise<void> => {
    return withUserContext(userId, userType, async () => {
      const { error } = await supabase
        .from('students')
        .update({ deleted_at: new Date().toISOString(), deleted_by: deletedBy })
        .eq('id', id)
      if (error) throw error
    })
  },

  importFromExcel: async (
    students: Array<{ full_name: string; phone_number?: string; gradeName: string; sectionName: string }>,
    userId: number,
    userType: 'admin'
  ): Promise<{ success: number; failed: number; errors: string[] }> => {
    return withUserContext(userId, userType, async () => {
      const errors: string[] = []
      let success = 0
      const { data: grades } = await supabase
        .from('grades')
        .select('id, name')
        .eq('is_active', true)
      const gradeByName = new Map((grades || []).map((g: any) => [g.name, g.id]))
      for (const s of students) {
        const gradeId = gradeByName.get(s.gradeName)
        if (!gradeId) {
          errors.push(`الصف "${s.gradeName}" غير موجود`)
          continue
        }
        const { data: secs } = await supabase
          .from('sections')
          .select('id')
          .eq('grade_id', gradeId)
          .eq('name', s.sectionName)
          .eq('is_active', true)
          .limit(1)
        const sectionId = secs?.[0]?.id
        if (!sectionId) {
          errors.push(`الشعبة "${s.sectionName}" غير موجودة في ${s.gradeName}`)
          continue
        }
        const { data: hash } = await supabase.rpc('hash_password', { p_password: '123456' })
        const { error: ins } = await supabase.from('students').insert({
          full_name: s.full_name,
          phone_number: s.phone_number || null,
          email: null,
          section_id: sectionId,
          password_hash: hash || 'hash',
          is_active: true,
        })
        if (ins) errors.push(`خطأ في إضافة ${s.full_name}: ${ins.message}`)
        else success++
      }
      return { success, failed: students.length - success, errors }
    })
  },
}

// =====================================================
// PARENTS API (لم تتغير)
// =====================================================
export const parentsSupabaseAPI = {
  getAll: async (userId: number, userType: 'admin'): Promise<Parent[]> => {
    const { data, error } = await supabase.rpc('get_parents_with_context', {
      p_user_id: userId,
      p_user_type: userType,
    })
    if (error) throw error
    return parseRowsDates((data || []).map((p: Record<string, unknown>) => ({ ...p, password_hash: '' }))) as unknown as Parent[]
  },

  getByStudent: async (
    studentId: number,
    userId: number,
    userType: 'admin'
  ): Promise<Parent[]> => {
    const { data, error } = await supabase.rpc('get_parents_by_student_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_student_id: studentId,
    })
    if (error) throw error
    return parseRowsDates((data || []).map((p: Record<string, unknown>) => ({ ...p, password_hash: '' }))) as unknown as Parent[]
  },
}

// =====================================================
// PARENT STUDENTS API (لم تتغير)
// =====================================================
export const parentStudentsSupabaseAPI = {
  getAll: async (
    userId: number,
    userType: 'admin'
  ): Promise<Array<ParentStudent & { parent: Parent; student: Student }>> => {
    const { data, error } = await supabase.rpc('get_parent_students_with_context', {
      p_user_id: userId,
      p_user_type: userType,
    })
    if (error) throw error
    const rows = (data || []) as any[]
    return parseRowsDates(rows) as Array<ParentStudent & { parent: Parent; student: Student }>
  },

  getByStudent: async (
    studentId: number,
    userId: number,
    userType: 'admin'
  ): Promise<ParentStudent[]> => {
    return withUserContext(userId, userType, async () => {
      const { data, error } = await supabase
        .from('parent_students')
        .select('*')
        .eq('student_id', studentId)
      if (error) throw error
      return parseRowsDates(data || []) as ParentStudent[]
    })
  },

  link: async (
    parentId: number,
    studentId: number,
    relationship: string | null,
    userId: number,
    userType: 'admin'
  ): Promise<ParentStudent> => {
    const { data, error } = await supabase.rpc('link_parent_student_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_parent_id: parentId,
      p_student_id: studentId,
      p_relationship: relationship,
    })
    if (error) throw error
    const row = Array.isArray(data) ? data[0] : data
    return parseRowDates(row || {}) as ParentStudent
  },

  delete: async (id: number, userId: number, userType: 'admin'): Promise<void> => {
    const { error } = await supabase.rpc('delete_parent_student_link_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_id: id,
    })
    if (error) throw error
  },
}

// =====================================================
// QUESTIONS API
// =====================================================
export const questionsSupabaseAPI = {
  getAll: async (
    userId: number,
    userType: 'admin' | 'teacher',
    params?: { type?: string; difficulty?: string; subjectId?: number }
  ): Promise<Question[]> => {
    const { data, error } = await supabase.rpc('get_questions_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_type: params?.type || null,
      p_difficulty: params?.difficulty || null,
      p_subject_id: params?.subjectId || null,
    })
    if (error) throw error
    return parseRowsDates(data || []) as unknown as Question[]
  },

  getById: async (
    id: number,
    userId: number,
    userType: 'admin' | 'teacher'
  ): Promise<Question> => {
    const { data, error } = await supabase.rpc('get_question_by_id_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_id: id,
    })
    if (error) throw new Error('السؤال غير موجود')
    const row = Array.isArray(data) ? data[0] : data
    if (!row) throw new Error('السؤال غير موجود')
    return parseRowDates(row) as Question
  },

  create: async (
    data: Omit<Question, 'id' | 'created_at' | 'updated_at' | 'status'> & { status?: ApprovalStatus },
    userId: number,
    userType: 'admin'
  ): Promise<Question> => {
    const payload: Record<string, unknown> = {
      question_text: data.question_text,
      question_type: data.question_type,
      question_options: data.question_options ?? null,
      correct_answer: data.correct_answer ?? null,
      difficulty_level: data.difficulty_level,
      subject_id: data.subject_id,
      chapter_id: data.chapter_id ?? null,
      created_by_admin: userId,
      created_by_teacher: null,
      status: data.status ?? 'approved',
      is_active: data.is_active ?? true,
    }

    if (data.pdf_url !== undefined) payload.pdf_url = data.pdf_url
    if (data.pdf_storage_path !== undefined) payload.pdf_storage_path = data.pdf_storage_path
    if (data.pdf_filename !== undefined) payload.pdf_filename = data.pdf_filename
    if ((data as any).skill !== undefined) payload.skill = (data as any).skill || null
    if ((data as any).explanation !== undefined) payload.explanation = (data as any).explanation || null
    if ((data as any).reference_page !== undefined) payload.reference_page = (data as any).reference_page || null

    const { data: rows, error } = await supabase.rpc('insert_question_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_payload: payload,
    })
    if (error) throw error
    const row = Array.isArray(rows) ? rows[0] : rows
    if (!row) throw new Error('فشل إضافة السؤال')
    return parseRowDates(row) as Question
  },

  update: async (
    id: number,
    data: Partial<Question>,
    userId: number,
    userType: 'admin'
  ): Promise<Question> => {
    const payload: Record<string, unknown> = {}
    if (data.chapter_id !== undefined) payload.chapter_id = data.chapter_id
    if (data.subject_id !== undefined) payload.subject_id = data.subject_id
    if (data.question_text !== undefined) payload.question_text = data.question_text
    if (data.question_type !== undefined) payload.question_type = data.question_type
    if (data.question_options !== undefined) payload.question_options = data.question_options
    if (data.correct_answer !== undefined) payload.correct_answer = data.correct_answer
    if (data.difficulty_level !== undefined) payload.difficulty_level = data.difficulty_level
    if (data.is_active !== undefined) payload.is_active = data.is_active
    if (data.pdf_url !== undefined) payload.pdf_url = data.pdf_url
    if (data.pdf_storage_path !== undefined) payload.pdf_storage_path = data.pdf_storage_path
    if (data.pdf_filename !== undefined) payload.pdf_filename = data.pdf_filename
    if ((data as any).skill !== undefined) payload.skill = (data as any).skill || null
    if ((data as any).explanation !== undefined) payload.explanation = (data as any).explanation || null
    if ((data as any).reference_page !== undefined) payload.reference_page = (data as any).reference_page || null

    const { data: rows, error } = await supabase.rpc('update_question_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_id: id,
      p_payload: payload,
    })
    if (error) throw error
    const row = Array.isArray(rows) ? rows[0] : rows
    if (!row) throw new Error('السؤال غير موجود')
    return parseRowDates(row) as Question
  },

  delete: async (
    id: number,
    userId: number,
    userType: 'admin'
  ): Promise<void> => {
    const { error } = await supabase.rpc('delete_question_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_question_id: id,
    })
    if (error) throw new Error(error.message)
  },
}

// =====================================================
// EXAMS API - لم تتغير كثيراً
// =====================================================
export const examsSupabaseAPI = {
  getAll: async (
    userId: number,
    userType: 'admin' | 'teacher'
  ): Promise<Exam[]> => {
    const { data, error } = await supabase.rpc('get_exams_with_context', {
      p_user_id: userId,
      p_user_type: userType,
    })
    if (error) throw error
    return parseRowsDates(data || []) as unknown as Exam[]
  },

  getById: async (
    id: number,
    userId: number,
    userType: 'admin' | 'teacher'
  ): Promise<Exam> => {
    const { data, error } = await supabase.rpc('get_exam_by_id_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_id: id,
    })
    if (error) throw new Error('الاختبار غير موجود')
    const row = Array.isArray(data) ? data[0] : data
    if (!row) throw new Error('الاختبار غير موجود')
    return parseRowDates(row) as Exam
  },

  create: async (
    data: Omit<Exam, 'id' | 'created_at' | 'updated_at' | 'total_marks'>,
    userId: number,
    userType: 'admin'
  ): Promise<Exam> => {
    const payload = {
      title: data.title,
      description: data.description ?? null,
      subject_id: data.subject_id,
      grade_id: data.grade_id,
      section_id: data.section_id,
      semester_id: data.semester_id,
      total_marks: 0,
      passing_marks: data.passing_marks ?? 0,
      duration_minutes: data.duration_minutes ?? null,
      difficulty_level: data.difficulty_level ?? null,
      created_by_admin: userId,
      created_by_teacher: null,
      status: data.status ?? 'draft',
    }
    const { data: rows, error } = await supabase.rpc('insert_exam_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_payload: payload,
    })
    if (error) throw error
    const row = Array.isArray(rows) ? rows[0] : rows
    if (!row) throw new Error('فشل إضافة الاختبار')
    return parseRowDates(row) as Exam
  },

  update: async (
    id: number,
    data: Partial<Exam>,
    userId: number,
    userType: 'admin'
  ): Promise<Exam> => {
    const payload: Record<string, unknown> = {}
    if (data.title !== undefined) payload.title = data.title
    if (data.description !== undefined) payload.description = data.description
    if (data.subject_id !== undefined) payload.subject_id = data.subject_id
    if (data.grade_id !== undefined) payload.grade_id = data.grade_id
    if (data.section_id !== undefined) payload.section_id = data.section_id
    if (data.semester_id !== undefined) payload.semester_id = data.semester_id
    if (data.total_marks !== undefined) payload.total_marks = data.total_marks
    if (data.passing_marks !== undefined) payload.passing_marks = data.passing_marks
    if (data.duration_minutes !== undefined) payload.duration_minutes = data.duration_minutes
    if (data.difficulty_level !== undefined) payload.difficulty_level = data.difficulty_level
    if (data.status !== undefined) payload.status = data.status
    if (data.pdf_url !== undefined) payload.pdf_url = data.pdf_url
    if (data.pdf_storage_path !== undefined) payload.pdf_storage_path = data.pdf_storage_path
    if (data.pdf_filename !== undefined) payload.pdf_filename = data.pdf_filename
    if (data.pdf_size !== undefined) payload.pdf_size = data.pdf_size

    const { data: rows, error } = await supabase.rpc('update_exam_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_id: id,
      p_payload: payload,
    })
    if (error) throw error
    const row = Array.isArray(rows) ? rows[0] : rows
    if (!row) throw new Error('الاختبار غير موجود')
    return parseRowDates(row) as Exam
  },

  delete: async (id: number, userId: number, userType: 'admin'): Promise<void> => {
    return withUserContext(userId, userType, async () => {
      const { error } = await supabase.from('exams').delete().eq('id', id)
      if (error) throw error
    })
  },

  publish: async (id: number, userId: number, userType: 'admin'): Promise<void> => {
    return withUserContext(userId, userType, async () => {
      const { data: exam } = await supabase
        .from('exams')
        .select('status')
        .eq('id', id)
        .single()
      if (exam?.status !== 'approved') throw new Error('يجب الموافقة على الاختبار قبل النشر')
      const { error } = await supabase
        .from('exams')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
      if (error) throw error
    })
  },
}

// =====================================================
// EXAM QUESTIONS API - لم تتغير
// =====================================================
export const examQuestionsSupabaseAPI = {
  getByExam: async (
    examId: number,
    userId: number,
    userType: 'admin' | 'teacher'
  ): Promise<ExamQuestion[]> => {
    const { data, error } = await supabase.rpc('get_exam_questions_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_exam_id: examId,
    })
    if (error) throw error
    return parseRowsDates(data || []) as unknown as ExamQuestion[]
  },

  addQuestion: async (
    examId: number,
    questionId: number,
    order: number,
    marks: number,
    userId: number,
    userType: 'admin'
  ): Promise<ExamQuestion> => {
    return withUserContext(userId, userType, async () => {
      const { data, error } = await supabase
        .from('exam_questions')
        .insert({ exam_id: examId, question_id: questionId, question_order: order, marks })
        .select()
        .single()
      if (error) throw error
      return parseRowDates(data || {}) as ExamQuestion
    })
  },

  removeQuestion: async (
    examId: number,
    questionId: number,
    userId: number,
    userType: 'admin'
  ): Promise<void> => {
    return withUserContext(userId, userType, async () => {
      const { error } = await supabase
        .from('exam_questions')
        .delete()
        .eq('exam_id', examId)
        .eq('question_id', questionId)
      if (error) throw error
    })
  },
}

// =====================================================
// EXAM RESULTS API - لم تتغير
// =====================================================
export const examResultsSupabaseAPI = {
  getByExam: async (
    examId: number,
    userId: number,
    userType: 'admin' | 'teacher'
  ): Promise<ExamResult[]> => {
    return withUserContext(userId, userType, async () => {
      const { data, error } = await supabase
        .from('exam_results')
        .select('*')
        .eq('exam_id', examId)
        .order('submitted_at', { ascending: false })
      if (error) throw error
      return parseRowsDates(data || []) as ExamResult[]
    })
  },

  getByStudent: async (
    studentId: number,
    userId: number,
    userType: 'admin' | 'teacher'
  ): Promise<ExamResult[]> => {
    return withUserContext(userId, userType, async () => {
      const { data, error } = await supabase
        .from('exam_results')
        .select('*')
        .eq('student_id', studentId)
        .eq('status', 'completed')
        .order('submitted_at', { ascending: false })
      if (error) throw error
      return parseRowsDates(data || []) as ExamResult[]
    })
  },
}

// =====================================================
// REPORTS GRADES API - لم تتغير
// =====================================================
export const reportsGradesSupabaseAPI = {
  getAll: async (
    userId: number,
    userType: 'admin',
    params?: { gradeId?: number }
  ): Promise<Array<{ student: Student; averagePercentage: number }>> => {
    const { data, error } = await supabase.rpc('get_reports_grades_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_grade_id: params?.gradeId ?? null,
    })
    if (error) throw error
    const rows = (Array.isArray(data) ? data : []) as Array<{
      student_id: number
      student_code: string
      full_name: string
      phone_number?: string
      email?: string
      section_id: number
      average_percentage: number | null
    }>
    return rows.map((row) => ({
      student: {
        id: row.student_id,
        student_code: Number(row.student_code) || row.student_code,
        full_name: row.full_name,
        phone_number: row.phone_number ?? '',
        email: row.email ?? '',
        section_id: row.section_id,
        password_hash: '',
        profile_image: null,
        profile_image_filename: null,
        profile_image_mime_type: null,
        profile_image_size: null,
        is_active: true,
        last_login_at: null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        deleted_by: null,
      } as Student,
      averagePercentage: Number(row.average_percentage) || 0,
    }))
  },

  getStudentDetails: async (
    studentId: number,
    userId: number,
    userType: 'admin'
  ): Promise<{ student: Student; results: Array<{ exam: Exam; result: ExamResult; subject: Subject }> }> => {
    const { data: raw, error } = await supabase.rpc('get_student_details_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_student_id: studentId,
    })
    if (error) throw new Error('الطالب غير موجود')
    const obj = raw as
      | {
          student: Record<string, unknown>
          results: Array<{
            exam: Record<string, unknown>
            result: Record<string, unknown>
            subject: Record<string, unknown>
          }>
        }
      | null
    if (!obj || !obj.student) throw new Error('الطالب غير موجود')
    const student = parseRowDates({ ...obj.student, password_hash: '' }) as Student
    const results = (obj.results || []).map((r) => ({
      exam: parseRowDates(r.exam || {}) as unknown as Exam,
      result: parseRowDates(r.result || {}) as unknown as ExamResult,
      subject: parseRowDates(r.subject || {}) as unknown as Subject,
    }))
    return { student, results }
  },
}

// =====================================================
// ATTENDANCE API - لم تتغير
// =====================================================
export const attendanceSupabaseAPI = {
  getByDate: async (
    date: Date,
    userId: number,
    userType: 'admin' | 'teacher'
  ): Promise<Attendance[]> => {
    const dateStr = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-')

    try {
      const { data, error } = await supabase.rpc('get_attendance_by_date_with_context', {
        p_user_id: userId,
        p_user_type: userType,
        p_date: dateStr,
      })
      if (!error && data && data.length > 0) {
        return parseRowsDates(data) as unknown as Attendance[]
      }
    } catch (_) {}

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('attendance_date', dateStr)
      .order('section_id')

    if (error) throw error
    return parseRowsDates(data || []) as unknown as Attendance[]
  },

  getBySectionAndDate: async (
    sectionId: number,
    date: Date,
    userId: number,
    userType: 'admin' | 'teacher'
  ): Promise<Attendance[]> => {
    return withUserContext(userId, userType, async () => {
      const dateStr = date.toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('section_id', sectionId)
        .eq('attendance_date', dateStr)
      if (error) throw error
      return parseRowsDates(data || []) as unknown as Attendance[]
    })
  },

  upsert: async (
    rows: Array<{
      student_id: number
      section_id: number
      attendance_date: string
      status: string
      notes?: string | null
      marked_by: number
    }>,
    userId: number,
    userType: 'admin' | 'teacher'
  ): Promise<void> => {
    return withUserContext(userId, userType, async () => {
      for (const row of rows) {
        const { error } = await supabase
          .from('attendance')
          .upsert(row, { onConflict: 'student_id,attendance_date' })
        if (error) throw error
      }
    })
  },
}

// =====================================================
// MESSAGES API - لم تتغير
// =====================================================
export const messagesSupabaseAPI = {
  getForAdmin: async (userId: number, userType: 'admin'): Promise<Message[]> => {
    const { data, error } = await supabase.rpc('get_messages_for_admin_with_context', {
      p_user_id: userId,
      p_user_type: userType,
    })
    if (error) throw error
    const all = parseRowsDates(data || []) as unknown as Message[]
    return all
      .filter((m) => m.recipient_admin_id === userId)
      .sort((a, b) => new Date(b.sent_at ?? 0).getTime() - new Date(a.sent_at ?? 0).getTime())
  },

  getConversations: async (
    userId: number,
    userType: 'admin'
  ): Promise<Array<{ parent: Parent; lastMessage: Message; unreadCount: number }>> => {
    const { data: messagesData, error } = await supabase.rpc('get_messages_for_admin_with_context', {
      p_user_id: userId,
      p_user_type: userType,
    })
    if (error) throw error
    const messages = parseRowsDates(messagesData || []) as unknown as Message[]
    const byParent = new Map<number, { parent: Parent | null; messages: Message[] }>()
    for (const m of messages) {
      const pid = m.sender_parent_id ?? m.recipient_parent_id
      if (!pid) continue
      if (!byParent.has(pid)) byParent.set(pid, { parent: null, messages: [] })
      const rec = byParent.get(pid)!
      rec.messages.push(m)
    }
    const parentIds = Array.from(byParent.keys())
    const parentsMap = new Map<number, Parent>()
    if (parentIds.length > 0) {
      const { data: parentsList } = await supabase.rpc('get_parents_with_context', {
        p_user_id: userId,
        p_user_type: userType,
      })
      for (const p of parentsList || []) {
        if (parentIds.includes(p.id))
          parentsMap.set(p.id, parseRowDates({ ...p, password_hash: '' }) as Parent)
      }
    }
    return Array.from(byParent.entries())
      .map(([pid, rec]) => {
        const parent = parentsMap.get(pid)
        if (!parent) return null
        const sorted = [...rec.messages].sort(
          (a, b) => new Date(b.sent_at ?? 0).getTime() - new Date(a.sent_at ?? 0).getTime()
        )
        return {
          parent,
          lastMessage: sorted[0],
          unreadCount: rec.messages.filter(
            (m) => !m.is_read && m.recipient_admin_id === userId
          ).length,
        }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
  },

  getMessages: async (
    parentId: number,
    userId: number,
    userType: 'admin'
  ): Promise<Message[]> => {
    const { data, error } = await supabase.rpc('get_messages_for_admin_with_context', {
      p_user_id: userId,
      p_user_type: userType,
    })
    if (error) throw error
    const allMessages = parseRowsDates(data || []) as unknown as Message[]
    return allMessages
      .filter((m) => m.sender_parent_id === parentId || m.recipient_parent_id === parentId)
      .sort((a, b) => new Date(a.sent_at ?? 0).getTime() - new Date(b.sent_at ?? 0).getTime())
  },

  send: async (
    payload: {
      sender_admin_id?: number
      sender_parent_id?: number
      recipient_admin_id?: number
      recipient_parent_id?: number
      subject: string | null
      message_text: string
    },
    userId: number,
    userType: 'admin'
  ): Promise<Message> => {
    const { data, error } = await supabase.rpc('send_message_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_sender_admin_id: payload.sender_admin_id ?? null,
      p_sender_parent_id: payload.sender_parent_id ?? null,
      p_recipient_admin_id: payload.recipient_admin_id ?? null,
      p_recipient_parent_id: payload.recipient_parent_id ?? null,
      p_subject: payload.subject ?? null,
      p_message_text: payload.message_text,
    })
    if (error) throw error
    return parseRowDates(data || {}) as Message
  },

  markAsRead: async (messageId: number, userId: number, userType: 'admin'): Promise<void> => {
    return withUserContext(userId, userType, async () => {
      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('recipient_admin_id', userId)
    })
  },
}

// =====================================================
// REPORTS API - لم تتغير
// =====================================================
export const reportsSupabaseAPI = {
  getAll: async (userId: number, userType: 'admin'): Promise<Report[]> => {
    const { data, error } = await supabase.rpc('get_reports_with_names_and_context', {
      p_user_id: userId,
      p_user_type: userType,
    })
    if (error) throw error
    const rows = (data || []) as any[]
    return parseRowsDates(rows) as unknown as Report[]
  },

  create: async (
    data: Omit<Report, 'id' | 'sent_at' | 'is_read' | 'read_at'>,
    userId: number,
    userType: 'admin'
  ): Promise<Report> => {
    const { data: row, error } = await supabase.rpc('send_report_with_context', {
      p_user_id: userId,
      p_user_type: userType,
      p_student_id: data.student_id,
      p_parent_id: data.parent_id,
      p_title: data.title,
      p_report_text: data.report_text,
      p_sent_by: data.sent_by,
    })
    if (error) throw error
    const result = Array.isArray(row) ? row[0] : row
    return parseRowDates(result || {}) as Report
  },
}

// =====================================================
// PENDING CONTENT API - لم تتغير
// =====================================================
export const pendingContentSupabaseAPI = {
  getPendingQuestions: async (userId: number, userType: 'admin'): Promise<PendingContent[]> => {
    const { data, error } = await supabase.rpc('get_pending_questions_with_context', {
      p_user_id: userId,
      p_user_type: userType,
    })
    if (error) throw error
    return parseRowsDates(data || []) as unknown as PendingContent[]
  },

  getPendingExams: async (userId: number, userType: 'admin'): Promise<PendingContent[]> => {
    const { data, error } = await supabase.rpc('get_pending_exams_with_context', {
      p_user_id: userId,
      p_user_type: userType,
    })
    if (error) throw error
    return parseRowsDates(data || []) as unknown as PendingContent[]
  },

  approve: async (
    id: number,
    reviewedBy: number,
    userId: number,
    userType: 'admin'
  ): Promise<void> => {
    return withUserContext(userId, userType, async () => {
      const { data: pc, error: fe } = await supabase
        .from('pending_content')
        .select('*')
        .eq('id', id)
        .single()
      if (fe || !pc) throw new Error('المحتوى غير موجود')
      await supabase
        .from('pending_content')
        .update({
          status: 'approved',
          reviewed_by: reviewedBy,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)
      if (pc.content_type === 'question') {
        const q = pc.content_data as Record<string, unknown>
        await supabase.from('questions').insert({
          question_text: q.question_text,
          question_type: q.question_type,
          question_options: q.question_options ?? null,
          correct_answer: q.correct_answer ?? null,
          difficulty_level: q.difficulty_level,
          subject_id: q.subject_id,
          created_by_teacher: pc.teacher_id,
          created_by_admin: null,
          status: 'approved',
          is_active: true,
        })
      } else {
        const ex = pc.content_data as Record<string, unknown>
        await supabase.from('exams').insert({
          title: ex.title as string,
          description: (ex.description as string) ?? null,
          subject_id: ex.subject_id as number,
          grade_id: ex.grade_id as number,
          section_id: ex.section_id as number,
          semester_id: ex.semester_id as number,
          total_marks: 0,
          passing_marks: (ex.passing_marks as number) ?? 0,
          duration_minutes: (ex.duration_minutes as number) ?? null,
          difficulty_level: (ex.difficulty_level as string) ?? null,
          created_by_teacher: pc.teacher_id,
          created_by_admin: null,
          status: 'approved',
        })
      }
    })
  },

  reject: async (
    id: number,
    reason: string,
    reviewedBy: number,
    userId: number,
    userType: 'admin'
  ): Promise<void> => {
    return withUserContext(userId, userType, async () => {
      if (!reason?.trim()) throw new Error('سبب الرفض إلزامي')
      const { error } = await supabase
        .from('pending_content')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          reviewed_by: reviewedBy,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)
      if (error) throw error
    })
  },
}

// =====================================================
// DASHBOARD API - لم تتغير
// =====================================================
export const dashboardSupabaseAPI = {
  getStats: async (
    userId: number,
    userType: 'admin'
  ): Promise<{
    totalStudents: number
    totalTeachers: number
    totalSubjects: number
    totalQuestions: number
    pendingExams: number
    unreadMessages: number
  }> => {
    const { data, error } = await supabase.rpc('get_dashboard_stats_with_context', {
      p_user_id: userId,
      p_user_type: userType,
    })
    if (error) throw error
    const r = (data || {}) as Record<string, number>
    return {
      totalStudents: r.totalStudents ?? 0,
      totalTeachers: r.totalTeachers ?? 0,
      totalSubjects: r.totalSubjects ?? 0,
      totalQuestions: r.totalQuestions ?? 0,
      pendingExams: r.pendingExams ?? 0,
      unreadMessages: r.unreadMessages ?? 0,
    }
  },

  getWeeklyActivity: async (
    userId: number,
    userType: 'admin'
  ): Promise<Array<{ day: string; students: number; teachers: number }>> => {
    const { data, error } = await supabase.rpc('get_weekly_activity_with_context', {
      p_user_id: userId,
      p_user_type: userType,
    })
    if (error) throw error
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    const byDay = days.map((day) => ({ day, students: 0, teachers: 0 }))
    const rows = (Array.isArray(data) ? data : []) as Array<{
      day_index: number
      students: number
      teachers: number
    }>
    for (const row of rows) {
      const i = Number(row.day_index)
      if (i >= 0 && i <= 6) {
        byDay[i].students = row.students ?? 0
        byDay[i].teachers = row.teachers ?? 0
      }
    }
    return byDay
  },

  getAverageGradesBySubject: async (
    userId: number,
    userType: 'admin'
  ): Promise<Array<{ name: string; average: number }>> => {
    const { data, error } = await supabase.rpc('get_average_grades_by_subject_with_context', {
      p_user_id: userId,
      p_user_type: userType,
    })
    if (error) throw error
    const rows = (Array.isArray(data) ? data : []) as Array<{
      name: string
      average: number
    }>
    return rows.map((r) => ({ name: r.name ?? 'غير معروف', average: Number(r.average) || 0 }))
  },
}