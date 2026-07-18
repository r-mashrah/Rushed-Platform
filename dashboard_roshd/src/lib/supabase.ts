
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// ── Client العادي للقراءة والكتابة العادية ────────────────────
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

// ── Admin Client لعمليات إنشاء المستخدمين فقط ────────────────
// يستخدم service_role key — لا يُستخدم إلا في provisionAPI
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null

/**
 * Set user context for RLS policies
 * Must be called before each query that needs RLS
 */
export async function setUserContext(
  userId: number,
  userType: 'admin' | 'teacher' | 'student' | 'parent'
) {
  const { error } = await supabase.rpc('set_user_context', {
    p_user_id: userId,
    p_user_type: userType,
  })

  if (error) {
    console.error('Error setting user context:', error)
    throw error
  }
}

/**
 * Clear user context (on logout).
 * Ignores errors so logout never fails.
 */
export async function clearUserContext() {
  try {
    await supabase.rpc('set_user_context', {
      p_user_id: 0,
      p_user_type: 'guest',
    })
  } catch {
    // Ignore
  }
}