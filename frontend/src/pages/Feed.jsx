import React, { useEffect, useState } from 'react'
import { assets, dummyPostsData } from '../assets/assets.js'
import Loading from '../components/Loading.jsx'
import StoriesBar from '../components/StoriesBar.jsx'
import PostCard from '../components/PostCard.jsx'
import RecentMessages from '../components/RecentMessages.jsx'
import { useAuth } from '@clerk/clerk-react'
import api from '../axios.js'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { CirclePlus } from 'lucide-react'

const Feed = () => {

  const [feeds, setFeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const { getToken } = useAuth()

  const fetchFeeds = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('api/post/feed', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })

      if (data.success) {
        setFeeds(data.posts)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchFeeds()
  }, [])

  return !loading ? (
    <div className='h-full overflow-y-scroll np-scroller py-10 xl:pr-5 flex items-start justify-center xl:gap-8'>
      {/* Stories and Post List */}
      <div>
        <StoriesBar />

        {/* Create Post */}
        <div className="mx-4 mt-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 p-[1.5px]">
          <div className="flex items-center justify-between py-1.5 px-4 rounded-lg bg-white">
            {/* Left text */}
            <span className="font-medium text-gray-800">
              Create New Post
            </span>
            {/* Right icon (colored background only) */}
            <Link
              to="/create-post"
              className="p-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 active:scale-95 transition"   >
              <CirclePlus className="w-5 h-5" />
            </Link>
          </div>
        </div>


        <div className='p-4 space-y-6'>
          {/* List of Post */}
          {feeds.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>
      {/* Right Sidebar */}
      <div className='max-xl:hidden sticky top-0'>
        <div className='max-w-xs bg-white text-xs p-4 rounded-md inline-flex flex-col gap-2 shadow'>
          <h3 className='text-slate-800 font-semibold'>Sponsored</h3>
          <img src={assets.sponsored_img} className='w-75 h-50 rounded-md' alt='' />
          <p className='text-slate-600'>Email marketting</p>
          <p className='text-slate-400'>SuperCharge Your marketting with a powerful, easy-to-use platform built for results</p>
        </div>

        {/* Recent Messages */}
        <RecentMessages />
      </div>

    </div>
  ) : <Loading />
}

export default Feed