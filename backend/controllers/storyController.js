import fs from 'fs'
import imagekit from '../configs/imagekit.js';
import Story from '../models/Story.js';
import User from '../models/User.js';
import { inngest } from '../inngest/index.js';

//Add User Story
export const addUserStory = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { content, media_type, background_color } = req.body;
        const media = req.file
        let media_url = ''
        let fileId = '';

        //upload media to imagekit
        if (media_type === 'image' || media_type === 'video') {
            const fileBuffer = fs.readFileSync(media.path)
            const response = await imagekit.files.upload(
                {
                    file: fileBuffer.toString("base64"),
                    fileName: media.originalname,
                    folder: "/story_media",
                }
            )
            media_url = response.url
            fileId = response.fileId;
        }

        //create story
        const story = await Story.create({
            user: userId,
            content,
            media_url,
            media_type,
            background_color,
             fileId 
        })

        //Schedule story deletion after 24 hours
        await inngest.send({
            name: 'app/story.delete',
            data: { storyId: story._id }
        })
        res.json({ success: true })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

//Get User Stories
export const getStories = async (req, res) => {
    try {
        const { userId } = req.auth();
        const user = await User.findById(userId)

        //User connections and following
        const userIds = [userId, ...user.connections, ...user.following]
        const stories = await Story.find({
            user: { $in: userIds }
        }).populate('user').sort({ createdAt: -1 });
        res.json({ success: true, stories });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Delete Story
export const deleteStory = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { storyId } = req.params;

        const story = await Story.findById(storyId);

        if (!story) {
            return res.json({ success: false, message: "Story not found" });
        }

        if (story.user.toString() !== userId) {
            return res.json({ success: false, message: "Unauthorized" });
        }
        if (story.fileId) {
          await imagekit.files.delete(story.fileId);
        }
        await Story.findByIdAndDelete(storyId);

        res.json({ success: true, message: "Story deleted" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};