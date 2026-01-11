import { Inngest } from "inngest";
import User from "../models/User.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "clippy-app" });

//Inngest function to save user data to a database
const syncUserCreation = inngest.createFunction(
    { _id: "sync-user-from-clerk" },
    { event: "clerk/user.created" },
    async ({ event }) => {
        const { id, first_name, last_name, email_address, image_url } = event.data;
        let username = email_addresses[0].email_address.split("@")[0];

        //check availability of username in the database
        const user = await User.findOne({ username });
        if (user) {
            username = username + Math.floor(Math.random() * 10000);
        }
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            full_name: first_name + " " + last_name,
            profile_picture: image_url,
            username,
        }
        await new User(userData).save();
    })

//Inggest function to update user data in the database
const syncUserUpdation = inngest.createFunction(
    { _id: "update-user-from-clerk" },
    { event: "clerk/user.updated" },
    async ({ event }) => {
        const { id, first_name, last_name, email_address, image_url } = event.data;
        
    const updatedUSerData = {
        email: email_addresses[0].email_address,
        full_name: first_name + " " + last_name,
        profile_picture: image_url,
    }
        await User.findByIdAndUpdate(id, updatedUSerData)
    })

    //Innggest function to delete user data from the database
    const syncUserDeletion = inngest.createFunction(
    { _id: "delete-user-from-clerk" },
    { event: "clerk/user.deleted" },
    async ({ event }) => {
        const { id} = event.data;
        await User.findByIdAndDelete(id)
    })

// Create an empty array where we'll export future Inngest functions
export const functions = [
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion
];