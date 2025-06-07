import { Avatar, AvatarFallback } from "@/components/ui/avatar.jsx";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import { MoreHorizontal } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Comment from "./Comment";
import axios from "axios";
import { toast } from "sonner";
import { setPosts } from "@/redux/postSlice";

function CommentDailog({ open, setOpen }) {
  const [text, setText] = useState("");
  const { selectedPost, posts } = useSelector((store) => store.post);
  const [comment, setComment] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedPost) {
      setComment(selectedPost.comments);
    }
  }, [selectedPost]);
  const changeEventHandler = (e) => {
    if (e.target.value.trim()) {
      setText(e.target.value);
    } else setText("");
  };

  const commentHandler = async () => {
    try {
      const res = await axios.post(
        `https://amanoer.onrender.com/api/v1/post/${selectedPost?._id}/comment`,
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
          p._id === selectedPost?._id
            ? { ...p, comments: updatedCommentData }
            : p
        );

        dispatch(setPosts(updatedPostData));
        toast(res.data.message);
        setText("");
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogOverlay className="fixed inset-0 bg-black/80" />
      <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-0 rounded-lg shadow-lg w-[90vw] max-w-5xl max-h-[80vh] overflow-y-auto">
        <div className="flex flex-1 md:flex-row p-0 max-w-5xl">
          <img
            src={selectedPost?.image}
            className="rounded-md object-cover md:w-1/2 w-[60vw] h-[60vh]"
          />
          <div className="w-1/2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="items-center gap-3 flex">
                  <Link>
                    <Avatar
                      className="w-7 h-7"
                      src={selectedPost?.author?.profilePicture}
                      alt="post image"
                    >
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <Link className="font-semibold text-xs">
                      {selectedPost?.author?.username}
                    </Link>
                    {/* <span className="text-gray-600 text-sm">Bio Here...</span> */}
                  </div>
                </div>

                <Dialog>
                  <DialogOverlay className="fixed inset-0 bg-black/80" />
                  <DialogTrigger asChild>
                    <MoreHorizontal className="cursor-pointer" />
                  </DialogTrigger>
                  <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-0 rounded-lg shadow-lg w-[40vw] max-w-5xl max-h-[80vh] overflow-y-auto items-center text-center">
                    <div>
                      <div className="m-2 cursor-pointer w-full text-[#ED4956] font-bold">
                        Unfollow
                      </div>
                      <div className="m-2 cursor-pointer w-full">
                        Add To Favorite
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {/* Horizontal line */}
              <hr className="my-2 border-gray-300" />
            </div>

            {/* Comment section positioned at the top-left */}
            <div className="flex flex-col justify-start items-start overflow-y-auto max-h-96 p-4 space-y-2">
              {comment?.map((comment) => (
                <Comment key={comment._id} comment={comment} />
              ))}
            </div>

            {/* Comment input */}
            <div className="p-4">
              <div className="items-center justify-between flex">
                <input
                  type="text"
                  placeholder="Add a comment.."
                  value={text}
                  onChange={changeEventHandler}
                  className="outline-none text-sm w-full border p-2"
                />
                {text && (
                  <span
                    className="text-[#3BADF8] cursor-pointer ml-2"
                    onClick={commentHandler}
                  >
                    Post
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CommentDailog;
