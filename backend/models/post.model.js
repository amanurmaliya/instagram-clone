import mongoose from "mongoose";

// Making the schema
const postSchema = new mongoose.Schema({
  caption: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  like: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  comments: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Comment",
    },
  ],
}, {
    timestamps: true, // ✅ Adds createdAt and updatedAt fields
  });

export const Post = mongoose.model("Post", postSchema);
