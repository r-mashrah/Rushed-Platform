// Reusable Modal Component with Modern Design
import { X } from 'lucide-react'
import { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" dir="rtl">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className={`inline-block align-bottom bg-white rounded-2xl text-right overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle w-full ${sizeClasses[size]}`}>
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-primary-600 to-accent-500 px-6 py-5 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Content */}
          <div className="bg-white px-6 py-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
