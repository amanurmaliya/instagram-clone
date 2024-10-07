// Radhe Krishna
import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import dbConnect from "./utils/database.js";
import path from "path";
dotenv.config({});
// Initializing the getting the io soocket wala app
import { app, server } from "./socket/socket.js";

// Taking all the user routes into our main file
import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";
import messageRouter from "./routes/message.route.js";

const __dirname = path.resolve();

// Middle Wares
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));

const PORT = process.env.PORT || 4000;

// Making the apis

// Yaha userRouter ke liyeitne routes to by default mark kar do uske baad hoga jo hoga
app.use("/api/v1/user", userRouter);

// Yaha jab user post ke liye karega toh uske liye route mount kar do
app.use("/api/v1/post", postRouter);

// Yha jab user message dekheha toh uske liye user mount kar do
app.use("/api/v1/message", messageRouter);

app.use(express.static(path.join(__dirname, "/frontend/dist")));

// jitni bhi ye upar wali routes hain inhe chod ke agar ap koi bhi route use karte ho toh direct frontend me chali jayengi
app.use("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
});

// Making the server Run in the port 3000
server.listen(PORT, () => {
  dbConnect();
  console.log(`Server Suru Ho Chuka Hai Port : ${PORT} Me`);

  // Listen karte hi hum usse db se connect kar denge
});

// Making the Routes
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "This data is coming from backend",
  });
});
