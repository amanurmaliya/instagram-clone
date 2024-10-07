import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.jsx";
import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import SuggestedUsers from "./SuggestedUsers";

function RightSideBar() {
  const { user } = useSelector((store) => store.auth);

  return (
    <div className="w-fit my-10 pr-32">
      <div className="flex gap-3 items-center">
        <Link to={`/profile/${user?._id}`} className="">
          <Avatar className="rounded-full h-8 w-8">
            <AvatarImage src={user?.profilePicture} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <h1 className="font-semibold text-sm">
            <Link to={`/profile/${user?._id}`} className="">
              {user?.username || "Name Here"}
            </Link>
          </h1>
          <span className="text-gray-600 text-sm">
            {user?.bio || "Bio here..."}
          </span>
        </div>
      </div>
      <SuggestedUsers />
    </div>
  );
}

export default RightSideBar;