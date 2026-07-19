

const DATE_KEYS = new Set([
  'created_at', 'updated_at', 'deleted_at', 'last_login_at', 'sent_at', 'read_at',
  'published_at', 'scheduled_at', 'marked_at', 'submitted_at', 'reviewed_at',
  'graded_at', 'started_at', 'expires_at', 'linked_at', 'assigned_at', 'added_at',
  'attendance_date', 'start_date', 'end_date',
])

function isIsoDateString(v: unknown): v is string {
  if (typeof v !== 'string') return false
  if (!/^\d{4}-\d{2}-\d{2}/.test(v)) return false
  const d = new Date(v)
  return !Number.isNaN(d.getTime())
}

export function parseRowDates<T extends Record<string, unknown>>(row: T): T {
  const out = { ...row }
  for (const key of Object.keys(out)) {
    if (DATE_KEYS.has(key) && isIsoDateString(out[key])) {
      (out as Record<string, unknown>)[key] = new Date(out[key] as string)
    }
  }
  return out
}

export function parseRowsDates<T extends Record<string, unknown>>(rows: T[]): T[] {
  return rows.map(parseRowDates)
}

/** Get display URL for image: prefer *_url if present, else data URL from bytea */
export function getImageUrl(row: {
  profile_image_url?: string | null
  profile_image?: unknown
  profile_image_mime_type?: string | null
  school_logo_url?: string | null
  school_logo?: unknown
  school_logo_mime_type?: string | null
}, kind: 'profile' | 'logo'): string | null {
  if (kind === 'profile') {
    if (row.profile_image_url) return row.profile_image_url
    if (row.profile_image && row.profile_image_mime_type) {
      const bytes = row.profile_image as ArrayBuffer | number[]
      const base64 = typeof bytes === 'object' && ArrayBuffer.isView(bytes)
        ? btoa(String.fromCharCode(...new Uint8Array(bytes as ArrayBuffer)))
        : Array.isArray(bytes)
          ? btoa(String.fromCharCode(...bytes))
          : null
      if (base64) return `data:${row.profile_image_mime_type};base64,${base64}`
    }
  } else {
    if (row.school_logo_url) return row.school_logo_url
    if (row.school_logo && row.school_logo_mime_type) {
      const bytes = row.school_logo as ArrayBuffer | number[]
      const base64 = typeof bytes === 'object' && ArrayBuffer.isView(bytes)
        ? btoa(String.fromCharCode(...new Uint8Array(bytes as ArrayBuffer)))
        : Array.isArray(bytes)
          ? btoa(String.fromCharCode(...bytes))
          : null
      if (base64) return `data:${row.school_logo_mime_type};base64,${base64}`
    }
  }
  return null
}
