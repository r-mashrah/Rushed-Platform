



import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import { LogIn, School, AlertCircle, Lock } from 'lucide-react'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');

  @keyframes cardEnter {
    from { opacity: 0; transform: translateY(32px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }
  @keyframes shimmerSweep {
    0%   { transform: translateX(-100%) skewX(-15deg); }
    100% { transform: translateX(260%)  skewX(-15deg); }
  }
  @keyframes logoFloat {
    0%,100% { transform: translateY(0);    }
    50%     { transform: translateY(-7px); }
  }
  @keyframes ringGlow {
    0%,100% { box-shadow: 0 0 0 0px rgba(20,184,166,0.30), 0 14px 40px rgba(20,184,166,0.28); }
    50%     { box-shadow: 0 0 0 9px rgba(20,184,166,0.07), 0 18px 48px rgba(20,184,166,0.38); }
  }
  @keyframes gradientShimmer {
    0%   { background-position: 0%   center; }
    100% { background-position: 200% center; }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes iconPop {
    0%,100% { transform: translateY(-50%) scale(1);    }
    40%     { transform: translateY(-50%) scale(1.28); }
    70%     { transform: translateY(-50%) scale(0.91); }
  }
  @keyframes meshMove {
    0%   { background-position: 0%   50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0%   50%; }
  }
  @keyframes footerFade {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0);    }
  }

  .lms-root, .lms-root * { font-family: 'Cairo', sans-serif; }

  /* ── الخلفية الأصلية teal ── */
  .lms-bg {
    background: linear-gradient(
      135deg,
      #0f766e 0%,
      #0d9488 20%,
      #0891b2 40%,
      #0369a1 60%,
      #0e7490 80%,
      #14b8a6 100%
    );
    background-size: 400% 400%;
    animation: meshMove 14s ease infinite;
  }

  /* ── Card ── */
  .login-card {
    animation: cardEnter 0.58s cubic-bezier(0.22,1,0.36,1) both;
    background: rgba(255,255,255,0.97);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.5);
    box-shadow:
      0  2px  6px  rgba(0,0,0,0.04),
      0  8px  30px rgba(13,148,136,0.14),
      0 36px  80px rgba(13,148,136,0.18),
      inset 0 1px 0 rgba(255,255,255,0.95);
  }

  /* ── Logo ring ── */
  .logo-ring {
    border-radius: 24px;
    padding: 3px;
    background: linear-gradient(135deg, #14b8a6, #0ea5e9, #6366f1, #14b8a6);
    background-size: 300% 300%;
    animation:
      logoFloat       4s ease-in-out infinite,
      ringGlow        4s ease-in-out infinite,
      gradientShimmer 4s linear    infinite;
  }
  .logo-ring-inner {
    background: #fff;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    width: 100%;
    height: 100%;
  }

  /* ── School title ── */
  .school-title {
    font-size: 2rem;
    font-weight: 900;
    letter-spacing: 0.01em;
    line-height: 1.2;
    background: linear-gradient(90deg, #0f766e, #0369a1, #14b8a6, #0f766e);
    background-size: 300% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradientShimmer 5s linear infinite;
  }

  /* ── Fields ── */
  .field-label {
    font-size: 0.875rem;
    font-weight: 700;
    color: #334155;
    margin-bottom: 0.45rem;
    display: block;
  }
  .field-input {
    font-size: 0.95rem;
    font-weight: 500;
    color: #1e293b;
    border: 2px solid #e2e8f0;
    background: #f8fafc;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  }
  .field-input:focus {
    outline: none;
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13,148,136,0.13);
    background: #fff;
  }
  .field-input::placeholder { color: #94a3b8; font-weight: 400; }
  .field-wrapper:focus-within .field-icon {
    animation: iconPop 0.36s ease both;
    color: #0d9488 !important;
  }

  /* ── Button ── */
  .btn-login {
    background: linear-gradient(90deg, #0f766e 0%, #0d9488 45%, #0ea5e9 100%);
    font-weight: 700;
    font-size: 1rem;
    letter-spacing: 0.02em;
    position: relative;
    overflow: hidden;
    transition: transform 0.22s ease, box-shadow 0.22s ease;
    box-shadow: 0 5px 20px rgba(13,148,136,0.38);
  }
  .btn-login::after {
    content: '';
    position: absolute;
    inset-block: 0;
    width: 55%;
    background: linear-gradient(to right, transparent 0%, rgba(255,255,255,0.26) 50%, transparent 100%);
    transform: translateX(-120%) skewX(-15deg);
    pointer-events: none;
  }
  .btn-login:hover:not(:disabled)::after { animation: shimmerSweep 0.65s ease forwards; }
  .btn-login:hover:not(:disabled)        { transform: translateY(-3px) scale(1.015); box-shadow: 0 18px 44px rgba(13,148,136,0.42); }
  .btn-login:active:not(:disabled)       { transform: translateY(0)    scale(0.99);  box-shadow: 0  6px 18px rgba(13,148,136,0.28); }

  /* ── Footer ── */
  .login-footer {
    animation: footerFade 0.8s 0.4s ease both;
    border-top: 1px solid #e2e8f0;
    margin-top: 2rem;
    padding-top: 1.25rem;
    text-align: center;
  }
  .login-footer p {
    font-size: 0.82rem;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 0.03em;
  }
  .login-footer span {
    color: #94a3b8;
    margin: 0 4px;
  }

  .animate-fade-in { animation: fadeIn 0.3s ease both; }

  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #e2e8f0 30%, #e2e8f0 70%, transparent);
    margin: 0.25rem 0 1.4rem;
  }
`

export default function Login() {
  const navigate  = useNavigate()
  const { login } = useAuthStore()
  const [schoolCode, setSchoolCode] = useState('')
  const [password,   setPassword]   = useState('')
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [schoolName, setSchoolName] = useState('منصة رُشد')

  useEffect(() => {
    const el = document.createElement('style')
    el.textContent = styles
    document.head.appendChild(el)
    return () => el.remove()
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('school_settings').select('school_name').single()
        if (!error && data) setSchoolName(data.school_name)
      } catch (err) { console.error(err) }
    }
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(schoolCode, password)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="lms-root lms-bg min-h-screen flex items-center justify-center p-4" dir="rtl">

      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.11) 1px, transparent 0)',
        backgroundSize: '38px 38px',
      }} />

      {/* Glow blobs */}
      <div className="absolute pointer-events-none" style={{
        width: 520, height: 520, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(20,184,166,0.20) 0%, transparent 70%)',
        top: '-130px', right: '-130px', filter: 'blur(55px)',
      }} />
      <div className="absolute pointer-events-none" style={{
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(14,116,144,0.18) 0%, transparent 70%)',
        bottom: '-100px', left: '-100px', filter: 'blur(55px)',
      }} />

      {/* ── Card ── */}
      <div className="login-card w-full max-w-md relative z-10 rounded-3xl p-8">

        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-6">
          <div className="logo-ring mb-5" style={{ width: 108, height: 108 }}>
            <div className="logo-ring-inner">
              <img
                src="/assets/roshd.png"
                alt="رُشد"
                style={{ width: 80, height: 80, objectFit: 'contain', display: 'block' }}
              />
            </div>
          </div>
          <h1 className="school-title">{schoolName}</h1>
          <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.82rem', letterSpacing: '0.04em', marginTop: '4px' }}>
            لوحة الإدارة 
          </p>
        </div>

        <div className="divider" />

        {/* Error */}
        {error && (
          <div className="mb-5 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3 text-red-700 animate-fade-in">
            <AlertCircle size={20} className="shrink-0" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label htmlFor="schoolCode" className="field-label">رمز المدرسة</label>
            <div className="relative field-wrapper">
              <div className="field-icon absolute right-4 top-1/2 text-gray-400" style={{ transform: 'translateY(-50%)' }}>
                <School size={19} />
              </div>
              <input
                id="schoolCode"
                type="text"
                autoComplete="off"
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value)}
                className="field-input w-full pr-12 pl-4 py-3.5 rounded-xl"
                placeholder="أدخل رمز المدرسة"
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="field-label">كلمة السر</label>
            <div className="relative field-wrapper">
              <div className="field-icon absolute right-4 top-1/2 text-gray-400" style={{ transform: 'translateY(-50%)' }}>
                <Lock size={19} />
              </div>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field-input w-full pr-12 pl-4 py-3.5 rounded-xl"
                placeholder="أدخل كلمة السر"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-login w-full text-white py-4 rounded-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>جاري تسجيل الدخول...</span>
              </>
            ) : (
              <>
                <LogIn size={20} />
                <span>تسجيل الدخول</span>
              </>
            )}
          </button>

        </form>

        {/* ── Footer ── */}
        <div className="login-footer">
          <p>
            © {new Date().getFullYear()}
            <span>|</span>
            منصة رُشد التعليمية الذكية
          </p>
        </div>

      </div>
    </div>
  )
}