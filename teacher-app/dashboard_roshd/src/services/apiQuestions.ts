
// Questions API - Supabase
import { useAuthStore } from '../store/authStore'
import { questionsSupabaseAPI, pendingContentSupabaseAPI } from './supabaseApi'
import type { Question, PendingContent } from '../types'

function getAuth() {
  const { userId, userType } = useAuthStore.getState()
  if (!userId || !userType) throw new Error('يجب تسجيل الدخول أولاً')
  return { userId, userType: userType as 'admin' | 'teacher' }
}

export const questionsAPI = {
  getAll: async (params?: { type?: string; difficulty?: string; subjectId?: number }): Promise<Question[]> => {
    const { userId, userType } = getAuth()
    return questionsSupabaseAPI.getAll(userId, userType, params)
  },
  getById: async (id: number): Promise<Question> => {
    const { userId, userType } = getAuth()
    return questionsSupabaseAPI.getById(id, userId, userType)
  },
  create: async (data: Omit<Question, 'id' | 'created_at' | 'updated_at' | 'status'> & { status?: Question['status'] }): Promise<Question> => {
    const { userId } = getAuth()
    return questionsSupabaseAPI.create(data as any, userId, 'admin')
  },
  update: async (id: number, data: Partial<Question>): Promise<Question> => {
    const { userId } = getAuth()
    return questionsSupabaseAPI.update(id, data, userId, 'admin')
  },
  delete: async (id: number): Promise<void> => {
    const { userId } = getAuth()
    return questionsSupabaseAPI.delete(id, userId, 'admin')
  },
}

export const pendingContentAPI = {
  getPendingQuestions: async (): Promise<PendingContent[]> => {
    const { userId } = getAuth()
    return pendingContentSupabaseAPI.getPendingQuestions(userId, 'admin')
  },
  getPendingExams: async (): Promise<PendingContent[]> => {
    const { userId } = getAuth()
    return pendingContentSupabaseAPI.getPendingExams(userId, 'admin')
  },
  approve: async (id: number, reviewedBy: number): Promise<void> => {
    const { userId } = getAuth()
    return pendingContentSupabaseAPI.approve(id, reviewedBy, userId, 'admin')
  },
  reject: async (id: number, reason: string, reviewedBy: number): Promise<void> => {
    const { userId } = getAuth()
    return pendingContentSupabaseAPI.reject(id, reason, reviewedBy, userId, 'admin')
  },
}
