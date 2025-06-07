import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.jsx";
import { Dialog, DialogContent, DialogTrigger } from "@radix-ui/react-dialog";
import {
  Bookmark,
  BookMarkedIcon,
  MessageCircle,
  MoreHorizontal,
  Send,
} from "lucide-react";
import react, { useState } from "react";
import { Button } from "./ui/button.jsx";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDailog from "./CommentDailog.jsx";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import axios from "axios";
import { setPosts, setSelectedPost } from "@/redux/postSlice.js";
import { Badge } from "./ui/badge";

function Post({ post }) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  //Agar hamare likes array me user ki id hai toh user ne like kiya hai nahi toh nahi kiya hai
  const { posts } = useSelector((store) => store.post);
  const { user } = useSelector((store) => store.auth);
  const [liked, setLiked] = useState(post.like.includes(user?._id) || false);
  const [postLike, setPostLike] = useState(post.like.length);
  const [comment, setComment] = useState(post.comments);
  const dispatch = useDispatch();
  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else setText("");
  };

  const likeOrDisLikeHandler = async () => {
    try {
      const action = liked ? "dislike" : "like";
      // console.log("inside like");
      const res = await axios.get(
        `https://amanoer.onrender.com/api/v1/post/${post?._id}/${action}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        const updatedLikes = liked ? postLike - 1 : postLike + 1;

        setPostLike(updatedLikes);
        setLiked(!liked);

        // yaha pe apni state fix rakhna hai
        const updatedPostData = posts.map((p) =>
          p._id === post._id
            ? {
                ...p,
                like: liked
                  ? p.like.filter((id) => id !== user?._id)
                  : [...p.like, user._id],
              }
            : p
        );
        // console.log(updatedPostData);
        dispatch(setPosts(updatedPostData));
        // console.log(posts);
        // console.log(res.data.postUpdatedDataIncludingComment);
        toast.success(res.data.message);
      } else {
        console.log(res.data.success);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // this is the comment handler
  const commentHandler = async () => {
    try {
      const res = await axios.post(
        `https://amanoer.onrender.com/api/v1/post/${post?._id}/comment`,
        { text },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment];
        setComment(updatedCommentData);

        const updatedPostData = posts.map((p) =>
          p._id === post?._id ? { ...p, comments: updatedCommentData } : p
        );

        dispatch(setPosts(updatedPostData));
        toast(res.data.message);
        setText("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deletePostHander = async () => {
    try {
      const res = await axios.delete(
        `https://amanoer.onrender.com/api/v1/post/delete/${post?._id}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        const updatedPost = posts.filter(
          (postItem) => postItem._id !== post?._id
        );

        dispatch(setPosts(updatedPost));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      // toast(error);
    }
  };

  const bookmarkHandler = async () => {
    try {
      const res = await axios.get(
        `https://amanoer.onrender.com/api/v1/post/${post?._id}/bookmark`,
        {
          withCredentials: true,
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="my-8 w-full max-w-sm mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 ">
          <Avatar className="w-7 h-7 ">
            <AvatarImage src={post?.author?.profilePicture} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex gap-3">
            <h1>{post?.author?.username}</h1>
            {user?._id === post.author._id && <Badge>Author</Badge>}
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <MoreHorizontal className="cursor-pointer"></MoreHorizontal>
          </DialogTrigger>
          <DialogContent className="flex flex-col gap-1.5 items-center text-sm text-center ">
            {user?._id !== post?.author._id && (
              <Button className="text-red-500 w-full">Unfollow</Button>
            )}
            <Button className="text-green-500">Add To Favirote</Button>
            {user && user?._id === post?.author._id && (
              <Button onClick={deletePostHander} className="w-full">
                Delete
              </Button>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <img
        onDoubleClick={likeOrDisLikeHandler}
        className="rounded-sm aspect-square object-cover w-full my-2"
        src={post.image}
        alt="post photo"
      ></img>
      <div className="flex justify-between  ">
        <div className="flex gap-1">
          {liked ? (
            <FaHeart
              onClick={likeOrDisLikeHandler}
              size={"24px"}
              className="cursor-pointer hover:text-gray-500 text-red-600"
            />
          ) : (
            <FaRegHeart
              onClick={likeOrDisLikeHandler}
              size={"24px"}
              className="cursor-pointer hover:text-gray-500"
            />
          )}
          <MessageCircle
            onClick={() => {
              console.log(post);
              dispatch(setSelectedPost(post));
              setOpen(true);
            }}
            className="cursor-pointer hover:text-gray-600"
          />
          <Send className="cursor-pointer hover:text-gray-600" />
        </div>
        <div>
          <Bookmark
            onClick={bookmarkHandler}
            className="cursor-pointer hover:text-gray-500"
          />
        </div>
      </div>
      <span onClick={likeOrDisLikeHandler} className="block font-medium mb-2">
        {postLike} Likes
      </span>
      <p>
        <span className="font-medium mr-2">{post?.author?.username}</span>
        {post.caption}
      </p>
      {comment.length > 0 && (
        <span
          className="text-gray-600 cursor-pointer"
          onClick={() => {
            dispatch(setSelectedPost(post));
            setOpen(true);
          }}
        >
          view all {comment.length} Comments
        </span>
      )}
      <CommentDailog open={open} setOpen={setOpen} />
      <div className="items-center justify-between flex">
        <input
          type="text"
          placeholder="Add a comment.."
          value={text}
          onChange={changeEventHandler}
          className="outline-none text-sm w-full"
        />
        {text && (
          <span
            onClick={commentHandler}
            className="text-[#3BADF8] cursor-pointer"
          >
            Post
          </span>
        )}
      </div>
    </div>
  );
}

export default Post;
