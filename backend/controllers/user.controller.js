import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

import { Post } from "../models/post.model.js";
dotenv.config({});

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Agar Sufficient Data nahi aaya hai toh bata do ki sufficient data nahi hai
    if (!username || !email || !password) {
      return res.status(404).json({
        success: false,
        message:
          "Insufficient Data ! Couldnot find Username || Email || Password ",
      });
    }

    // Yaha Check kar lo ki kahin user pahle se hi toh register nahi hai aur agar hai toh mat register karna
    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(404).json({
        success: false,
        message: "Email Phale se registered hai toh nayi email leke aao",
      });
    }

    // Agar user pahle se created nahi hai toh password hash karke save kara denge
    const hashPassword = await bcrypt.hash(password, 10);

    await User.create({
      username, // yaha hum username : username kar skte the lekin jinka naam same hota hai unhe aise bhi save kara skte hain koi problem nahi hai
      email,
      password: hashPassword,
    });

    // Jab data save ho jaye toh isse db me save kara lena hai
    return res.status(200).json({
      success: true,
      message: "Account Ban Gaya Hai 🥳🥳Welcome to The INSTAGRAM ",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Register DB se Connection nahi ho paya",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Agar email aur password me se kuch bhi nahi aaya hai toh return kar do
    if (!email || !password) {
      res.status(404).json({
        success: false,
        message: "Please enter Both the Email and the Password!!!",
      });
    }

    const user = await User.findOne({ email: email });

    // Agar user nahi hai  toh return karke bata do ki ap registered user nahi ho
    if (!user) {
      return res.status(500).json({
        success: false,
        message: "Enter Email is Wrong... Please enter the correct one",
      });
    }

    // Apne Database se check karo ki password sahi hai ki nahi hai
    const isPassword = await bcrypt.compare(password, user.password);

    // Agar Password Sahi nahi hai toh bata do ki correct password dale
    if (!isPassword) {
      res.status(404).json({
        success: false,
        message: "The Password You Have Entered is Wrong",
      });
    }

    // Agar password sahi hai toh shanti se uska token bana lo ya phir cookie bana ke store karke rakh lo
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });
    // Yaha jo secret key hai ye kuch bhi ho skti hai gf ka naam ya kutte ka ya kuch bhi
    // ye token 1 D me expire ho jayega

    /// Hum chahte hain ki jitni bhi post ho sab ke sab ko hum show kar den toh hum populate karenenge

    // Yaha mai Promise.all() isliue kar raha hu qki map  hai toh har ek value ke liye iterate karunga toh har baar await na laga ke ek saath laga deta hu
    const populatedPost = await Promise.all(
      // user.post ke array hai
      user.posts.map(async (postId) => {
        const post = await Post.findById(postId).populate("comments");

        // Agar user ki khud ki post mili hai toh return karo else rehne do
        if (post?.author.equals(user._id)) {
          return post;
        } else return null;
      })
    );

    // console.log(populatedPost);

    // Hume user ka data front end me bhi show karna hai toh isliye user ka data store kar lenge
    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      posts: populatedPost,
    };

    // Yaha hum cookie me staore kara rahen hain aur ye dhyan de rahen hain ki koi hamari cookie na chura le
    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 100,
      })
      .json({
        success: true,
        message: `Welcome back ${userData.username}.. You are Logged In`,
        data: userData,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Koi toh issue hai login karne me",
      data: error.message,
    });
  }
};

export const logout = async (_, res) => {
  try {
    // agar logout kar rahe hain toh cookie ko disselect kar denge aur uski age bhi gayab kar denge
    return res.cookie("token", "", { maxAge: 0 }).json({
      success: true,
      message: "Logout has been successful!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Logout has been Failed , Karan neeche hai ...",
      data: error.message,
    });
  }
};

export const userProfile = async (req, res) => {
  try {
    // User id ke hisaab se profile khulegi toh sabse pahle id nikal lo
    const userId = req.params.id;
    let user = await User.findById(userId)
      .select("-password")
      .populate({ path: "posts",
        options : { sort: { createdAt: -1}} })
      .populate("bookmarks");

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong jisse hum profile nahi la paye hain",
      data: error.message,
    });
  }
};

export const editProfile = async (req, res) => {
  try {
    // Humne isAuthenticated naam ka middle ware set kar liya hai isse pahle aane se pahle waha se check karte aana
    const userId = req.id;

    // user apna bio aur gender change kar skta hai
    const { bio, gender } = req.body;
    const profilePicture = req.file;
    let cloudResponse;
    // console.log("Profile Picture:", profilePicture);
    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);

      cloudResponse = await cloudinary.uploader.upload(fileUri);
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.send(404).json({
        success: false,
        message: "User nahi mila hai...",
      });
    }

    // agar user mil gaya hai toh update kar do
    if (bio) {
      user.bio = bio;
    }

    if (gender) {
      user.gender = gender;
    }

    if (profilePicture) {
      user.profilePicture = cloudResponse.secure_url;
    }
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Proile Upload Ho gayi hai Take a Chill Pill",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Failed While Editing the profile",
      error: error,
    });
  }
};

export const getSuggestedUser = async (req, res) => {
  try {
    // -password is used to remove password when it want to show
    const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select(
      "-password"
    );

    if (!suggestedUsers) {
      return res.status(500).json({
        success: true,
        message: "User hi nahi hai..",
      });
    }

    return res.status(200).json({
      success: true,
      users: suggestedUsers,
      message: "Suggested user found...",
    });
  } catch (error) {
    console.log(error);
  }
};

export const followOrUnfollow = async (req, res) => {
  try {
    const followKarneWala = req.id; // This is the logged in user who  is going to follow
    const jiskoFollowKarnaHai = req.params.id; //

    if (followKarneWala == jiskoFollowKarnaHai) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow Or Unfollow Yourself",
      });
    }

    // Khus ka data database se utha lao
    const user = await User.findById(followKarneWala);
    // Jise follow karna hai uska data database se utha lao'
    const targetUser = await User.findById(jiskoFollowKarnaHai);

    // Agar dono me se kisi ek ka data bhi nahi mila hai toh
    if (!user || !targetUser) {
      return res.status(400).json({
        success: false,
        messgae:
          "Ya toh user nahi mila ya toh jise follow karna hai woh nahi mila",
      });
    }

    // Ye check kar na hai ki pahle se toh follow nahi kar raha hai  toh follow karna hai ya unfollow karna hai
    // Kya mai us insaan ko follow kar raha hu
    const isFollowing = user.following.includes(jiskoFollowKarnaHai);

    // Agar ye true hai yani mai usse pahlle se follow kar raha hu toh usse ab unfollow karna hai
    if (isFollowing) {
      // Unfollow

      await Promise.all([
        //Ek kaamkaro jise unfollow karna hai usse khud se hata do
        User.updateOne(
          { _id: followKarneWala },
          { $pull: { following: jiskoFollowKarnaHai } }
        ),
        // Aur uske follow kar rahe the uske followers se khud ko hata do
        User.updateOne(
          { _id: jiskoFollowKarnaHai },
          { $pull: { followers: followKarneWala } }
        ),
      ]);
      return res
        .status(200)
        .json({ success: true, messgae: "Unfollowed SuccessFully!" });
    } else {
      // Follow kar lo
      await Promise.all([
        // Ek kaam karo ki jise follow karna hai usse dhudh ke lao aur uski following pe jise follow kiya hai usse daal do
        User.updateOne(
          { _id: followKarneWala },
          { $push: { following: jiskoFollowKarnaHai } }
        ),

        // Ek kaam karo jisse follow kiya hai usse dhudh ke lao aur uska 1 follower increase kar do qki maine abhi abhi usse follow kiya hai
        User.updateOne(
          { _id: jiskoFollowKarnaHai },
          { $push: { followers: followKarneWala } }
        ),
      ]);

      return res
        .status(200)
        .json({ success: true, message: "Followed SuccessFully!" });
    }
  } catch (error) {}
};
