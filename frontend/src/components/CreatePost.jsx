import {
  Dialog,
  DialogContent,
  DialogOverlay,
} from "@/components/ui/dialog.jsx";
import React, { useRef, useState } from "react";
import { DialogHeader } from "./ui/dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.jsx";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { readFileAsDataURL } from "./lib/utils";
import { toast } from "sonner";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "@/redux/postSlice";

function CreatePost({ open, setOpen }) {
  const imageRef = useRef();
  const [file, setFile] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [caption, setCaption] = useState("");
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const { posts } = useSelector((store) => store.post);
  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setFile(file);

      const dataUrl = await readFileAsDataURL(file);
      setImagePreview(dataUrl);
    }
  };
  const createPostHandler = async (e) => {
    e.preventDefault();
    console.log(file, "\nthis is the caption :", caption);
    try {
      // qki file ko aise nhi bhej skte toh form ki trh leke bhej do
      const formData = new FormData();
      formData.append("caption", caption);

      if (imagePreview) formData.append("image", file);
      const post = await axios.post(
        "https://amanoer.onrender.com/api/v1/post/addpost",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (post.data.success) {
        dispatch(setPosts([post.data.data, ...posts]));
        toast.success(post.data.message);
        setOpen(false);
        // console.log(post.data.message);
      } else console.log(post.data.message, post.data.success);
    } catch (error) {
      toast.error(error.response.post.message);
    }
  };
  return (
    <div>
      <Dialog open={open}>
        <DialogOverlay />
        <DialogContent onInteractOutside={() => setOpen(false)}>
          <DialogHeader className="text-center items-center font-semibold">
            Create New Post
          </DialogHeader>
          <div onClick={createPostHandler} className="flex gap-3 items-center">
            <Avatar>
              <AvatarImage src={user?.profilePicture} alt="img"></AvatarImage>
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="">
              <h1 className="font-semibold text-xs">{user?.username}</h1>
              <span className="text-gray-600 text-sm">{user?.bio}</span>
            </div>
          </div>
          <Textarea
            value={caption}
            onChange={(e) => {
              setCaption(e.target.value);
            }}
            className="focus-visible:ring-transparent border-none "
            placeholder="Write a caption..."
          ></Textarea>
          {imagePreview && (
            <div className="w-full justify-center items-center h-64">
              <img
                src={imagePreview}
                alt="preview_img"
                className="w-full h-[110%] object-cover rounded-md"
              />
            </div>
          )}

          <input
            type="file"
            ref={imageRef}
            className="hidden"
            onChange={fileChangeHandler}
          />
          <Button
            onClick={() => imageRef.current.click()}
            className="w-fit mx-auto hover:bg-[#1f76b1]
          bg-[#0095F6]"
          >
            Select From Computer
          </Button>
          {imagePreview && (
            <Button
              type="submit"
              onClick={createPostHandler}
              className="w-fit mx-auto hover:bg-[#1f76b1]
          bg-[#0095F6]"
            >
              Post
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreatePost;
