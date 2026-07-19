

import { useState, useEffect, useRef } from 'react'
import { parentsAPI, messagesAPI, reportsAPI, parentStudentsAPI } from '../services/apiOthers'
import { studentsAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import Table from '../components/Table'
import Modal from '../components/Modal'
import {
  MessageSquare, Send, Mail, UserPlus, Search, X,
  Link, Unlink, Users, CheckCircle2, Clock, ChevronRight,
  Phone, AtSign, Calendar, Inbox
} from 'lucide-react'
import type { Parent, Message, Report, Student, ParentStudent } from '../types'

// ─── Skeleton loader ───────────────────────────────────────────────────────
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-lg ${className}`} />
)

// ─── Stat card ─────────────────────────────────────────────────────────────
const StatCard = ({
  icon: Icon, label, value, color, sub
}: { icon: any; label: string; value: string | number; color: string; sub?: string }) => (
  <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={17} className="text-white" />
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline gap-2">
        <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
        {sub && (
          <span className="text-[11px] text-primary-500 font-semibold bg-primary-50 px-1.5 py-0.5 rounded-md leading-none">
            {sub}
          </span>
        )}
      </div>
      <p className="text-[11px] text-gray-400 mt-1 truncate">{label}</p>
    </div>
  </div>
)

// ─── Avatar ────────────────────────────────────────────────────────────────
const Avatar = ({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) => {
  const dims = size === 'sm' ? 'w-8 h-8 text-sm' : size === 'lg' ? 'w-14 h-14 text-xl' : 'w-10 h-10 text-base'
  return (
    <div className="flex-shrink-0">
      <div className={`${dims} rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center font-bold text-white`}>
        {name.charAt(0)}
      </div>
    </div>
  )
}

// ─── Tabs config ───────────────────────────────────────────────────────────
type TabKey = 'messages' | 'reports' | 'list' | 'links'
const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: 'messages', label: 'الدردشة', icon: MessageSquare },
  { key: 'reports', label: 'التقارير', icon: Mail },
  { key: 'list', label: 'قائمة أولياء الأمور', icon: Users },
  { key: 'links', label: 'إدارة الارتباطات', icon: Link },
]

export default function Parents() {
  const { admin } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabKey>('messages')
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [parents, setParents] = useState<Parent[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [allParents, setAllParents] = useState<Parent[]>([])
  const [parentSearch, setParentSearch] = useState('')
  const [loadingParents, setLoadingParents] = useState(false)
  const [convSearch, setConvSearch] = useState('')
  const [sending, setSending] = useState(false)

  // Parent-student links
  const [parentStudentLinks, setParentStudentLinks] = useState<Array<ParentStudent & { parent: Parent; student: Student }>>([])
  const [students, setStudents] = useState<Student[]>([])
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkFormData, setLinkFormData] = useState({ parent_id: 0, student_id: 0, relationship: '' })
  const [loadingLinks, setLoadingLinks] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Derived stats
  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0)
  const unreadReports = reports.filter((r) => !r.is_read).length

  useEffect(() => { loadData() }, [activeTab])
  useEffect(() => { if (selectedParent) loadMessages() }, [selectedParent])

  // Auto-refresh messages
  useEffect(() => {
    if (activeTab !== 'messages') return
    const interval = setInterval(async () => {
      try {
        const conv = await messagesAPI.getConversations()
        setConversations(conv)
        if (selectedParent) {
          const data = await messagesAPI.getMessages(selectedParent.id)
          setMessages(data)
        }
      } catch (e) { console.error('Auto-refresh failed:', e) }
    }, 3000)
    return () => clearInterval(interval)
  }, [activeTab, selectedParent])

  useEffect(() => {
    if (activeTab !== 'messages') return
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeTab])

  const loadData = async () => {
    try {
      setLoading(true)
      if (activeTab === 'messages') {
        const data = await messagesAPI.getConversations()
        setConversations(data)
      } else if (activeTab === 'reports') {
        const data = await reportsAPI.getAll()
        setReports(data)
      } else if (activeTab === 'list') {
        const data = await parentsAPI.getAll()
        setParents(data)
      } else if (activeTab === 'links') {
        await loadParentStudentLinks()
        await loadStudents()
        if (parents.length === 0) {
          const data = await parentsAPI.getAll()
          setParents(data)
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAllParents = async () => {
    setLoadingParents(true)
    try {
      const data = await parentsAPI.getAll()
      setAllParents(data)
    } catch (error) {
      console.error('Error loading parents:', error)
    } finally {
      setLoadingParents(false)
    }
  }

  const loadParentStudentLinks = async () => {
    try {
      const data = await parentStudentsAPI.getAll()
      setParentStudentLinks(data)
    } catch (error) { console.error('Error loading links:', error) }
  }

  const loadStudents = async () => {
    try {
      const data = await studentsAPI.getAll({})
      setStudents(data)
    } catch (error) { console.error('Error loading students:', error) }
  }

  const handleOpenNewChat = () => {
    setParentSearch('')
    setShowNewChatModal(true)
    loadAllParents()
  }

  const handleSelectNewChatParent = (parent: Parent) => {
    const existingConv = conversations.find((c: any) => c.parent.id === parent.id)
    setSelectedParent(existingConv ? existingConv.parent : parent)
    setShowNewChatModal(false)
  }

  const handleDeleteLink = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الارتباط؟')) return
    try {
      await parentStudentsAPI.delete(id)
      await loadParentStudentLinks()
    } catch (error: any) {
      alert(error.message || 'حدث خطأ أثناء حذف الارتباط')
    }
  }

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!linkFormData.parent_id || !linkFormData.student_id) {
      alert('يرجى اختيار ولي الأمر والطالب')
      return
    }
    setLoadingLinks(true)
    try {
      await parentStudentsAPI.create(
        linkFormData.parent_id,
        linkFormData.student_id,
        linkFormData.relationship || null
      )
      setLinkFormData({ parent_id: 0, student_id: 0, relationship: '' })
      setShowLinkModal(false)
      await loadParentStudentLinks()
    } catch (error: any) {
      alert(error.message || 'حدث خطأ أثناء إضافة الارتباط')
    } finally {
      setLoadingLinks(false)
    }
  }

  const loadMessages = async () => {
    if (!selectedParent) return
    try {
      const data = await messagesAPI.getMessages(selectedParent.id)
      setMessages(data)
      if (admin) {
        const unreadIncoming = data.filter((m) => m.recipient_admin_id === admin.id && !m.is_read)
        if (unreadIncoming.length > 0) {
          await Promise.all(unreadIncoming.map((m) => messagesAPI.markAsRead(m.id)))
          const refreshed = await messagesAPI.getConversations()
          setConversations(refreshed)
        }
      }
    } catch (error) { console.error('Error loading messages:', error) }
  }

  const handleSendMessage = async () => {
    if (!admin || !selectedParent || !newMessage.trim()) return
    setSending(true)
    try {
      await messagesAPI.send({
        sender_admin_id: admin.id,
        sender_parent_id: null,
        recipient_admin_id: null,
        recipient_parent_id: selectedParent.id,
        subject: null,
        message_text: newMessage,
      })
      setNewMessage('')
      await loadMessages()
      await loadData()
    } catch (error: any) {
      alert(error.message || 'حدث خطأ أثناء إرسال الرسالة')
    } finally {
      setSending(false)
    }
  }

  const filteredConversations = conversations.filter((c: any) =>
    c.parent.full_name.toLowerCase().includes(convSearch.toLowerCase())
  )

  const filteredParents = allParents.filter((p) =>
    p.full_name.toLowerCase().includes(parentSearch.toLowerCase()) ||
    (p.phone_number && p.phone_number.includes(parentSearch))
  )

  // ─── Table columns ──────────────────────────────────────────────────────
  const reportColumns = [
    { key: 'title', label: 'عنوان التقرير' },
    { key: 'student_name', label: 'الطالب', render: (r: any) => r.student_name || '—' },
    { key: 'parent_name', label: 'ولي الأمر', render: (r: any) => r.parent_name || '—' },
    {
      key: 'sent_at', label: 'تاريخ الإرسال',
      render: (r: Report) => r.sent_at ? new Date(r.sent_at).toLocaleDateString('ar-SA') : '—',
    },
    // {
    //   key: 'is_read', label: 'الحالة',
    //   render: (r: Report) => (
    //     <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${r.is_read
    //       ? 'bg-green-50 text-green-700 border border-green-200'
    //       : 'bg-amber-50 text-amber-700 border border-amber-200'
    //       }`}>
    //       {r.is_read
    //         ? <><CheckCircle2 size={12} /> مقروء</>
    //         : <><Clock size={12} /> غير مقروء</>
    //       }
    //     </span>
    //   ),
    // },
  ]

  const parentColumns = [
    {
      key: 'full_name', label: 'ولي الأمر',
      render: (p: any) => (
        <div className="flex items-center gap-3">
          <Avatar name={p.full_name} size="sm" />
          <span className="font-medium text-gray-900">{p.full_name}</span>
        </div>
      )
    },
    {
      key: 'phone_number', label: 'رقم الهاتف',
      render: (p: any) => p.phone_number
        ? <span className="flex items-center gap-1.5 text-gray-600"><Phone size={13} />{p.phone_number}</span>
        : <span className="text-gray-400">—</span>
    },
    {
      key: 'email', label: 'البريد الإلكتروني',
      render: (p: any) => p.email
        ? <span className="flex items-center gap-1.5 text-gray-600"><AtSign size={13} />{p.email}</span>
        : <span className="text-gray-400">—</span>
    },
  ]

  const linkColumns = [
    {
      key: 'parent', label: 'ولي الأمر',
      render: (link: any) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={link.parent?.full_name || '؟'} size="sm" />
          <span className="font-medium text-gray-900">{link.parent?.full_name || '—'}</span>
        </div>
      ),
    },
    {
      key: 'student', label: 'الطالب',
      render: (link: any) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={link.student?.full_name || '؟'} size="sm" />
          <div>
            <p className="font-medium text-gray-900">{link.student?.full_name || '—'}</p>
            <p className="text-xs text-gray-400">{link.student?.student_code || ''}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'relationship', label: 'صلة القرابة',
      render: (link: any) => link.relationship
        ? <span className="px-2.5 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-semibold border border-primary-100">{link.relationship}</span>
        : <span className="text-gray-400">—</span>,
    },
    {
      key: 'linked_at', label: 'تاريخ الربط',
      render: (link: any) => link.linked_at ? (
        <span className="flex items-center gap-1.5 text-gray-500 text-sm">
          <Calendar size={13} />
          {new Date(link.linked_at).toLocaleDateString('ar-SA')}
        </span>
      ) : '—',
    },
    {
      key: 'actions', label: '',
      render: (link: any) => (
        <button
          onClick={() => handleDeleteLink(link.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors border border-transparent hover:border-red-200"
        >
          <Unlink size={14} />
          <span>فك الربط</span>
        </button>
      ),
    },
  ]

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 w-full">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
            أولياء الأمور
          </h1>
          <p className="text-gray-500 text-sm mt-1">التواصل مع أولياء الأمور وإدارة التقارير والارتباطات</p>
        </div>
      </div>

      {/* ── Stats row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <StatCard
          icon={Users} label="إجمالي أولياء الأمور"
          value={parents.length || conversations.length || '—'}
          color="bg-gradient-to-br from-primary-500 to-primary-600"
        />
        <StatCard
          icon={MessageSquare} label="محادثة نشطة"
          value={conversations.length}
          color="bg-gradient-to-br from-accent-500 to-accent-600"
          // sub={totalUnread > 0 ? `${totalUnread} غير مقروءة` : undefined}
        />
        <StatCard
          icon={Mail} label="التقارير المرسلة"
          value={reports.length}
          color="bg-gradient-to-br from-violet-500 to-violet-600"
          // sub={unreadReports > 0 ? `${unreadReports} لم تُقرأ` : undefined}
        />
        <StatCard
          icon={Link} label="الارتباطات النشطة"
          value={parentStudentLinks.length}
          color="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
      </div>

      {/* ── Main card ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Tabs */}
        <div className="flex items-center gap-1 p-2 border-b border-gray-100 bg-gray-50/60 overflow-x-auto">
          {TABS.map(({ key, label, icon: Icon }) => {
            const badge = key === 'messages' ? totalUnread : key === 'reports' ? unreadReports : 0
            const active = activeTab === key
            return (
              <button
                key={key}
                onClick={() => {
                  if (key === 'messages') setSelectedParent(null)
                  setActiveTab(key)
                }}
                className={`
                  relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                  transition-all duration-200 whitespace-nowrap flex-shrink-0
                  ${active
                    ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-md shadow-primary-200'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-white'
                  }
                `}
              >
                <Icon size={16} />
                <span>{label}</span>
                {badge > 0 && (
                  <span className={`
                    min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center
                    ${active ? 'bg-white/30 text-white' : 'bg-red-500 text-white'}
                  `}>
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ── MESSAGES TAB ─────────────────────────────────────────── */}
        {activeTab === 'messages' && (
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr]" style={{ height: '640px' }}>

            {/* Sidebar – conversation list */}
            <div className="border-l border-gray-100 flex flex-col overflow-hidden bg-gray-50/40">
              {/* Sidebar header */}
              <div className="p-3 border-b border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-800">
                    المحادثات
                    <span className="mr-1.5 text-xs text-gray-400 font-normal">({conversations.length})</span>
                  </span>
                  <button
                    onClick={handleOpenNewChat}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white text-xs font-semibold rounded-lg hover:shadow-md hover:shadow-primary-200 transition-all"
                  >
                    <UserPlus size={13} />
                    <span>جديد</span>
                  </button>
                </div>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="text"
                    placeholder="بحث..."
                    value={convSearch}
                    onChange={(e) => setConvSearch(e.target.value)}
                    className="w-full pr-8 pl-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-3 space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-3 w-3/4" />
                          <Skeleton className="h-2.5 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
                    <Inbox size={36} className="mb-2 opacity-40" />
                    <p className="text-sm">{convSearch ? 'لا توجد نتائج' : 'لا توجد محادثات'}</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const isActive = selectedParent?.id === conv.parent.id
                    return (
                      <button
                        key={conv.parent.id}
                        onClick={() => setSelectedParent(conv.parent)}
                        className={`
                          w-full p-3.5 text-right transition-all duration-150 group
                          border-b border-gray-100 last:border-0
                          ${isActive
                            ? 'bg-gradient-to-l from-primary-50 to-accent-50 border-r-[3px] border-r-primary-500'
                            : 'hover:bg-gray-50'
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar name={conv.parent.full_name} size="md" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className={`text-sm font-semibold truncate ${isActive ? 'text-primary-700' : 'text-gray-900'}`}>
                                {conv.parent.full_name}
                              </span>
                              {conv.unreadCount > 0 && (
                                <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                                  {conv.unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate leading-relaxed">
                              {conv.lastMessage?.message_text}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {conv.lastMessage?.sent_at
                                ? new Date(conv.lastMessage.sent_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
                                : ''}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {/* Chat area */}
            <div className="flex flex-col overflow-hidden">
              {selectedParent ? (
                <>
                  {/* Chat header */}
                  <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-white">
                    <Avatar name={selectedParent.full_name} size="md" />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-sm">{selectedParent.full_name}</h3>
                    </div>
                    {selectedParent.phone_number && (
                      <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
                        <Phone size={12} />
                        {selectedParent.phone_number}
                      </span>
                    )}
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50/50">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <div className="text-center">
                          <MessageSquare size={40} className="mx-auto mb-2 opacity-30" />
                          <p className="text-sm">لا توجد رسائل بعد</p>
                          <p className="text-xs mt-1">ابدأ المحادثة بإرسال رسالة</p>
                        </div>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isAdmin = !!msg.sender_admin_id
                        return (
                          <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                            {!isAdmin && (
                              <div className="ml-2 flex-shrink-0 self-end mb-1">
                                <Avatar name={selectedParent.full_name} size="sm" />
                              </div>
                            )}
                            <div className={`
                              max-w-[65%] group relative
                              ${isAdmin ? 'items-end' : 'items-start'}
                            `}>
                              <div className={`
                                px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                                ${isAdmin
                                  ? 'bg-gradient-to-br from-primary-600 to-accent-500 text-white rounded-br-sm'
                                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                                }
                              `}>
                                {msg.message_text}
                              </div>
                              <p className={`text-[10px] mt-1 px-1 ${isAdmin ? 'text-right text-gray-400' : 'text-gray-400'}`}>
                                {msg.sent_at
                                  ? new Date(msg.sent_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
                                  : ''}
                              </p>
                            </div>
                          </div>
                        )
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="px-4 py-3 border-t border-gray-100 bg-white">
                    <div className="flex items-center gap-2 bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-2 focus-within:border-primary-400 focus-within:bg-white transition-all">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !sending && handleSendMessage()}
                        placeholder="اكتب رسالتك..."
                        className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sending}
                        className="flex-shrink-0 w-9 h-9 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl flex items-center justify-center hover:shadow-md hover:shadow-primary-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {sending
                          ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          : <Send size={15} />
                        }
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Empty state */
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-gray-50 to-white">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center mb-4">
                    <MessageSquare size={36} className="text-primary-400" />
                  </div>
                  <p className="text-base font-semibold text-gray-600">اختر محادثة</p>
                  <p className="text-sm mt-1 max-w-[220px] text-center leading-relaxed">
                    اختر ولي أمر من القائمة الجانبية لعرض المحادثة
                  </p>
                  <button
                    onClick={handleOpenNewChat}
                    className="mt-5 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-200 transition-all"
                  >
                    <UserPlus size={16} />
                    بدء محادثة جديدة
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── REPORTS TAB ──────────────────────────────────────────── */}
        {activeTab === 'reports' && (
          <div className="p-5">
            <Table columns={reportColumns} data={reports} loading={loading} />
          </div>
        )}

        {/* ── PARENTS LIST TAB ─────────────────────────────────────── */}
        {activeTab === 'list' && (
          <div className="p-5">
            <Table columns={parentColumns} data={parents} loading={loading} />
          </div>
        )}

        {/* ── LINKS TAB ────────────────────────────────────────────── */}
        {activeTab === 'links' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">ارتباطات أولياء الأمور بالطلاب</h3>
                <p className="text-xs text-gray-500 mt-0.5">إجمالي {parentStudentLinks.length} ارتباط نشط</p>
              </div>
              <button
                onClick={() => {
                  setLinkFormData({ parent_id: 0, student_id: 0, relationship: '' })
                  setShowLinkModal(true)
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-200 transition-all"
              >
                <Link size={16} />
                <span>ربط ولي أمر</span>
              </button>
            </div>
            <Table columns={linkColumns} data={parentStudentLinks} loading={loading} />
          </div>
        )}
      </div>

      {/* ── MODAL: New Chat ──────────────────────────────────────────── */}
      <Modal isOpen={showNewChatModal} onClose={() => setShowNewChatModal(false)} title="بدء محادثة جديدة" size="md">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="ابحث بالاسم أو رقم الهاتف..."
              value={parentSearch}
              onChange={(e) => setParentSearch(e.target.value)}
              autoFocus
              className="w-full pr-10 pl-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            />
            {parentSearch && (
              <button onClick={() => setParentSearch('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100">
            {loadingParents ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-2.5 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredParents.length === 0 ? (
              <div className="py-10 text-center text-gray-400">
                <UserPlus size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">{parentSearch ? 'لا توجد نتائج' : 'لا يوجد أولياء أمور'}</p>
              </div>
            ) : (
              filteredParents.map((parent) => {
                const hasConv = conversations.some((c: any) => c.parent.id === parent.id)
                return (
                  <button
                    key={parent.id}
                    onClick={() => handleSelectNewChatParent(parent)}
                    className="w-full flex items-center gap-3 p-3.5 text-right hover:bg-gradient-to-l hover:from-primary-50 hover:to-accent-50 transition-colors group"
                  >
                    <Avatar name={parent.full_name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{parent.full_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{parent.phone_number || '—'}</p>
                    </div>
                    {hasConv
                      ? <span className="flex-shrink-0 flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-600 rounded-lg text-xs font-semibold border border-primary-100">
                          <MessageSquare size={11} />محادثة موجودة
                        </span>
                      : <ChevronRight size={16} className="text-gray-300 group-hover:text-primary-400 transition-colors" />
                    }
                  </button>
                )
              })
            )}
          </div>
        </div>
      </Modal>

      {/* ── MODAL: Link Parent-Student ───────────────────────────────── */}
      <Modal isOpen={showLinkModal} onClose={() => setShowLinkModal(false)} title="ربط ولي أمر بطالب" size="md">
        <form onSubmit={handleCreateLink} className="space-y-4">
          {/* Parent select */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              ولي الأمر <span className="text-red-500">*</span>
            </label>
            <select
              value={linkFormData.parent_id}
              onChange={(e) => setLinkFormData({ ...linkFormData, parent_id: Number(e.target.value) })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
              required
            >
              <option value={0}>اختر ولي الأمر...</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
          </div>

          {/* Student select */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              الطالب <span className="text-red-500">*</span>
            </label>
            <select
              value={linkFormData.student_id}
              onChange={(e) => setLinkFormData({ ...linkFormData, student_id: Number(e.target.value) })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
              required
            >
              <option value={0}>اختر الطالب...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.full_name} — {s.student_code}</option>
              ))}
            </select>
          </div>

          {/* Relationship */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              صلة القرابة
              <span className="mr-1 text-xs text-gray-400 font-normal">(اختياري)</span>
            </label>
            <input
              type="text"
              value={linkFormData.relationship}
              onChange={(e) => setLinkFormData({ ...linkFormData, relationship: e.target.value })}
              placeholder="مثل: أب، أم، عم..."
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            />
          </div>

          {/* Preview chip */}
          {linkFormData.parent_id > 0 && linkFormData.student_id > 0 && (
            <div className="flex items-center gap-2 p-3 bg-gradient-to-l from-primary-50 to-accent-50 rounded-xl border border-primary-100">
              <Avatar name={parents.find(p => p.id === linkFormData.parent_id)?.full_name || '؟'} size="sm" />
              <span className="text-xs text-gray-500">←</span>
              <Avatar name={students.find(s => s.id === linkFormData.student_id)?.full_name || '؟'} size="sm" />
              <p className="text-xs text-primary-700 font-medium mr-1">
                {parents.find(p => p.id === linkFormData.parent_id)?.full_name}
                {linkFormData.relationship && ` (${linkFormData.relationship})`}
                {' ↔ '}
                {students.find(s => s.id === linkFormData.student_id)?.full_name}
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowLinkModal(false)}
              className="px-5 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-sm font-semibold transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loadingLinks}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-xl hover:shadow-lg hover:shadow-primary-200 text-sm font-semibold disabled:opacity-50 transition-all"
            >
              {loadingLinks
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Link size={15} />
              }
              <span>{loadingLinks ? 'جاري الربط...' : 'تأكيد الربط'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}