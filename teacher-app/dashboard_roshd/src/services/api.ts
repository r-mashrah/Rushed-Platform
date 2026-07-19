import { useAuthStore } from '../store/authStore'
import {
  schoolSettingsSupabaseAPI,
  adminsSupabaseAPI,
  teachersSupabaseAPI,
  gradesSupabaseAPI,
  semestersSupabaseAPI,
  sectionsSupabaseAPI,
  subjectsSupabaseAPI,
  chaptersSupabaseAPI,
  sectionSubjectsSupabaseAPI,
  studentsSupabaseAPI,
} from './supabaseApi'
import { supabase, supabaseAdmin } from '../lib/supabase'

import type {
  Admin, Teacher, Student, Grade, Semester, Section, Subject,
  SectionSubject, SchoolSettings, Chapter
} from '../types'



function getAuth() {
  const { userId, userType } = useAuthStore.getState()
  if (!userId || !userType) throw new Error('يجب تسجيل الدخول أولاً')
  return { userId, userType: userType as 'admin' | 'teacher' | 'student' | 'parent' }
}



// =====================================================
// AUTH API
// =====================================================
export const authAPI = {
  login: async (_schoolCode: string, _password: string): Promise<{ admin: Admin; token: string }> => {
    throw new Error('استخدم useAuthStore().login بدلاً من ذلك')
  },
}


const toPassword = (code: number): string => {
  return code.toString().padStart(6, '0')
}

export const provisionAPI = {

  // ── إنشاء حساب طالب جديد ──────────────────────────────────────
  createStudent: async (data: {
    full_name: string
    email: string
    phone_number?: string
    section_id?: number
  }): Promise<{ student_id: number; student_code: number }> => {

    if (!supabaseAdmin)
      throw new Error('Admin client غير مهيأ — تحقق من VITE_SUPABASE_SERVICE_ROLE_KEY')

    // الخطوة 1: إنشاء مستخدم في Supabase Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email:         data.email,
        password:      'TEMP_000000',
        email_confirm: true,
      })

    if (authError) throw new Error(`فشل إنشاء الحساب: ${authError.message}`)

    const authUserId = authData.user.id

    try {
      // الخطوة 2: إدراج الطالب وربط app_user
      const { data: result, error: rpcError } = await supabase.rpc(
        'provision_student',
        {
          p_auth_user_id: authUserId,
          p_full_name:    data.full_name,
          p_email:        data.email,
          p_phone:        data.phone_number ?? null,
          p_section_id:   data.section_id   ?? null,
        }
      )

      if (rpcError) throw new Error(rpcError.message)

      const studentCode: number = result.student_code

      // الخطوة 3: تحديث كلمة السر = student_code مع padding
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        authUserId,
        { password: toPassword(studentCode) }
      )

      if (updateError) throw new Error(`فشل تحديث كلمة السر: ${updateError.message}`)

      return {
        student_id:   result.student_id,
        student_code: studentCode,
      }

    } catch (err) {
      // Rollback: حذف مستخدم auth لو فشلت الخطوات التالية
      await supabaseAdmin.auth.admin.deleteUser(authUserId)
      throw err
    }
  },

  // ── إنشاء حساب معلم جديد ──────────────────────────────────────
  createTeacher: async (data: {
    full_name: string
    email: string
    phone_number: string
  }): Promise<{ teacher_id: number; teacher_code: number }> => {

    if (!supabaseAdmin)
      throw new Error('Admin client غير مهيأ — تحقق من VITE_SUPABASE_SERVICE_ROLE_KEY')

    // الخطوة 1: إنشاء مستخدم في Supabase Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email:         data.email,
        password:      'TEMP_000000',
        email_confirm: true,
      })

    if (authError) throw new Error(`فشل إنشاء الحساب: ${authError.message}`)

    const authUserId = authData.user.id

    try {
      // الخطوة 2: إدراج المعلم وربط app_user
      const { data: result, error: rpcError } = await supabase.rpc(
        'provision_teacher',
        {
          p_auth_user_id: authUserId,
          p_full_name:    data.full_name,
          p_email:        data.email,
          p_phone:        data.phone_number,
        }
      )

      if (rpcError) throw new Error(rpcError.message)

      const teacherCode: number = result.teacher_code

      // الخطوة 3: تحديث كلمة السر = teacher_code مع padding
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        authUserId,
        { password: toPassword(teacherCode) }
      )

      if (updateError) throw new Error(`فشل تحديث كلمة السر: ${updateError.message}`)

      return {
        teacher_id:   result.teacher_id,
        teacher_code: teacherCode,
      }

    } catch (err) {
      // Rollback
      await supabaseAdmin.auth.admin.deleteUser(authUserId)
      throw err
    }
  },

  // ── إنشاء حساب ولي أمر جديد ───────────────────────────────────
  createParent: async (data: {
    full_name: string
    email: string
    phone_number: string
    student_id: number
    relationship?: string
  }): Promise<{ parent_id: number; student_code: number }> => {

    if (!supabaseAdmin)
      throw new Error('Admin client غير مهيأ — تحقق من VITE_SUPABASE_SERVICE_ROLE_KEY')

    // الخطوة 1: إنشاء مستخدم في Supabase Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email:         data.email,
        password:      'TEMP_000000',
        email_confirm: true,
      })

    if (authError) throw new Error(`فشل إنشاء الحساب: ${authError.message}`)

    const authUserId = authData.user.id

    try {
      // الخطوة 2: إدراج ولي الأمر وربط app_user
      const { data: result, error: rpcError } = await supabase.rpc(
        'provision_parent',
        {
          p_auth_user_id: authUserId,
          p_full_name:    data.full_name,
          p_email:        data.email,
          p_phone:        data.phone_number,
          p_student_id:   data.student_id,
          p_relationship: data.relationship ?? null,
        }
      )

      if (rpcError) throw new Error(rpcError.message)

      const studentCode: number = result.student_code

      // الخطوة 3: كلمة السر = student_code الطفل مع padding
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        authUserId,
        { password: toPassword(studentCode) }
      )

      if (updateError) throw new Error(`فشل تحديث كلمة السر: ${updateError.message}`)

      return {
        parent_id:    result.parent_id,
        student_code: studentCode,
      }

    } catch (err) {
      // Rollback
      await supabaseAdmin.auth.admin.deleteUser(authUserId)
      throw err
    }
  },
}


export const schoolSettingsAPI = {
  get: async (): Promise<SchoolSettings> => {
    const { userId } = getAuth()
    return schoolSettingsSupabaseAPI.get(userId, 'admin')
  },
  update: async (data: Partial<SchoolSettings>): Promise<SchoolSettings> => {
    const { userId } = getAuth()
    return schoolSettingsSupabaseAPI.update(data, userId, 'admin')
  },
}

// =====================================================
// ADMINS API
// =====================================================
export const adminsAPI = {
  getAll: async (): Promise<Admin[]> => {
    const { userId } = getAuth()
    return adminsSupabaseAPI.getAll(userId, 'admin')
  },
  getById: async (adminId: number): Promise<Admin> => {
    const { userId } = getAuth()
    return adminsSupabaseAPI.getById(adminId, userId, 'admin')
  },
  updateProfileImage: async (adminId: number, profile_image_url: string, profile_image_storage_path: string): Promise<Admin> => {
    const { userId } = getAuth()
    return adminsSupabaseAPI.updateProfileImage(adminId, profile_image_url, profile_image_storage_path, userId, 'admin')
  },
  updatePassword: async (adminId: number, currentPassword: string, newPassword: string): Promise<void> => {
    const { userId } = getAuth()
    return adminsSupabaseAPI.updatePassword(adminId, currentPassword, newPassword, userId, 'admin')
  },
}

// =====================================================
// TEACHERS API
// =====================================================
export const teachersAPI = {
  getAll: async (params?: { search?: string; sortBy?: string }): Promise<Teacher[]> => {
    const { userId, userType } = getAuth()
    return teachersSupabaseAPI.getAll(userId, userType as 'admin' | 'teacher', params)
  },
  getById: async (id: number): Promise<Teacher> => {
    const { userId, userType } = getAuth()
    return teachersSupabaseAPI.getById(id, userId, userType as 'admin' | 'teacher')
  },
  update: async (id: number, data: Partial<Teacher>): Promise<Teacher> => {
    const { userId } = getAuth()
    return teachersSupabaseAPI.update(id, data, userId, 'admin')
  },
  delete: async (id: number, deletedBy: number): Promise<void> => {
    const { userId } = getAuth()
    return teachersSupabaseAPI.delete(id, deletedBy, userId, 'admin')
  },
  getSubjects: async (teacherId: number): Promise<Subject[]> => {
    const { userId, userType } = getAuth()
    const list = await sectionSubjectsSupabaseAPI.getByTeacher(teacherId, userId, userType as 'admin' | 'teacher')
    const ids = [...new Set(list.map(ss => ss.subject_id))]
    if (ids.length === 0) return []
    const { subjectsSupabaseAPI: subjApi } = await import('./supabaseApi')
    return subjApi.getByIds(ids, userId, userType)
  },
}

// =====================================================
// GRADES API
// =====================================================
export const gradesAPI = {
  getAll: async (): Promise<Grade[]> => {
    const { userId, userType } = getAuth()
    return gradesSupabaseAPI.getAll(userId, userType)
  },
  getById: async (id: number): Promise<Grade> => {
    const { userId, userType } = getAuth()
    return gradesSupabaseAPI.getById(id, userId, userType)
  },
}

// =====================================================
// SEMESTERS API
// =====================================================
export const semestersAPI = {
  getAll: async (): Promise<Semester[]> => {
    const { userId, userType } = getAuth()
    return semestersSupabaseAPI.getAll(userId, userType)
  },
}

// =====================================================
// SECTIONS API
// =====================================================
export const sectionsAPI = {
  getByGrade: async (gradeId: number): Promise<Section[]> => {
    const { userId, userType } = getAuth()
    return sectionsSupabaseAPI.getByGrade(gradeId, userId, userType)
  },
  create: async (data: Omit<Section, 'id' | 'created_at' | 'updated_at'>): Promise<Section> => {
    const { userId } = getAuth()
    return sectionsSupabaseAPI.create(data, userId, 'admin')
  },
  delete: async (id: number): Promise<void> => {
    const { userId } = getAuth()
    return sectionsSupabaseAPI.delete(id, userId, 'admin')
  },
  getStudentCount: async (sectionId: number): Promise<number> => {
    const { userId, userType } = getAuth()
    return sectionsSupabaseAPI.getStudentCount(sectionId, userId, userType as 'admin' | 'teacher')
  },
}

// =====================================================
// SUBJECTS API
// =====================================================
export const subjectsAPI = {
  getAll: async (params?: { sortBy?: string }): Promise<Subject[]> => {
    const { userId, userType } = getAuth()
    return subjectsSupabaseAPI.getAll(userId, userType, params)
  },
  getById: async (id: number): Promise<Subject> => {
    const { userId, userType } = getAuth()
    return subjectsSupabaseAPI.getById(id, userId, userType)
  },
  create: async (data: Omit<Subject, 'id' | 'subject_code' | 'created_at' | 'updated_at'>): Promise<Subject> => {
    const { userId } = getAuth()
    return subjectsSupabaseAPI.create(data, userId, 'admin')
  },
  update: async (id: number, data: Partial<Subject>): Promise<Subject> => {
    const { userId } = getAuth()
    return subjectsSupabaseAPI.update(id, data, userId, 'admin')
  },
  delete: async (id: number): Promise<void> => {
    const { userId } = getAuth()
    return subjectsSupabaseAPI.delete(id, userId, 'admin')
  },
}

// =====================================================
// CHAPTERS API
// =====================================================
export const chaptersAPI = {
  getAll: async (params?: { subjectId?: number }): Promise<Chapter[]> => {
    const { userId, userType } = getAuth()
    return chaptersSupabaseAPI.getAll(userId, userType as 'admin' | 'teacher', params)
  },
  getBySubject: async (subjectId: number): Promise<Chapter[]> => {
    const { userId, userType } = getAuth()
    return chaptersSupabaseAPI.getBySubject(subjectId, userId, userType as 'admin' | 'teacher')
  },
  getById: async (id: number): Promise<Chapter> => {
    const { userId, userType } = getAuth()
    return chaptersSupabaseAPI.getById(id, userId, userType as 'admin' | 'teacher')
  },
  create: async (data: Omit<Chapter, 'id' | 'created_at' | 'updated_at'>): Promise<Chapter> => {
    const { userId } = getAuth()
    return chaptersSupabaseAPI.create(data, userId, 'admin')
  },
  update: async (id: number, data: Partial<Chapter>): Promise<Chapter> => {
    const { userId } = getAuth()
    return chaptersSupabaseAPI.update(id, data, userId, 'admin')
  },
  delete: async (id: number): Promise<void> => {
    const { userId } = getAuth()
    return chaptersSupabaseAPI.delete(id, userId, 'admin')
  },
}

// =====================================================
// SECTION SUBJECTS API
// =====================================================
// export const sectionSubjectsAPI = {
//   getByGradeAndSemester: async (gradeId: number, semesterId?: number): Promise<SectionSubject[]> => {
//     const { userId, userType } = getAuth()
//     return sectionSubjectsSupabaseAPI.getByGrade(gradeId, userId, userType as 'admin' | 'teacher', semesterId )
//   },
//   getByTeacher: async (teacherId: number): Promise<SectionSubject[]> => {
//     const { userId, userType } = getAuth()
//     return sectionSubjectsSupabaseAPI.getByTeacher(teacherId, userId, userType as 'admin' | 'teacher')
//   },
//   create: async (data: Omit<SectionSubject, 'id' | 'assigned_at' | 'updated_at'>): Promise<SectionSubject> => {
//     const { userId } = getAuth()
//     return sectionSubjectsSupabaseAPI.create(data, userId, 'admin')
//   },
//   delete: async (id: number): Promise<void> => {
//     const { userId } = getAuth()
//     return sectionSubjectsSupabaseAPI.delete(id, userId, 'admin')
//   },
// }

export const sectionSubjectsAPI = {
  getByGradeAndSemester: async (
    gradeId: number,
    semesterId?: 'first' | 'second' | null  // ✅ النوع الصحيح
  ): Promise<SectionSubject[]> => {
    const { userId, userType } = getAuth()
    
    // ✅ حوّل SemesterKey إلى number
    let semesterNum: number | undefined
    if (semesterId === 'first') semesterNum = 1
    else if (semesterId === 'second') semesterNum = 2
    else semesterNum = undefined
    
    return sectionSubjectsSupabaseAPI.getByGrade(
      gradeId,
      userId,
      userType as 'admin' | 'teacher',
      semesterNum
    )
  },

  getByTeacher: async (teacherId: number): Promise<SectionSubject[]> => {
    const { userId, userType } = getAuth()
    return sectionSubjectsSupabaseAPI.getByTeacher(
      teacherId,
      userId,
      userType as 'admin' | 'teacher'
    )
  },

  create: async (
    data: Omit<SectionSubject, 'id' | 'assigned_at' | 'updated_at'>
  ): Promise<SectionSubject> => {
    const { userId } = getAuth()
    return sectionSubjectsSupabaseAPI.create(data, userId, 'admin')
  },

  delete: async (id: number): Promise<void> => {
    const { userId } = getAuth()
    return sectionSubjectsSupabaseAPI.delete(id, userId, 'admin')
  },
}
// =====================================================
// STUDENTS API
// =====================================================
export const studentsAPI = {
  getAll: async (params?: { search?: string; gradeId?: number }): Promise<Student[]> => {
    const { userId, userType } = getAuth()
    return studentsSupabaseAPI.getAll(userId, userType as 'admin' | 'teacher', params)
  },
  getById: async (id: number): Promise<Student> => {
    const { userId, userType } = getAuth()
    return studentsSupabaseAPI.getById(id, userId, userType as 'admin' | 'teacher')
  },
  update: async (id: number, data: Partial<Student>): Promise<Student> => {
    const { userId } = getAuth()
    return studentsSupabaseAPI.update(id, data, userId, 'admin')
  },
  delete: async (id: number, deletedBy: number): Promise<void> => {
    const { userId } = getAuth()
    return studentsSupabaseAPI.delete(id, deletedBy, userId, 'admin')
  },
  importFromExcel: async (students: Array<{ full_name: string; email: string; phone_number?: string; sectionId: number }>): Promise<{ success: number; failed: number; errors: string[] }> => {
    let success = 0
    let failed = 0
    const errors: string[] = []

    for (const s of students) {
      try {
        await provisionAPI.createStudent({
          full_name:    s.full_name,
          email:        s.email,
          phone_number: s.phone_number,
          section_id:   s.sectionId,
        })
        success++
      } catch (err: any) {
        failed++
        errors.push(`${s.full_name}: ${err.message}`)
      }
    }

    return { success, failed, errors }
  },
}



