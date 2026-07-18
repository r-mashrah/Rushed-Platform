// Exams API - Supabase
import { useAuthStore } from '../store/authStore'
import { examsSupabaseAPI, examQuestionsSupabaseAPI } from './supabaseApi'
import type { Exam, ExamQuestion } from '../types'

function getAuth() {
  const { userId, userType } = useAuthStore.getState()
  if (!userId || !userType) throw new Error('يجب تسجيل الدخول أولاً')
  return { userId, userType: userType as 'admin' | 'teacher' }
}

export const examsAPI = {
  getAll: async (): Promise<Exam[]> => {
    const { userId, userType } = getAuth()
    return examsSupabaseAPI.getAll(userId, userType)
  },
  getById: async (id: number): Promise<Exam> => {
    const { userId, userType } = getAuth()
    return examsSupabaseAPI.getById(id, userId, userType)
  },
  create: async (data: Omit<Exam, 'id' | 'created_at' | 'updated_at' | 'total_marks'>): Promise<Exam> => {
    const { userId } = getAuth()
    return examsSupabaseAPI.create(data, userId, 'admin')
  },
  update: async (id: number, data: Partial<Exam>): Promise<Exam> => {
    const { userId } = getAuth()
    return examsSupabaseAPI.update(id, data, userId, 'admin')
  },
  delete: async (id: number): Promise<void> => {
    const { userId } = getAuth()
    return examsSupabaseAPI.delete(id, userId, 'admin')
  },
  publish: async (id: number): Promise<void> => {
    const { userId } = getAuth()
    return examsSupabaseAPI.publish(id, userId, 'admin')
  },
  getQuestions: async (examId: number): Promise<ExamQuestion[]> => {
    const { userId, userType } = getAuth()
    return examQuestionsSupabaseAPI.getByExam(examId, userId, userType)
  },
  addQuestion: async (examId: number, questionId: number, order: number, marks: number): Promise<ExamQuestion> => {
    const { userId } = getAuth()
    return examQuestionsSupabaseAPI.addQuestion(examId, questionId, order, marks, userId, 'admin')
  },
  removeQuestion: async (examId: number, questionId: number): Promise<void> => {
    const { userId } = getAuth()
    return examQuestionsSupabaseAPI.removeQuestion(examId, questionId, userId, 'admin')
  },
}
