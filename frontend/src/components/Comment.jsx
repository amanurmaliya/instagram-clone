import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import React from "react";

function Comment({ comment }) {
  return (
    <div className="my-2">
      <div className="flex gap-3 items-center">
        <Avatar className="w-7 h-7">
          <AvatarImage src={comment?.author?.profilePicture}></AvatarImage>
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <h1 className="font-bold text-sm">
          {comment.author.username}{" "}
          <span className="font-normal pl-1">{comment.text}</span>
        </h1>
      </div>
    </div>
  );
}

export default Comment;
