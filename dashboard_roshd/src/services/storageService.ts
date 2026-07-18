/**
 * Supabase Storage upload with size limits:
 * - Images (school logo, admin profile): max 5 MB
 * - Subject PDF: max 30 MB
 */

import { supabase } from '../lib/supabase'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024   // 5 MB
const MAX_PDF_BYTES = 30 * 1024 * 1024    // 30 MB

const BUCKET_SCHOOL = 'school-settings'
const BUCKET_PROFILE = 'profile-images'
const BUCKET_SUBJECTS = 'subject-materials'
const BUCKET_EXAMS = 'exam-files'

export const FILE_LIMITS = {
  imageMaxMB: 5,
  pdfMaxMB: 30,
}

function getExtension(filename: string): string {
  const i = filename.lastIndexOf('.')
  return i >= 0 ? filename.slice(i) : ''
}

function safeFilename(filename: string): string {
  const ext = getExtension(filename)
  const base = filename.slice(0, filename.length - ext.length)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 80)
  return base + ext
}

/**
 * Validate image file: type and size (max 5 MB).
 */
export function validateImageFile(file: File): void {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowed.includes(file.type)) {
    throw new Error('نوع الملف غير مدعوم. استخدم: JPG, PNG, GIF أو WebP.')
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`حجم الصورة يجب ألا يتجاوز ${FILE_LIMITS.imageMaxMB} ميجابايت.`)
  }
}

/**
 * Validate PDF file: type and size (max 30 MB).
 */
export function validatePdfFile(file: File): void {
  if (file.type !== 'application/pdf') {
    throw new Error('الملف يجب أن يكون PDF.')
  }
  if (file.size > MAX_PDF_BYTES) {
    throw new Error(`حجم ملف PDF يجب ألا يتجاوز ${FILE_LIMITS.pdfMaxMB} ميجابايت.`)
  }
}


export async function uploadSchoolLogo(file: File): Promise<{ publicUrl: string; storagePath: string }> {
  validateImageFile(file)
  const path = `logo${getExtension(file.name)}`
  const { data, error } = await supabase.storage
    .from(BUCKET_SCHOOL)
    .upload(path, file, { upsert: true, contentType: file.type })
  if (error) throw new Error(error.message || 'فشل رفع شعار المدرسة')
  const { data: urlData } = supabase.storage.from(BUCKET_SCHOOL).getPublicUrl(data.path)
  return { publicUrl: urlData.publicUrl, storagePath: data.path }
}


export async function uploadAdminProfileImage(adminId: number, file: File): Promise<{ publicUrl: string; storagePath: string }> {
  validateImageFile(file)
  const filename = safeFilename(file.name) || `profile${getExtension(file.name)}`
  const path = `admins/${adminId}/${filename}`
  const { data, error } = await supabase.storage
    .from(BUCKET_PROFILE)
    .upload(path, file, { upsert: true, contentType: file.type })
  if (error) throw new Error(error.message || 'فشل رفع صورة المسؤول')
  const { data: urlData } = supabase.storage.from(BUCKET_PROFILE).getPublicUrl(data.path)
  return { publicUrl: urlData.publicUrl, storagePath: data.path }
}

/**
 * Upload subject PDF to subject-materials/{subjectId}/{filename}.
 */
export async function uploadSubjectPdf(subjectId: number, file: File): Promise<{ publicUrl: string; storagePath: string }> {
  validatePdfFile(file)
  const filename = safeFilename(file.name) || `material.pdf`
  const path = `${subjectId}/${filename}`
  const { data, error } = await supabase.storage
    .from(BUCKET_SUBJECTS)
    .upload(path, file, { upsert: true, contentType: file.type })
  if (error) throw new Error(error.message || 'فشل رفع ملف PDF')
  const { data: urlData } = supabase.storage.from(BUCKET_SUBJECTS).getPublicUrl(data.path)
  return { publicUrl: urlData.publicUrl, storagePath: data.path }
}

/**
 * Upload question PDF to subject-materials/questions/{questionId}/{filename}.
 */
export async function uploadQuestionPdf(questionId: number, file: File): Promise<{ publicUrl: string; storagePath: string }> {
  validatePdfFile(file)
  const filename = safeFilename(file.name) || 'question.pdf'
  const path = `questions/${questionId}/${filename}`
  const { data, error } = await supabase.storage
    .from(BUCKET_SUBJECTS)
    .upload(path, file, { upsert: true, contentType: file.type })
  if (error) throw new Error(error.message || 'فشل رفع ملف السؤال')
  const { data: urlData } = supabase.storage.from(BUCKET_SUBJECTS).getPublicUrl(data.path)
  return { publicUrl: urlData.publicUrl, storagePath: data.path }
}

/**
 * Upload exam PDF to exam-files/{examId}/{filename}.
 */
export async function uploadExamPdf(examId: number, file: File): Promise<{ publicUrl: string; storagePath: string }> {
  validatePdfFile(file)
  const filename = safeFilename(file.name) || 'exam.pdf'
  const path = `${examId}/${filename}`
  const { data, error } = await supabase.storage
    .from(BUCKET_EXAMS)
    .upload(path, file, { upsert: true, contentType: file.type })
  if (error) throw new Error(error.message || 'فشل رفع ملف الاختبار')
  const { data: urlData } = supabase.storage.from(BUCKET_EXAMS).getPublicUrl(data.path)
  return { publicUrl: urlData.publicUrl, storagePath: data.path }
}

/**
 * Optional: remove file from storage by path (e.g. when replacing logo).
 */
export async function removeStorageFile(bucket: string, storagePath: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([storagePath])
  if (error) console.warn('Storage remove failed:', error.message)
}
