import { Inngest } from "inngest";
import User from "../models/User.js";
import sendEmail from "../configs/nodeMailer.js";
import Story from "../models/Story.js";
import Message from "../models/Message.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "clippy-app" });

//Inngest function to save user data to a database
const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-created",
    triggers: [{ event: "clerk/user.created" }],
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    let username = email_addresses[0].email_address.split("@")[0];

    const user = await User.findOne({ username });
    if (user) username += Math.floor(Math.random() * 10000);

    await User({
      _id: id,
      email: email_addresses[0].email_address,
      full_name: first_name + " " + last_name,
      profile_picture: image_url,
      username,
    }).save();
  }
);

//Inggest function to update user data in the database
const syncUserUpdation = inngest.createFunction(
  {
    id: "sync-user-updated",
    triggers: [{ event: "clerk/user.updated" }],
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    await User.findByIdAndUpdate(id, {
      email: email_addresses[0].email_address,
      full_name: first_name + " " + last_name,
      profile_picture: image_url,
    });
  }
);

//Innggest function to delete user data from the database
const syncUserDeletion = inngest.createFunction(
  {
    id: "sync-user-deleted",
    triggers: [{ event: "clerk/user.deleted" }],
  },
  async ({ event }) => {
    const { id } = event.data;
    await User.findByIdAndDelete(id);
  }
);

//Inngest function to send Reminder when a new connection request is added
const sendNewConnectionRequestReminder = inngest.createFunction(
  {
    id: "connection-request-reminder",
    triggers: [{ event: "app/connection-request" }],
  },
  async ({ event, step }) => {
    const { connectionId } = event.data;

    await step.run("send-mail", async () => {
      const connection = await Connection.findById(connectionId).populate(
        "from_user_id to_user_id"
      );

      const subject = "👋 New Connection Request";
      const body = `<div>Hi ${connection.to_user_id.full_name}</div>`;

      await sendEmail({
        to: connection.to_user_id.email,
        subject,
        body,
      });
    });
  }
);

//Inngest function to delete story after 24 hours
const deleteStory = inngest.createFunction(
  {
    id: "story-delete",
    triggers: [{ event: "app/story.delete" }],
  },
  async ({ event, step }) => {
    const { storyId } = event.data;

    await step.sleep("24h", 86400);

    await Story.findByIdAndDelete(storyId);
  }
);

const sendNotificationOfUnseenMessages = inngest.createFunction(
  {
    id: "unseen-message-cron",
    triggers: [{ cron: "TZ=Asia/Kolkata 0 9 * * *" }],
  },
  async ({ step }) => {
    const messages = await Message.find({ seen: false });

    const count = {};

    messages.forEach((m) => {
      const id = m.to_user_id;
      count[id] = (count[id] || 0) + 1;
    });

    for (const userId in count) {
      const user = await User.findById(userId);

      await sendEmail({
        to: user.email,
        subject: `💬 ${count[userId]} unseen messages`,
        body: `<div>You have messages</div>`,
      });
    }
  }
);

// Create an empty array where we'll export future Inngest functions
export const functions = [
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion,
    sendNewConnectionRequestReminder,
    sendNotificationOfUnseenMessages,
    deleteStory
];