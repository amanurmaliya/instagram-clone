import {
  Heart,
  Home,
  icons,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  TrendingUp,
} from "lucide-react";
import React, { useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.jsx";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import store from "@/redux/store";
import { setAuthUser } from "@/redux/authSlice";
import CreatePost from "./CreatePost.jsx";
import { setPosts, setSelectedPost } from "@/redux/postSlice.js";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover.jsx";
// import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Button } from "./ui/button.jsx";

function LeftSidebar() {
  // this is used to redirect the pages to another pages
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const { likeNotification } = useSelector(
    (store) => store.realTimeNotification
  );

  const [open, setOpen] = useState(false);

  // Ek array bana lo elements ka aur usse use kar lo
  const sidebarItmes = [
    {
      icon: <Home />,
      text: "Home",
    },
    {
      icon: <Search />,
      text: "Search",
    },
    {
      icon: <TrendingUp />,
      text: "Explore",
    },
    {
      icon: <MessageCircle />,
      text: "Messages",
    },
    {
      icon: <Heart />,
      text: "Notifications",
    },
    {
      icon: <PlusSquare />,
      text: "Create",
    },
    {
      icon: (
        <Avatar className="w-7 h-7">
          <AvatarImage src={user?.author?.profilePicture} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
    {
      icon: <LogOut />,
      text: "Logout",
    },
  ];

  // Logout karne se logout ho jaye
  const LogoutHandler = async (req, res) => {
    try {
      const res = await axios.get("http://localhost:3000/api/v1/user/logout", {
        withCredentials: true,
      });

      // Agar process sahi hota hai toh mai seedhe jake logout kar dunga
      if (res.data.success) {
        // Directlly chale jana home page me
        dispatch(setAuthUser(null));
        dispatch(setSelectedPost([]));
        dispatch(setPosts([]));
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const SideBarHandler = (textType) => {
    if (textType === "Logout") {
      LogoutHandler();
    } else if (textType === "Create") {
      // createPostHandler();
      setOpen(true);
    } else if (textType === "Profile") {
      navigate(`/profile/${user?._id}`);
    } else if (textType === "Home") {
      navigate("/");
    } else if (textType === "Messages") {
      navigate("/chat");
    }
  };
  return (
    <div>
      <div className="fixed top-0 left-0 p-4 border-r w-[16%] h-screen">
        <h1 className="my-8 pl-3 font-bold text-xl">LOGO</h1>
        {sidebarItmes.map((item, index) => {
          return (
            <div
              onClick={() => SideBarHandler(item.text)}
              key={index}
              className="flex p-2 pl-0 m-2 ml-0 relative hover:bg-gray-200 cursor-pointer rounded-lg "
            >
              {item.icon}
              <span className="pl-2">{item.text}</span>
              {item.text === "Notifications" && likeNotification.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <div>
                      <Button
                        size="icon"
                        className="rounded-full h-5 bg-red-500 hover:bg-red-600 w-5 absolute bottom-6 left-6"
                      >
                        {likeNotification.length}
                      </Button>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div>
                      {likeNotification.length === 0 ? (
                        <p>No New Notification</p>
                      ) : (
                        likeNotification.map((notificaton) => {
                          return (
                            <div
                              key={notificaton.userId}
                              className="flex items-center gap-2 my-1"
                            >
                              <Avatar>
                                <AvatarImage
                                  src={notificaton.userDetails?.profilePicture}
                                ></AvatarImage>
                                <AvatarFallback>CN</AvatarFallback>
                              </Avatar>
                              <p className="text-sm">
                                <span className="font-bold">
                                  {notificaton.userDetails?.username}
                                </span>{" "}
                                Liked Your Post{" "}
                              </p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          );
        })}
      </div>
      <CreatePost open={open} setOpen={setOpen} />
    </div>
  );
}

export default LeftSidebar;
