import { NavLink } from 'react-router-dom'
import { Calendar, Megaphone, Users, Settings } from 'lucide-react'
import { useAuthStore } from '@/features/auth/stores/authStore'

const navItems = [
  { to: '/calendar', icon: Calendar, label: '달력' },
  { to: '/notices', icon: Megaphone, label: '공지' },
  { to: '/teams', icon: Users, label: '팀 조회' },
]

const adminItem = { to: '/admin/members', icon: Settings, label: '관리' }

export default function BottomNav() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = user && (user.role === 'root' || user.role === 'admin')

  const items = isAdmin ? [...navItems, adminItem] : navItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-lg">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
