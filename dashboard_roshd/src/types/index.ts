// Database Types - Matching Prisma Schema Exactly

export type QuestionType = 'multiple_choice' | 'true_false' | 'essay' | 'fill_blank'
export type DifficultyLevel = 'easy' | 'medium' | 'hard'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'
export type ExamStatus = 'draft' | 'pending' | 'approved' | 'published' | 'completed' | 'rejected'
export type ExamAttemptStatus = 'in_progress' | 'completed' | 'pending_manual_grading'
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'
export type SemesterType = 'first' | 'second'
export type NotificationType = 'exam_published' | 'exam_result' | 'content_approved' | 'content_rejected' | 'attendance_absent' | 'report_sent' | 'message_received' | 'general'
export type PendingContentType = 'question' | 'exam'

export interface SchoolSettings {
  id: number
  school_name: string
  school_logo: Uint8Array | null
  school_logo_filename: string | null
  school_logo_mime_type: string | null
  school_logo_size: number | null
  /** Public URL from Supabase Storage (after migration 07) */
  school_logo_url?: string | null
  school_logo_storage_path?: string | null
  admin_code: string
  created_at: Date | null
  updated_at: Date | null
}

export interface Admin {
  id: number
  full_name: string
  email: string | null
  password_hash: string
  phone_number: string | null
  /** Public URL from Supabase Storage (profile-images/admins/{id}/...) */
  profile_image_url?: string | null
  profile_image_storage_path?: string | null
  is_active: boolean | null
  last_login_at: Date | null
  created_at: Date | null
  updated_at: Date | null
  deleted_at: Date | null
  deleted_by: number | null
}

export interface Teacher {
  id: number
  teacher_code: number
  full_name: string
  phone_number: string
  email: string | null
  profile_image: Uint8Array | null
  profile_image_filename: string | null
  profile_image_mime_type: string | null
  profile_image_size: number | null
  /** Public URL from Supabase Storage (after migration 07) */
  profile_image_url?: string | null
  profile_image_storage_path?: string | null
  password_hash: string
  is_active: boolean | null
  last_login_at: Date | null
  created_at: Date | null
  updated_at: Date | null
  deleted_at: Date | null
  deleted_by: number | null
}

export interface Student {
  id: number
  student_code: number
  full_name: string
  phone_number: string | null
  email: string | null
  profile_image: Uint8Array | null
  profile_image_filename: string | null
  profile_image_mime_type: string | null
  profile_image_size: number | null
  /** Public URL from Supabase Storage (after migration 07) */
  profile_image_url?: string | null
  profile_image_storage_path?: string | null
  section_id: number | null
  password_hash: string
  is_active: boolean | null
  last_login_at: Date | null
  created_at: Date | null
  updated_at: Date | null
  deleted_at: Date | null
  deleted_by: number | null
}

export interface Parent {
  id: number
  full_name: string
  phone_number: string
  email: string | null
  password_hash: string
  is_active: boolean | null
  last_login_at: Date | null
  created_at: Date | null
  updated_at: Date | null
}

export interface Grade {
  id: number
  name: string
  grade_order: number
  description: string | null
  is_active: boolean | null
  created_at: Date | null
  updated_at: Date | null
}

export interface Semester {
  id: number
  semester_type: SemesterType
  name: string
  start_date: Date | null
  end_date: Date | null
  is_active: boolean | null
  created_at: Date | null
}

export interface Section {
  id: number
  name: string
  grade_id: number
  capacity: number | null
  is_active: boolean | null
  created_at: Date | null
  updated_at: Date | null
}

export interface Subject {
  id: number
  subject_code: number
  name: string
  pdf_content: Uint8Array | null
  pdf_filename: string | null
  pdf_size: number | null
  /** URL from Supabase Storage (after migration 07) */
  pdf_url?: string | null
  pdf_storage_path?: string | null
  description: string | null
  is_active: boolean | null
  created_at: Date | null
  updated_at: Date | null
  // semester?: 'first' | 'second' | null  // ← مهم جداً
    semester: 'first' | 'second' | null
}

export interface ParentStudent {
  id: number
  parent_id: number
  student_id: number
  relationship: string | null
  linked_at: Date | null
}

export interface SectionSubject {
  id: number
  section_id: number
  subject_id: number
  teacher_id: number
  is_active: boolean | null
  assigned_at: Date | null
   semester_id?: number | null  // ← جديد!
  updated_at: Date | null
  subject_name?: string | null
  teacher_name?: string | null
  subject_semester?: 'first' | 'second' | null 
}

export interface Question {
  id: number
  question_text: string
  question_type: QuestionType
  question_options: Record<string, any> | null
  correct_answer: string | null
  difficulty_level: DifficultyLevel
  subject_id: number
  chapter_id: number | null        // ← أضف هذا
  created_by_admin: number | null
  created_by_teacher: number | null
  status: ApprovalStatus | null
  is_active: boolean | null
  pdf_url?: string | null
  pdf_storage_path?: string | null
  pdf_filename?: string | null
  created_at: Date | null
  updated_at: Date | null
}
export interface Exam {
  id: number
  title: string
  description: string | null
  subject_id: number
  grade_id: number
  section_id: number
  semester_id: number
  total_marks: number
  passing_marks: number
  duration_minutes: number | null
  difficulty_level: DifficultyLevel | null
  pdf_content: Uint8Array | null
  pdf_filename: string | null
  pdf_size: number | null
  /** URL from Supabase Storage (after migration 07) */
  pdf_url?: string | null
  pdf_storage_path?: string | null
  created_by_admin: number | null
  created_by_teacher: number | null
  status: ExamStatus | null
  scheduled_at: Date | null
  published_at: Date | null
  created_at: Date | null
  updated_at: Date | null
}

export interface ExamQuestion {
  id: number
  exam_id: number
  question_id: number
  question_order: number
  marks: number
  added_at: Date | null
}

export interface ExamResult {
  id: number
  student_id: number
  exam_id: number
  obtained_marks: number
  total_marks: number
  percentage: number | null
  status: ExamAttemptStatus | null
  answers: Record<string, any> | null
  requires_manual_grading: boolean | null
  graded_by: number | null
  graded_at: Date | null
  started_at: Date | null
  submitted_at: Date | null
  student_name_cache: string | null
  exam_title_cache: string | null
}

export interface Attendance {
  id: number
  student_id: number
  section_id: number
  attendance_date: Date
  status: AttendanceStatus
  notes: string | null
  marked_by: number
  marked_at: Date | null
  student_name_cache: string | null
  section_name_cache: string | null
}

export interface Message {
  id: number
  sender_admin_id: number | null
  sender_parent_id: number | null
  recipient_admin_id: number | null
  recipient_parent_id: number | null
  subject: string | null
  message_text: string
  is_read: boolean | null
  read_at: Date | null
  sent_at: Date | null
}

export interface Report {
  id: number
  student_id: number
  parent_id: number
  title: string
  report_text: string
  sent_by: number
  sent_at: Date | null
  is_read: boolean | null
  read_at: Date | null
}

export interface Notification {
  id: number
  recipient_admin_id: number | null
  recipient_teacher_id: number | null
  recipient_student_id: number | null
  recipient_parent_id: number | null
  notification_type: NotificationType
  title: string
  message: string
  metadata: Record<string, any> | null
  is_read: boolean | null
  read_at: Date | null
  created_at: Date | null
  expires_at: Date | null
  recipient_name_cache: string | null
}

export interface PendingContent {
  id: number
  content_type: PendingContentType
  content_data: Record<string, any>
  teacher_id: number
  status: ApprovalStatus | null
  reviewed_by: number | null
  reviewed_at: Date | null
  rejection_reason: string | null
  submitted_at: Date | null
}

export interface ActivityLog {
  id: number
  user_type: string
  user_id: number
  user_name_cache: string | null
  action: string
  description: string | null
  metadata: Record<string, any> | null
  ip_address: string | null
  user_agent: string | null
  created_at: Date | null
}
export interface Chapter {
  id: number
  subject_id: number
  name: string
  description?: string | null
  order_index: number
  is_active: boolean
  created_at?: string
  updated_at?: string

}