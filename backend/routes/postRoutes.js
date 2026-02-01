import express from 'express'
import { upload } from '../configs/multer.js';
import { protect } from '../middlewares/auth.js';
import { addComment, addPost, deletePost, getFeedPosts, likePost, sharePost } from '../controllers/postController.js';

const postRouter = express.Router();

postRouter.post('/add', upload.array('images',4),protect, addPost)
postRouter.delete('/:postId',protect, deletePost)
postRouter.post('/share', protect, sharePost)
postRouter.get('/feed', protect, getFeedPosts)
postRouter.post('/like', protect, likePost)
postRouter.post('/comment', protect, addComment);// Add comment

export default postRouter;
