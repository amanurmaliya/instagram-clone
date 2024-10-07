import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.jsx";
import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

function SuggestedUsers() {
  const { suggestedUsers } = useSelector((store) => store.auth);
  //   console.log(suggestedUsers);
  return (
    <div className="my-10">
      <div className="flex gap-3">
        <h1 className="font-bold text-gray-600"> Suggested For You</h1>
        <span className="font-medium cursor-pointer text-gray-400 hover:text-[#458ebf]">
          See All
        </span>
      </div>
      {suggestedUsers?.map((user) => {
        return (
          <div
            key={user._id}
            className="flex items-center justify-between mt-2"
          >
            <div className="flex gap-3 items-center">
              <Link to={`/profile/${user?._id}`} className="">
                <Avatar className="w-8 h-8">
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
              <span className="text-[#3BADF8] text-sm font-bold cursor-pointer hover:text-[#458ebf]">
                Follow
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SuggestedUsers;
