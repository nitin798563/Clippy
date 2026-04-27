import React, { useRef } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Feed from './pages/Feed.jsx'
import Messages from './pages/Messages.jsx'
import ChatBox from './pages/ChatBox.jsx'
import Connections from './pages/Connections.jsx'
import Discover from './pages/Discover.jsx'
import Profile from './pages/Profile.jsx'
import CreatePost from './pages/CreatePost.jsx'
import Layout from './pages/Layout.jsx'
import { useUser, useAuth } from '@clerk/clerk-react'
import toast, { Toaster } from "react-hot-toast"
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchUser } from './features/user/userSlice.js'
import { fetchConnections } from './features/connections/connectionsSlice.js'
import { addMessages } from './features/messages/messagesSlice.js'
import Notification from './components/Notification.jsx'
import { socket } from "./socket";

const App = () => {
  const { user } = useUser();
  const { getToken } = useAuth()
  const { pathname } = useLocation()
  const pathnameRef = useRef(pathname)
  const dispatch = useDispatch()
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const token = await getToken()
        dispatch(fetchUser(token))
        dispatch(fetchConnections(token))
      }
    }
    fetchData()

  }, [user, getToken, dispatch])

  useEffect(() => {
    pathnameRef.current = pathname
  }, [pathname])

  // useEffect(() => {
  //   if (user) {
  //     const eventSource = new EventSource(import.meta.env.VITE_BASEURL + '/api/messages/' + user.id);
  //     eventSource.onmessage = (event) => {
  //       const message = JSON.parse(event.data)

  //       if (pathnameRef.current === ('/messages/' + message.from_user_id._id)) {
  //         dispatch(addMessages(message))
  //       } else {
  //         toast.custom((t) => (
  //           <Notification t={t} message={message} />
  //         ), { position: "bottom-right", duration: Infinity})
  //       }
  //     }
  //     return () => {
  //       eventSource.close()
  //     }
  //   }
  // }, [user, dispatch])

  useEffect(() => {
  if (!user) return;

  socket.emit("join", user.id);

  socket.on("receive_message", (message) => {
    if (pathnameRef.current === '/messages/' + message.from_user_id._id) {
      dispatch(addMessages(message));
    } else {
      toast.custom((t) => (
        <Notification t={t} message={message} />
      ), { position: "bottom-right" });
    }
  });

  return () => socket.off("receive_message");
}, [user]);

  return (
    <>
      <Toaster />
      <Routes>
        {/* when the user is not logged then show login page othrewise show the layout */}
        <Route path='/' element={!user ? <Login /> : <Layout />}>
          <Route index element={<Feed />} />
          <Route path='messages' element={<Messages />} />
          <Route path='messages/:userId' element={<ChatBox />} />
          <Route path='connections' element={<Connections />} />
          <Route path='discover' element={<Discover />} />
          <Route path='profile' element={<Profile />} />
          <Route path='profile/:profileId' element={<Profile />} />
          <Route path='create-post' element={<CreatePost />} />


        </Route>
      </Routes>
    </>
  )
}

export default App