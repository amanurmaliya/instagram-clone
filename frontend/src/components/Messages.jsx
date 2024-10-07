import React from "react";
import { Avatar } from "./ui/avatar";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import useGetAllMessage from "@/hooks/useGetAllMessage";
import useGetRTM from "@/hooks/useGetRTM";

function Messages({ selectedUser }) {
  const { messages } = useSelector((store) => store.chat);
  const { user } = useSelector((store) => store.auth);
  useGetAllMessage();
  useGetRTM();
  return (
    <div className="overflow-y-auto flex-1 p-4">
      <div className="flex justify-center">
        <div className="flex flex-col items-center justify-center">
          <Avatar className="h-20 w-20 object-cover">
            <AvatarImage src={selectedUser?.profilePicture}></AvatarImage>
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <span>{selectedUser?.username}</span>
          <Link to={`/profile/${selectedUser?._id}`}>
            <Button className="h-8 my-2 hover:bg-slate-300" variant="secondary">
              View Profile
            </Button>
          </Link>
        </div>
      </div>
      {/* {console.log(messages)} */}
      <div className="flex flex-col gap-3">
        {messages?.map((message) => {
          return (
            <div
              className={`flex ${
                message?.senderId === user?._id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`p-2 rounded-lg max-w-sm break-words ${
                  message?.senderId === user?._id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-400 text-black"
                } `}
              >
                {message.message}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Messages;
