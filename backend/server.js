import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import {inngest,functions} from './inngest/index.js';
import { serve } from "inngest/express";
import { clerkMiddleware } from '@clerk/express'
import userRouter from './routes/userRoutes.js';
import postRouter from './routes/postRoutes.js';
import storyRouter from './routes/storyRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  },
  transports: ["websocket", "polling"]
});
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
  });

  socket.on("disconnect", () => {
    console.log("disconnected:", socket.id);
  });
});
app.set("io", io);


await connectDB();

app.use(express.json());
app.use(cors());
app.use(clerkMiddleware())

app.get('/',(req, res)=> res.send('Server is running'))
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use('/api/user', userRouter)
app.use('/api/post', postRouter)
app.use('/api/story', storyRouter)
app.use('/api/messages', messageRouter)

const PORT = process.env.PORT || 4000;

//app.listen(PORT, ()=>console.log(`Server is running on port ${PORT} ✅`))

server.listen(PORT, () => {
  console.log(`Server running on ${PORT} ✅`);
});