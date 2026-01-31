import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react';
import { dummyUserData } from '../assets/assets';
import MobileBottomMenu from '../components/MobileBottomMenu.jsx'
import Loading from '../components/Loading.jsx';
import { useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar.jsx';


const Layout = () => {

  const user = useSelector((state) => state.user.value)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return user ? (
    <div className='w-full flex h-screen'>

      {/* Desktop Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <div className='flex-1 bg-slate-50 pb-10'>
        <Outlet />
      </div>

      {/* Hamburger / Close button for mobile sidebar */}
      {
        sidebarOpen ?
          <X className='absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden' onClick={() => setSidebarOpen(false)} />
          :
          <Menu className='absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden' onClick={() => setSidebarOpen(true)} />
      }

       {/* Mobile Bottom Menu */}
      <MobileBottomMenu />
    </div>
  ) : (
    <Loading />
  )
}

export default Layout