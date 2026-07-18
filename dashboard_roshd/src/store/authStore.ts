import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase, setUserContext, clearUserContext } from '../lib/supabase'

interface Admin {
  id: number
  full_name: string
  email: string | null
  phone_number: string | null
}

interface AuthState {
  isAuthenticated: boolean
  admin: Admin | null
  /** صورة المسؤول (رابط من Storage) - مصدر واحد للهيدر وصفحة الإعدادات */
  adminProfileUrl: string | null
  token: string | null
  userId: number | null
  userType: 'admin' | 'teacher' | 'student' | 'parent' | null

  setAdminProfileUrl: (url: string | null) => void
  login: (schoolCode: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      admin: null,
      adminProfileUrl: null,
      token: null,
      userId: null,
      userType: null,

      setAdminProfileUrl: (url) => set({ adminProfileUrl: url }),

      login: async (schoolCode: string, password: string) => {
        try {
          // Use login_admin function (bypasses RLS securely)
          const { data: adminData, error: loginError } = await supabase.rpc('login_admin', {
            p_school_code: schoolCode,
            p_password: password,
          })

          if (loginError) {
            console.error('Login error:', loginError)
            
            // Parse error message from Supabase
            const errorMessage = loginError.message || loginError.details || 'حدث خطأ أثناء تسجيل الدخول'
            
            // Check for specific error codes
            if (errorMessage.includes('رمز المدرسة')) {
              throw new Error('رمز المدرسة غير صحيح')
            }
            if (errorMessage.includes('المسؤول غير موجود')) {
              throw new Error('المسؤول غير موجود')
            }
            if (errorMessage.includes('كلمة السر')) {
              throw new Error('كلمة السر غير صحيحة')
            }
            
            throw new Error(errorMessage)
          }

          if (!adminData || adminData.length === 0) {
            throw new Error('فشل تسجيل الدخول - لا توجد بيانات')
          }

          const admin = adminData[0]

          // Set user context for RLS (for subsequent queries)
          await setUserContext(admin.id, 'admin')

          // Update state
          set({
            isAuthenticated: true,
            admin: {
              id: admin.id,
              full_name: admin.full_name,
              email: admin.email,
              phone_number: admin.phone_number,
            },
            token: `jwt_${admin.id}_${Date.now()}`,
            userId: admin.id,
            userType: 'admin',
          })
        } catch (error: any) {
          console.error('Login error:', error)
          // Re-throw with user-friendly message
          if (error.message) {
            throw error
          }
          throw new Error('حدث خطأ أثناء تسجيل الدخول')
        }
      },

      logout: async () => {
        try {
          await clearUserContext()
        } catch (error) {
          console.error('Error clearing user context:', error)
        }
        
        set({
          isAuthenticated: false,
          admin: null,
          adminProfileUrl: null,
          token: null,
          userId: null,
          userType: null,
        })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
