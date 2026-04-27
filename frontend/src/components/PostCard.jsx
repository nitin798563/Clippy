import { BadgeCheck, Heart, MessageCircle, MoreVertical, Pencil, Share2, Trash2 } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import moment from 'moment'
import { dummyUserData } from '../assets/assets.js'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAuth } from '@clerk/clerk-react'
import api from '../axios.js'
import toast from 'react-hot-toast'

const PostCard = ({ post }) => {

    const postWithHashtags = post.content.replace(/(#\w+)/g, '<span class="text-indigo-600">$1</span>')
    const [likes, setLikes] = useState(post.likes_count)
    const [showMenu, setShowMenu] = useState(false)
    const [showShare, setShowShare] = useState(false)
    const shareRef = useRef(null)
    const menuRef = useRef(null)
    const commentsRef = useRef(null);
    const commentMenuRef = useRef(null)
    const [shareCount, setShareCount] = useState(post.share_count || 0)
    const [comments, setComments] = useState(post.comments || [])
    const [commentText, setCommentText] = useState("")
    const [showComments, setShowComments] = useState(false)
    const currentUser = useSelector((state) => state.user.value)
    const { getToken } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [editedContent, setEditedContent] = useState(post.content)
    const [editingCommentId, setEditingCommentId] = useState(null)
    const [editCommentText, setEditCommentText] = useState("")
    const [openCommentMenuId, setOpenCommentMenuId] = useState(null)

    const handleLike = async () => {
        try {
            const { data } = await api.post('api/post/like', { postId: post._id },
                { headers: { Authorization: `Bearer ${await getToken()}` } }
            )
            if (data.success) {
                toast.success(data.message)
                setLikes(prev => {
                    if (prev.includes(currentUser._id)) {
                        return prev.filter(id => id !== currentUser._id)
                    } else {
                        return [...prev, currentUser._id]
                    }
                })
            } else {
                toast(data.message)

            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleAddComment = async () => {
        if (!commentText.trim()) return
        try {
            const { data } = await api.post(
                'api/post/comment',
                { postId: post._id, text: commentText },
                { headers: { Authorization: `Bearer ${await getToken()}` } }
            )
            if (data.success) {
                setComments(prev => [...prev, data.comment])
                setCommentText("")
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleDelete = async () => {
        try {
            const { data } = await api.delete(`api/post/${post._id}`, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })

            if (data.success) {
                toast.success(data.message)
                window.location.reload() // simple & effective
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleUpdate = async () => {
        try {
            const { data } = await api.put(
                'api/post/update',
                {
                    postId: post._id,
                    content: editedContent,
                    post_type: post.post_type
                },
                { headers: { Authorization: `Bearer ${await getToken()}` } }
            )

            if (data.success) {
                toast.success(data.message)
                setIsEditing(false)
                window.location.reload()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleUpdateComment = async (commentId) => {
        try {
            const { data } = await api.put(
                'api/post/comment',
                {
                    postId: post._id,
                    commentId,
                    text: editCommentText
                },
                { headers: { Authorization: `Bearer ${await getToken()}` } }
            )
            if (data.success) {
                setComments(prev =>
                    prev.map(c => c._id === commentId ? { ...c, text: editCommentText } : c)
                )
                setEditingCommentId(null)
                setEditCommentText("")
                toast.success("Comment updated")
            } else {
                toast.error(data.message)
            }
        } catch (err) {
            toast.error(err.message)
        }
    }

    const handleDeleteComment = async (commentId) => {
        try {
            const { data } = await api.delete(
                'api/post/comment',
                {
                    data: { postId: post._id, commentId },
                    headers: { Authorization: `Bearer ${await getToken()}` }
                }
            )

            if (data.success) {
                setComments(prev => prev.filter(c => c._id !== commentId))
                toast.success("Comment deleted")
            } else {
                toast.error(data.message)
            }
        } catch (err) {
            toast.error(err.message)
        }
    }

    useEffect(() => {
        const handleClickOutside = (e) => {
            // 3-dot menu close
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false)
            }
            // Share menu close
            if (shareRef.current && !shareRef.current.contains(e.target)) {
                setShowShare(false)
            }
            // Comments box close
            if (commentsRef.current && !commentsRef.current.contains(e.target)) {
                setShowComments(false)
            }
            //setOpenCommentMenuId(null)
            if (commentMenuRef.current && !commentMenuRef.current.contains(e.target)) {
                setOpenCommentMenuId(null)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const postUrl = `${window.location.origin}/post/${post._id}`

    const handleShareSuccess = async () => {
        await api.post(
            'api/post/share',
            { postId: post._id },
            { headers: { Authorization: `Bearer ${await getToken()}` } }
        )

        setShareCount(prev => prev + 1)
    }
    const handleNativeShare = async () => {
        if (navigator.share) {
            await navigator.share({
                title: 'Check this post',
                text: post.content,
                url: postUrl
            })
            handleShareSuccess()
        } else {
            handleCopyLink()
        }
    }

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(postUrl)
        toast.success('Link copied')
        handleShareSuccess()
    }

    const navigate = useNavigate()

    return (
        <div className='bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl'>

            <div className='flex items-start justify-between'>
                {/* User Info */}
                <div onClick={() => navigate('/profile/' + post.user._id)} className='inline-flex items-center gap-3 cursor-pointer'>
                    <img src={post.user.profile_picture} alt='' className='w-10 h-10 rounded-full shadow' />
                    <div>
                        <div className='flex items-center space-x-1'>
                            <span>{post.user.full_name}</span>
                            <BadgeCheck className='w-4 h-4 text-blue-500' />
                        </div>
                        <div className='text-gray-500 text-sm'>
                            @{post.user.username} . {moment(post.createdAt).fromNow()}
                        </div>
                    </div>
                </div>
                {/* 3 dot menu */}
                {currentUser._id === post.user._id && (
                    <div className='relative' ref={menuRef}>
                        <MoreVertical
                            className='w-5 h-5 cursor-pointer'
                            onClick={() => setShowMenu(!showMenu)}
                        />

                        {showMenu && (
                            <div className='absolute right-0 mt-2 bg-white border rounded shadow w-32 z-10'>
                                <button
                                    onClick={() => {
                                        setIsEditing(true)
                                        setShowMenu(false)
                                    }}
                                    className='flex items-center gap-2 px-3 py-2 text-blue-500 hover:bg-blue-50 w-full text-sm'
                                >
                                    <Pencil className='w-4 h-4' />
                                    Edit
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className='flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 w-full text-sm'
                                >
                                    <Trash2 className='w-4 h-4' />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* Content */}
            {isEditing ? (
                <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className='w-full border p-2 rounded text-sm'
                    rows={4}
                />
            ) : (
                post.content && (
                    <div
                        className='text-gray-800 text-sm whitespace-pre-line'
                        dangerouslySetInnerHTML={{ __html: postWithHashtags }}
                    />
                )
            )}
            {/* Images */}
            <div className='grid grid-cols-2 gap-2'>
                {post.image_urls.map((img, index) => (
                    <img src={img} key={index} className={`w-full h-48 object-cover rounded-lg ${post.image_urls.length === 1 && "col-span-2 h-auto"}`} alt='' />
                ))}
            </div>

            {/* Actions */}
            <div className='flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-300'>
                <div className='flex items-center gap-1'>
                    <Heart className={`w-4 h-4 cursor-pointer ${likes.includes(currentUser._id) && "text-red-500 fill-red-500"}`} onClick={handleLike} />
                    <span>{likes.length}</span>
                </div>
                <div className='flex items-center gap-1'>
                    <MessageCircle
                        className='w-4 h-4 cursor-pointer'
                        onClick={() => setShowComments(!showComments)}
                    />
                    <span>{comments.length}</span>
                </div>
                <div className='flex items-center gap-1 relative' ref={shareRef}>
                    <Share2
                        className='w-4 h-4 cursor-pointer'
                        onClick={() => setShowShare(!showShare)}
                    />
                    <span>{shareCount}</span>

                    {showShare && (
                        <div className='absolute bottom-6 right-0 bg-white border rounded shadow w-40 z-10'>
                            <button
                                onClick={handleNativeShare}
                                className='px-3 py-2 text-sm hover:bg-gray-100 w-full text-left'
                            >
                                Share
                            </button>
                            <button
                                onClick={handleCopyLink}
                                className='px-3 py-2 text-sm hover:bg-gray-100 w-full text-left'
                            >
                                Copy link
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showComments && (
                <div className='mt-2 space-y-2' ref={commentsRef}>
                    {/* Existing Comments */}
                    <div className='space-y-3'>
                        {comments.map((c) => (
                            <div key={c._id} className='flex gap-2 items-start group'>

                                <img
                                    src={c.user.profile_picture}
                                    className='w-8 h-8 rounded-full'
                                />

                                <div className='flex-1 bg-gray-50 px-3 py-2 rounded-lg relative'>

                                    {/* Name + text / edit */}
                                    <div className='text-sm'>
                                        <span className='font-semibold'>{c.user.full_name}</span>

                                        {editingCommentId === c._id ? (
                                            <div className='mt-2'>
                                                <input
                                                    value={editCommentText}
                                                    onChange={(e) => setEditCommentText(e.target.value)}
                                                    className='w-full border px-2 py-1 text-sm rounded'
                                                />

                                                <div className='flex gap-2 mt-2'>
                                                    <button
                                                        onClick={() => handleUpdateComment(c._id)}
                                                        className='text-green-600 text-xs font-medium'
                                                    >
                                                        Save
                                                    </button>

                                                    <button
                                                        onClick={() => setEditingCommentId(null)}
                                                        className='text-gray-500 text-xs'
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className='text-gray-700'>{c.text}</p>
                                        )}
                                    </div>

                                    {/* time */}
                                    <div className='text-xs text-gray-400 mt-1'>
                                        {moment(c.createdAt).fromNow()}
                                    </div>

                                    {/* actions */}
                                    {c.user._id === currentUser._id && editingCommentId !== c._id && (
                                        <div className='absolute right-2 top-2 text-xs'>

                                            {/* 3-dot button */}
                                            <button
                                                onClick={() =>
                                                    setOpenCommentMenuId(
                                                        openCommentMenuId === c._id ? null : c._id
                                                    )
                                                }
                                                className='text-gray-900 text-xl font-bold px-2 py-1 rounded-full hover:bg-gray-200 active:scale-95 transition'
                                            >
                                                ⋮
                                            </button>

                                            {/* dropdown */}
                                            {openCommentMenuId === c._id && (
                                                <div ref={commentMenuRef} className='absolute right-0 mt-1 bg-white border rounded shadow flex flex-col text-xs'>

                                                    <button
                                                        onClick={() => {
                                                            setEditingCommentId(c._id)
                                                            setEditCommentText(c.text)
                                                            setOpenCommentMenuId(null)
                                                        }}
                                                        className='px- text-blue-500 hover:bg-blue-50'
                                                    >
                                                        Edit
                                                    </button>
                                                    <hr></hr>
                                                    <button
                                                        onClick={() => handleDeleteComment(c._id)}
                                                        className='px-3 text-red-500 hover:bg-red-50'
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                </div>
                            </div>
                        ))}
                    </div>

                    {/* New Comment Input */}
                    {editingCommentId === null && (
                        <>
                            <textarea
                                placeholder='Add a comment...'
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                className='w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400'
                                rows={2}
                            />

                            <div className='flex justify-end mt-1'>
                                <button
                                    onClick={handleAddComment}
                                    className='bg-indigo-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-indigo-600 transition'
                                >
                                    Post
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
            {isEditing && (
                <div className='flex justify-end gap-2 mt-2'>
                    <button
                        onClick={() => setIsEditing(false)}
                        className='px-3 py-1 text-sm border rounded'
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleUpdate}
                        className='bg-green-500 text-white px-3 py-1 rounded text-sm'
                    >
                        Save
                    </button>
                </div>
            )}
        </div>
    )
}

export default PostCard