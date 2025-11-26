import React, { useEffect, useState } from 'react'
import { assets, dummyPostsData } from '../assets/assets.js'
import Loading from '../components/Loading.jsx'
import StoriesBar from '../components/StoriesBar.jsx'
import PostCard from '../components/PostCard.jsx'
import RecentMessages from '../components/RecentMessages.jsx'

const Feed = () => {

  const [feeds, setfeeds] = useState([])
  const [loading, setLoading] = useState(true)

  const fetachFeeds = async() => {
    setfeeds(dummyPostsData)
    setLoading(false)
  }

useEffect(()=>{
  fetachFeeds()
},[])

  return !loading ?(
    <div className='h-full overflow-y-scroll np-scroller py-10 xl:pr-5 flex items-start justify-center xl:gap-8'>
      {/* Stories and Post List */}
      <div>
        <StoriesBar/>
         <div className='p-4 space-y-6'>
          {/* List of Post */}
          {feeds.map((post)=>(
            <PostCard key={post._id} post={post}/>
          ))}
         </div>
      </div>
      {/* Right Sidebar */}
      <div className='max-xl:hidden sticky top-0'>
<div className='max-w-xs bg-white text-xs p-4 rounded-md inline-flex flex-col gap-2 shadow'>
  <h3 className='text-slate-800 font-semibold'>Sponsored</h3>
  <img src={assets.sponsored_img} className='w-75 h-50 rounded-md' alt=''/>
  <p className='text-slate-600'>Email marketting</p>
  <p className='text-slate-400'>SuperCharge Your marketting with a powerful, easy-to-use platform built for results</p>
</div>

{/* Recent Messages */}
<RecentMessages/>
      </div>
      
    </div>
  ): <Loading/>
}

export default Feed