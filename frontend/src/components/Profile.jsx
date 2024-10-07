import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import useGetUserProfile from "../hooks/useGetUserProfile";
import { useSelector } from "react-redux";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { AtSign, Heart, MessageCircle } from "lucide-react";

function Profile() {
  const params = useParams();
  const userId = params.id;
  const [activeTab, setActiveTab] = useState("posts");

  // Qki hum abhi sirf 2 hi functionality add kar rahe hain toh yaha hum ya toh post le lenge agr current me post hai nahi toh bookmark le lenge

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  useGetUserProfile(userId);
  const { userProfile, user } = useSelector((store) => store.auth);
  const isLoggedInUserProfile = user?._id === userProfile?._id;
  const isFollowing = false;

  const displayPost = activeTab === "posts" ? userProfile?.posts : null;
  // console.log(userProfile);
  return (
    <div className="flex justify-center mx-auto pl-10 max-w-5xl mt-4">
      <div className="flex flex-col p-8 gap-20">
        <div className="grid grid-cols-2">
          <section className="flex items-center justify-center">
            <Avatar>
              <AvatarImage
                className="w-32 h-32 rounded-full"
                src={userProfile?.profilePicture}
                alt="ProfilePhoto"
              ></AvatarImage>
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </section>
          <section>
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <span>{userProfile?.username}</span>
                {isLoggedInUserProfile ? (
                  <>
                    <Link to={"/account/edit"}>
                      <Button
                        className="hover:bg-gray-200 h-8"
                        varient="secondary"
                      >
                        Edit Profile
                      </Button>
                    </Link>
                    <Button
                      className="hover:bg-gray-200 h-8"
                      varient="secondary"
                    >
                      View Archives
                    </Button>
                    <Button
                      className="hover:bg-gray-200 h-8"
                      varient="secondary"
                    >
                      Ad Tools
                    </Button>
                  </>
                ) : isFollowing ? (
                  <>
                    <Button className=" h-8  hover:bg-[#f7483c]">
                      unFollow
                    </Button>
                    <Button className=" h-8  hover:bg-[#31b645]">
                      Message
                    </Button>
                  </>
                ) : (
                  <Button className=" h-8 bg-[#0095F6] hover:bg-[#137fc7]">
                    Follow
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-4">
                <p className="font-semibold">
                  {userProfile?.posts?.length} Posts
                </p>
                <p className="font-semibold">
                  {userProfile?.followers?.length} Followers
                </p>
                <p className="font-semibold">
                  {userProfile?.following?.length} Following
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-semibold">
                  {userProfile?.bio || "Bio Here..."}
                </span>
                <Badge className="w-fit" variant="secondary">
                  <p className="text-xl pr-1">@</p>
                  {userProfile?.username}
                </Badge>
                <span>🥳Learning to Code is Fun</span>
                <span>🤗Learning this project was very exciting</span>
                <span>🙈Practising is the best way to do anything</span>
              </div>
            </div>
          </section>
        </div>
        <div className="border-t border-t-gray-200">
          <div className="flex items-center justify-center gap-10 teext-sm">
            <span
              className={`py-3 cursor-pointer ${
                activeTab === "posts" ? "font-bold" : ""
              }`}
              onClick={() => handleTabChange("posts")}
            >
              POSTS
            </span>
            <span
              className={`py-3 cursor-pointer ${
                activeTab === "saved" ? "font-bold" : ""
              }`}
              onClick={() => handleTabChange("saved")}
            >
              SAVED
            </span>
            <span
              className={`py-3 cursor-pointer ${
                activeTab === "reels" ? "font-bold" : ""
              }`}
              onClick={() => handleTabChange("reels")}
            >
              REELS
            </span>
            <span
              className={`py-3 cursor-pointer ${
                activeTab === "tags" ? "font-bold" : ""
              }`}
              onClick={() => handleTabChange("tags")}
            >
              TAGS
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {displayPost?.map((post) => {
              return (
                <div
                  key={post?._id}
                  className="flex relative group cursor-pointer "
                >
                  <img
                    src={post.image}
                    alt="postImage"
                    className="rounded-sm w-full aspect-square object-cover "
                  />

                  <div className="absolute inset-0 flex items-center justify-center bg-black opacity-0  group-hover:opacity-100 transition-opacity duration-300">
                    <div className="items-center text-white flex space-x-0">
                      <Button className="flex items-center hover: text-gray-300 gap-2">
                        <Heart />
                        <span>{post.like.length}</span>
                      </Button>
                      <Button className="flex items-center hover: text-gray-300 gap-2">
                        <MessageCircle />
                        <span>{post.comments.length}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
