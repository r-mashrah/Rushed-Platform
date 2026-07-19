// Dashboard API - Supabase
import { useAuthStore } from '../store/authStore'
import { dashboardSupabaseAPI } from './supabaseApi'

function getAuth() {
  const { userId, userType } = useAuthStore.getState()
  if (!userId || !userType) throw new Error('يجب تسجيل الدخول أولاً')
  return { userId, userType: userType as 'admin' }
}

export const dashboardAPI = {
  getStats: async () => {
    const { userId, userType } = getAuth()
    return dashboardSupabaseAPI.getStats(userId, userType)
  },
  getWeeklyActivity: async () => {
    const { userId, userType } = getAuth()
    return dashboardSupabaseAPI.getWeeklyActivity(userId, userType)
  },
  getAverageGradesBySubject: async () => {
    const { userId, userType } = getAuth()
    return dashboardSupabaseAPI.getAverageGradesBySubject(userId, userType)
  },
}
