import mongoose from "mongoose";

// Making the conversation schema
const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.ObjectId, ref: "User" }],

  messages: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Message",
    },
  ],
});

export const Conversation = mongoose.model("Conversation", conversationSchema);
