import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, MessageCircle, Search, UserIcon, Users } from 'lucide-react'

const MENU_ITEMS = [
  { to: '/', label: 'Feed', Icon: Home },
  { to: '/messages', label: 'Messages', Icon: MessageCircle },
  { to: '/connections', label: 'Connections', Icon: Users },
  { to: '/discover', label: 'Discover', Icon: Search },
  { to: '/profile', label: 'Profile', Icon: UserIcon },
]

const MobileBottomMenu = () => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 px-3 py-2 flex justify-around text-gray-600 z-50">
      {MENU_ITEMS.map(({ to, Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center text-xs ${
              isActive ? 'text-indigo-600' : 'text-gray-500'
            }`
          }
        >
          <Icon className="w-6 h-6" />
          <span>{label}</span>
        </NavLink>
      ))}
    </div>
  )
}

export default MobileBottomMenu
