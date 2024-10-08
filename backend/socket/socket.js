import { Server } from "socket.io";
import express from "express";

import http from "http";

const app = express();
import dotenv from "dotenv";
dotenv.config({});
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.URL,
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {}; // this map stores the socket id to the corresponding user id: userId --> socketId

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
    // console.log(
    //   `user connetcted , User id = ${userId} & Socket Id = ${socket.id}`
    // );
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    if (userId) {
      // console.log(
      //   `user disconnected , User id = ${userId} & Socket Id = ${socket.id}`
      // );
      delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
