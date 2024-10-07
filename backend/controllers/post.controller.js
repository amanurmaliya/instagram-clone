// Ye image ka resolution kaam karne ke kaam me aata hai
import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import e from "express";
import { Comment } from "../models/comment.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const addNewPost = async (req, res) => {
  try {
    const { caption } = req.body;
    console.log(caption);
    const image = req.file;
    const authorId = req.id;

    // Agar user ne image di hi nahi post karne ke liye toh us condition me instagram me bina image ke post nahi hota hai
    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Image nahi mili hai post karne ke liye",
      });
    }

    // Yaha agar user bhut high image deta hai ya phir bhut badi image de deta hai toh uske liye hum sharp use karte hain

    // har ek image jab req.file se aayegi toh usme buffer hoga
    const optimizedImageBuffer = await sharp(image.buffer)
      .resize({
        width: 800,
        height: 800,
        fit: "inside",
      }) // Ye image ko is format me convert kar dega
      .toFormat("jpeg", { quality: 80 })
      // Jab sab ho jaye toh waps se buffer me convert kar do
      .toBuffer();

    // This to make the file uri to convert into base64
    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString(
      "base64"
    )}`;

    // if (!fileUri) console.log("clodinary se connect hi nahi huaa");
    // Cloudinary leke usme file upload kar do
    const cloudResponse = await cloudinary.uploader.upload(fileUri);

    const post = await Post.create({
      caption,
      image: cloudResponse.secure_url,
      author: authorId,
    });

    // post ke create hote hi new user ke post ke andar daal do
    const user = await User.findById(authorId);

    if (user) {
      user.posts.push(post._id);
      // ye save kara dega new post ko user ke andar
      await user.save();
    }
    // populate ek aisa method hota hai jiski help se hum agar kisi user ki id store hai toh uska hum pura ka pura data show kar skte hain
    // yaha iska mtlb ye hai ki author ko select karke lao aur password ko mat lana
    await post.populate({ path: "author", select: "-password" });

    return res.status(201).json({
      success: true,
      message: "Post sahi se ban gayi hai",
      data: post,
    });
  } catch (error) {
    console.log("Post nahi Banayi ja saki hai", error);
  }
};

// User ke feed me show karne ke liye
// Ab purii ki puri post ko lana hai
export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username profilePicture" })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: { path: "author", select: "username profilePicture" },
      });

    return res.status(200).json({
      success: true,
      posts,
      message: "sabhi post mil rahi hai",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Failed While getting all the profile",
      error: error,
    });
  }
};

// agar user ki profile me jana hai toh sirf user ki post dikhengi
export const getUserPost = async (req, res) => {
  try {
    const authorId = req.id;
    const posts = await Post.find({ author: authorId })
      .sort({ createdAt: -1 })
      .populate({
        path: "author",
        select: "username profilePicture",
      })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: { path: "author", select: "usernam profile" },
      });

    return res.status(200).json({
      success: true,
      data: posts,
      message: "Gone to user Profile",
    });
  } catch (error) {
    console.log(error);
  }
};

// Kisi bhi user ki post like karna hai
export const likePost = async (req, res) => {
  try {
    const likeKarneWaleUserKiId = req.id;

    // jab bhi koi isse like karega toh hum usse ref id ke saath bhej denge
    const postId = req.params.id;

    const post = await Post.findById(postId);
    // console.log(post);
    // console.log("Hi like");
    // Agar koi post nahi aayi hai toh
    if (!post) {
      return res.status(500).json({
        success: true,
        message: "User ki post like karne ke liye nahi mili hai",
      });
    }

    // Logic for like

    // addToSet user ki id sirf ek hi baar save karega like set aur humne kaha hai ki post ke like ke andar user ki id daal do
    await post.updateOne({
      $addToSet: { like: likeKarneWaleUserKiId },
    });
    await post.save();
    // console.log("Huaa", huaa);

    // Implement Socket IO for real time post notification
    const user = await User.findById(likeKarneWaleUserKiId).select(
      "username profilePicture"
    );

    // agar user khud ki id like karta hai toh woh notification nahi dikhani hai
    const postOwnerId = post.author.toString();

    // agar dono ki id alag hai tabhi notification show karna hai
    if (postOwnerId !== likeKarneWaleUserKiId) {
      const notification = {
        type: "like",
        userId: likeKarneWaleUserKiId,
        userDetails: user,
        postId,
        message: "Your Post has been liked",
      };

      const postOwnerSocketId = getReceiverSocketId(postOwnerId);

      io.to(postOwnerSocketId).emit("notification", notification);
    }
    return res.status(200).json({
      success: true,
      message: "post ko sahi se like kar diya hai ",
    });
  } catch (error) {
    console.log(error);
  }
};

// Agar dislike karna hai toh
export const disLikePost = async (req, res) => {
  try {
    const likeKarneWaleUserKiId = req.id;

    // jab bhi koi isse like karega toh hum usse ref id ke saath bhej denge
    const postId = req.params.id;

    const post = await Post.findById(postId);

    // Agar koi post nahi aayi hai toh
    if (!post) {
      return res.status(500).json({
        success: true,
        message: "User ki post like karne ke liye nahi mili hai",
      });
    }

    // Logic for dislike

    // yaha push ki jagah pull method ka use karenge jiska mtlb hai ki woh value ko array se waps nikal lega
    await post.updateOne({ $pull: { like: likeKarneWaleUserKiId } });
    await post.save();

    // implementation of the socket io for the notification
    const user = await User.findById(likeKarneWaleUserKiId).select(
      "username profilePicture"
    );

    // agar user khud ki id like karta hai toh woh notification nahi dikhani hai
    const postOwnerId = post.author.toString();

    // agar dono ki id alag hai tabhi notification show karna hai
    if (postOwnerId !== likeKarneWaleUserKiId) {
      const notification = {
        type: "dislike",
        userId: likeKarneWaleUserKiId,
        userDetails: user,
        postId,
        message: "Your Post has been liked",
      };

      const postOwnerSocketId = getReceiverSocketId(postOwnerId);

      io.to(postOwnerSocketId).emit("notification", notification);
    }

    return res.status(200).json({
      success: true,
      message: "post ko sahi se DISLIKE kar diya hai ",
    });
  } catch (error) {
    console.log(error);
  }
};

export const addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const commentKrneWaleUserKiId = req.id;

    const { text } = req.body;

    const post = await Post.findById(postId);

    // Agar user ne kuch text daala hi nahi hai toh
    if (!text) {
      return res.status(400).json({
        success: false,
        message:
          "Comment bhi kar do bhai bina comment ka text daale comment kar rahe ho",
      });
    }

    const comment = await Comment.create({
      text,
      author: commentKrneWaleUserKiId,
      post: postId,
    });

    await comment.populate({
      path: "author",
      select: "username profilePhoto",
    });

    // Hame post me bhi batana hai ki naye user ne comment kiya hai
    await post.comments.push(comment._id);
    await post.save();
    // console.log(comment);
    // console.log(post);

    return res.status(200).json({
      success: true,
      message: "comment kar diya gaya hai",
      comment,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getCommentOfPost = async (req, res) => {
  try {
    const postId = req.params.id;

    const comments = await Comment.find({ post: postId }).populate({
      path: "author",
      select: "username profilePicture",
    });

    if (!comments) {
      return res.status(500).json({
        success: false,
        message: "Koi bhi comments nahi hai",
      });
    }

    return res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.log(error);
  }
};

// Agar user ko post delete karna hai toh
export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;

    const authorId = req.id;

    const post = await Post.findById(postId);

    // Agar post nhi mili hai toh return kar do ki post hai hi nhi delete karne ke liye
    if (!post) {
      return res.status(400).json({
        success: false,
        message: "user ki post nahi mili hai delete karne ke liye",
      });
    }

    console.log(post.author.toString(), authorId);

    // check karo ki jo user delete kar raha haii ye post ussi ki hai ya kisi aur ki post ko delete karne ki koshish kar raha hai
    if (post.author.toString() !== authorId)
      return res.status(403).json({
        success: false,
        message: "Not Your post kindly delete only your post",
      });

    // Post ko dhudh ke delete kar do Delete the post ...
    await Post.findByIdAndDelete(postId);

    // Jab post se delete kar rahe ho toh user se bhi hata dena
    let user = await User.findById(authorId);

    user.posts.filter((id) => id.toString() !== postId);

    await user.save();

    // Ab jitne bhi comments hain is post ke sab ke sab kko delete kar do

    // Yaha delete many ka mtlb ye hai ki jitne bhi comments hai sab ke sab ko delete kar do is post ke
    await Comment.deleteMany({ post: postId });

    return res.status(200).json({
      success: true,
      message: "Post Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

export const bookmarkPost = async (req, res) => {
  try {
    // Post ki id hum wahi se bhejenge
    const postId = req.params.id;

    const authorId = req.id;

    const post = await Post.findById(postId);

    if (!post)
      return res.status(400).json({
        success: true,
        message: "The Post Cannot be found to Bookmark",
      });

    const user = await User.findById(authorId);

    // Agar user ki post pahlee se hi book marked hai toh usse unbookmark kar do
    if (user.bookmarks.includes(post._id)) {
      //  Remove from the book mark
      // jo post user ke bookmark ke andar pada huaa hai toh usse hata doo
      await user.updateOne({ $pull: { bookmarks: post._id } });
      await user.save();
      return res.status(200).json({
        success: true,
        message: "User Post is UnBookmarked Successfully!",
        type: "Unsaved",
      });
    } else {
      // Qki ye book mark nahi tha toh ab book mark kar do
      await user.updateOne({ $addToSet: { bookmarks: post._id } });
      await user.save();
      return res.status(200).json({
        success: true,
        message: "User Post is Bookmarked Successfully!",
        type: "Saved",
      });
    }
  } catch (error) {
    console.log("The post cannot be bookmarked due to: ", error);
  }
};
