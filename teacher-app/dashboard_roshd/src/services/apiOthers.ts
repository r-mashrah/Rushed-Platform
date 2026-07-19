// Other APIs (Reports, Attendance, Parents, Messages, ReportsGrades) - Supabase
import { useAuthStore } from '../store/authStore'
import {
  reportsSupabaseAPI,
  attendanceSupabaseAPI,
  parentsSupabaseAPI,
  messagesSupabaseAPI,
  reportsGradesSupabaseAPI,
  parentStudentsSupabaseAPI,
} from './supabaseApi'
import type { Report, Attendance, Parent, Message, ExamResult, Student, Exam, Subject, ParentStudent } from '../types'

function getAuth() {
  const { userId, userType } = useAuthStore.getState()
  if (!userId || !userType) throw new Error('يجب تسجيل الدخول أولاً')
  return { userId, userType: userType as 'admin' }
}

export const reportsAPI = {
  getAll: async (): Promise<Report[]> => {
    const { userId } = getAuth()
    return reportsSupabaseAPI.getAll(userId, 'admin')
  },
  create: async (data: Omit<Report, 'id' | 'sent_at' | 'is_read' | 'read_at'>): Promise<Report> => {
    const { userId } = getAuth()
    return reportsSupabaseAPI.create(data, userId, 'admin')
  },
}

export const attendanceAPI = {
  getByDate: async (date: Date): Promise<Attendance[]> => {
    const { userId } = getAuth()
    return attendanceSupabaseAPI.getByDate(date, userId, 'admin')
  },
  getBySectionAndDate: async (sectionId: number, date: Date): Promise<Attendance[]> => {
    const { userId } = getAuth()
    return attendanceSupabaseAPI.getBySectionAndDate(sectionId, date, userId, 'admin')
  },
  upsert: async (rows: Array<{ student_id: number; section_id: number; attendance_date: string; status: string; notes?: string | null; marked_by: number }>): Promise<void> => {
    const { userId } = getAuth()
    return attendanceSupabaseAPI.upsert(rows, userId, 'admin')
  },
}

export const parentsAPI = {
  getAll: async (): Promise<Parent[]> => {
    const { userId } = getAuth()
    return parentsSupabaseAPI.getAll(userId, 'admin')
  },
  getByStudent: async (studentId: number): Promise<Parent[]> => {
    const { userId } = getAuth()
    return parentsSupabaseAPI.getByStudent(studentId, userId, 'admin')
  },
}

export const messagesAPI = {
  getConversations: async (): Promise<Array<{ parent: Parent; lastMessage: Message; unreadCount: number }>> => {
    const { userId } = getAuth()
    return messagesSupabaseAPI.getConversations(userId, 'admin')
  },
  getMessages: async (parentId: number): Promise<Message[]> => {
    const { userId } = getAuth()
    return messagesSupabaseAPI.getMessages(parentId, userId, 'admin')
  },
  send: async (data: Omit<Message, 'id' | 'sent_at' | 'is_read' | 'read_at'>): Promise<Message> => {
    const { userId } = getAuth()
    const payload = {
      ...data,
      sender_admin_id: data.sender_admin_id ?? undefined,
      sender_parent_id: data.sender_parent_id ?? undefined,
      recipient_admin_id: data.recipient_admin_id ?? undefined,
      recipient_parent_id: data.recipient_parent_id ?? undefined,
    }
    return messagesSupabaseAPI.send(payload, userId, 'admin')
  },
  markAsRead: async (messageId: number): Promise<void> => {
    const { userId } = getAuth()
    return messagesSupabaseAPI.markAsRead(messageId, userId, 'admin')
  },
}

export const reportsGradesAPI = {
  getAll: async (params?: { gradeId?: number }): Promise<Array<{ student: Student; averagePercentage: number }>> => {
    const { userId } = getAuth()
    return reportsGradesSupabaseAPI.getAll(userId, 'admin', params)
  },
  getStudentDetails: async (studentId: number): Promise<{
    student: Student
    results: Array<{ exam: Exam; result: ExamResult; subject: Subject }>
  }> => {
    const { userId } = getAuth()
    return reportsGradesSupabaseAPI.getStudentDetails(studentId, userId, 'admin')
  },
}

export const parentStudentsAPI = {
  getAll: async (): Promise<Array<ParentStudent & { parent: Parent; student: Student }>> => {
    const { userId } = getAuth()
    return parentStudentsSupabaseAPI.getAll(userId, 'admin')
  },
  delete: async (id: number): Promise<void> => {
    const { userId } = getAuth()
    return parentStudentsSupabaseAPI.delete(id, userId, 'admin')
  },
  create: async (parentId: number, studentId: number, relationship: string | null): Promise<ParentStudent> => {
    const { userId } = getAuth()
    return parentStudentsSupabaseAPI.link(parentId, studentId, relationship, userId, 'admin')
  },
}
