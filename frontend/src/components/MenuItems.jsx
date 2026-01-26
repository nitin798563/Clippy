import { Home, MessageCircle, Search, UserIcon, Users } from 'lucide-react'
import React from 'react'
import { NavLink } from 'react-router-dom'

const MENU_ITEMS = [
  { to: '/', label: 'Feed', Icon: Home },
  { to: '/messages', label: 'Messages', Icon: MessageCircle },
  { to: '/connections', label: 'Connections', Icon: Users },
  { to: '/discover', label: 'Discover', Icon: Search },
  { to: '/profile', label: 'Profile', Icon: UserIcon },
] 

const MenuItems = ({setSidebarOpen}) => {
  return (
    <div className='px-6 text-gray-600 space-y-1 font-medium'>
        {
            MENU_ITEMS.map(({to, label,Icon})=>(
               <NavLink key={to} to={to} end={to==='/'} onClick={()=>setSidebarOpen(false)} className={({isActive})=>`px-3.5 py-2 flex items-center gap-3 rounded-xl ${isActive? 'bg-indigo-50 text-indigo-700':
                "hover:bg-gray-50"
               } `}>
                <Icon className='w-5 h-5'/>

                {label}

               </NavLink>
            ))
        }
    </div>
  )
}

export default MenuItems