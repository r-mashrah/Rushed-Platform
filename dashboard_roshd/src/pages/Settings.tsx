import { useState, useEffect, useRef } from 'react'
import { schoolSettingsAPI, adminsAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { Lock, Image as ImageIcon, Upload } from 'lucide-react'
import { uploadAdminProfileImage, FILE_LIMITS } from '../services/storageService'
import { getImageUrl } from '../lib/supabaseHelpers'
import type { SchoolSettings } from '../types'

export default function Settings() {
  const { admin, adminProfileUrl, setAdminProfileUrl } = useAuthStore()
  const [, setSettings] = useState<SchoolSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [, setSchoolName] = useState('')
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  })
  const [saving, setSaving] = useState(false)
  const [, setSchoolLogoUrl] = useState<string | null>(null)
  const [, setError] = useState('')
  const [, setSuccess] = useState('')
  const [uploadingProfile, setUploadingProfile] = useState(false)
  const profileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const data = await schoolSettingsAPI.get()
      setSettings(data)
      setSchoolName(data.school_name)
      setSchoolLogoUrl((data as unknown as Record<string, unknown>).school_logo_url as string ?? getImageUrl(data as any, 'logo') ?? null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل الإعدادات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!admin?.id) return
    adminsAPI.getById(admin.id)
      .then((a) => setAdminProfileUrl(a.profile_image_url ?? getImageUrl(a as any, 'profile') ?? null))
      .catch(() => { /* لا نمسح الصورة عند فشل الجلب */ })
  }, [admin?.id, setAdminProfileUrl])

  const handleAdminProfileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !admin) return
    setError('')
    setSuccess('')
    setUploadingProfile(true)
    try {
      const { publicUrl, storagePath } = await uploadAdminProfileImage(admin.id, file)
      const updated = await adminsAPI.updateProfileImage(admin.id, publicUrl, storagePath)
      const urlToShow = updated.profile_image_url || publicUrl
      setAdminProfileUrl(urlToShow)
      setSuccess('تم تحديث صورة المسؤول بنجاح')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل رفع الصورة')
    } finally {
      setUploadingProfile(false)
      e.target.value = ''
    }
  }

  const handleChangePassword = async () => {
    if (!admin) return
    if (passwordData.new !== passwordData.confirm) {
      setError('كلمة السر الجديدة لا تطابق التأكيد')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await adminsAPI.updatePassword(admin.id, passwordData.current, passwordData.new)
      setSuccess('تم تحديث كلمة السر بنجاح')
      setPasswordData({ current: '', new: '', confirm: '' })
    } catch (err: any) {
      setError(err.message || 'حدث خطأ')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  }

  return (
    <div className="space-y-8 w-full">
      <div className="mb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent mb-2">
          الإعدادات
        </h1>
        <p className="text-gray-600 text-lg">إعدادات المدرسة وكلمة السر</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
              <ImageIcon className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">صورة المسؤول (حد أقصى {FILE_LIMITS.imageMaxMB} ميجابايت)</h2>
          </div>
          <div className="flex items-center gap-4">
            {adminProfileUrl ? (
              <img src={adminProfileUrl} alt="صورة المسؤول" className="h-24 w-24 rounded-full object-cover border-2 border-gray-200" />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                <ImageIcon className="text-gray-400" size={40} />
              </div>
            )}
            <div>
              <input
                ref={profileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAdminProfileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => profileInputRef.current?.click()}
                disabled={uploadingProfile}
                className="flex items-center gap-2 px-4 py-2 border-2 border-indigo-500 text-indigo-600 rounded-xl hover:bg-indigo-50 font-medium disabled:opacity-50"
              >
                <Upload size={18} />
                {uploadingProfile ? 'جاري الرفع...' : (adminProfileUrl ? 'تغيير الصورة' : 'رفع صورة')}
              </button>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl">
              <Lock className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">تغيير كلمة السر</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">كلمة السر الحالية</label>
              <input
                type="password"
                value={passwordData.current}
                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                className="w-full px-5 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                placeholder="أدخل كلمة السر الحالية"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">كلمة السر الجديدة</label>
              <input
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                className="w-full px-5 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                placeholder="أدخل كلمة السر الجديدة"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">تأكيد كلمة السر الجديدة</label>
              <input
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                className="w-full px-5 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                placeholder="أعد إدخال كلمة السر الجديدة"
              />
            </div>
            
            <button
              onClick={handleChangePassword}
              disabled={saving}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock size={20} />
              <span>{saving ? 'جاري التحديث...' : 'تحديث كلمة السر'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
