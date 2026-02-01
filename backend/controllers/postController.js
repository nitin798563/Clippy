import fs from 'fs';
import imagekit from '../configs/imagekit.js';
import Post from '../models/Post.js';
import User from '../models/User.js';

//Add Post
export const addPost = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { content, post_type } = req.body;
        const images = req.files

        //Limit number of posts per user to 2
        const MAX_POSTS = 2;
        const userPostCount = await Post.countDocuments({ user: userId });
        if (userPostCount >= MAX_POSTS) {
            return res.status(403).json({
                success: false,
                message: `You can only create up to ${MAX_POSTS} posts`
            });
        }

        let image_urls = []

        if (images.length) {
            image_urls = await Promise.all(
                images.map(async (image) => {
                    const fileBuffer = fs.readFileSync(image.path)
                    const response = await imagekit.files.upload({
                        file: fileBuffer.toString("base64"),
                        fileName: image.originalname,
                        folder: "posts",
                    })
                    const url = `${process.env.IMAGEKIT_URL_ENDPOINT}/${response.filePath}?tr=w-1280,f-webp,q-auto`;
                    return url
                })
            )
        }
        await Post.create({
            user: userId,
            content,
            image_urls,
            post_type
        })
        res.json({ success: true, message: "Post Created Successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Delete Post
export const deletePost = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { postId } = req.params

        const post = await Post.findOne({ _id: postId, user: userId })
        if (!post) {
            return res.json({ success: false, message: "Post not found or unauthorized" })
        }

        await Post.findByIdAndDelete(postId)
        res.json({ success: true, message: "Post deleted successfully" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Share Post
export const sharePost = async (req, res) => {
    try {
        const { postId } = req.body

        await Post.findByIdAndUpdate(postId, {
            $inc: { share_count: 1 }
        })

        res.json({ success: true })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


//Get posts
export const getFeedPosts = async (req, res) => {
    try {
        const { userId } = req.auth()
        const user = await User.findById(userId)

        //User connections and followings
        const userIds = [userId, ...user.connections, ...user.following]
        const posts = await Post.find({ user: { $in: userIds } }).populate('user').sort({ createdAt: -1 });
        res.json({ success: true, posts })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

//Like Post
export const likePost = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { postId } = req.body;

        const post = await Post.findById(postId)

        if (post.likes_count.includes(userId)) {
            post.likes_count = post.likes_count.filter(user => user !== userId)
            await post.save()
            res.json({ success: true, message: 'Post unliked' });
        } else {
            post.likes_count.push(userId)
            await post.save()
            res.json({ success: true, message: 'Post liked' });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Add Comment
export const addComment = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { postId, text } = req.body;

        if (!text?.trim()) {
            return res.json({ success: false, message: "Comment cannot be empty" });
        }

        const user = await User.findById(userId);
        if (!user) return res.json({ success: false, message: "User not found" });

        const comment = {
            user: {
                _id: user._id,
                full_name: user.full_name,
                profile_picture: user.profile_picture || ""
            },
            text,
            createdAt: new Date()
        };

        const post = await Post.findById(postId);
        if (!post) return res.json({ success: false, message: "Post not found" });

        post.comments.push(comment);
        await post.save();

        res.json({ success: true, comment });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};
