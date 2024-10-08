// import { Avatar, AvatarFallback, AvatarImage } from ;
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { setSelectedUser } from "@/redux/authSlice";
import Input from "postcss/lib/input";
import { Button } from "./ui/button";
import { MessageCircle, MessageCircleCode } from "lucide-react";
import Messages from "./Messages";
import { setMessages } from "@/redux/chatSlice";
import axios from "axios";
function ChatPage() {
  const [textMessage, setTextMessage] = useState("");
  const { user, suggestedUsers, selectedUser } = useSelector(
    (store) => store.auth
  );
  const { onlineUsers, messages } = useSelector((store) => store.chat);
  const dispatch = useDispatch();

  // console.log("message : ", messages);
  const sendMessageHandler = async (receiverId) => {
    try {
      const res = await axios.post(
        `https://instagramclone-5izy.onrender.com/api/v1/message/send/${receiverId}`,
        { textMessage },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      // console.log("ye success status hai", res.data.success);
      if (res.data.success) {
        dispatch(setMessages([...messages, res.data.newMessage]));
        setTextMessage("");
      }
    } catch (error) {
      console.log("ye error aayii hai", error);
    }
  };

  //  jaise hi kisi aur route pe redirect hon toh message box hat jaye toh iske liye clean up use kar lo
  useEffect(() => {
    return () => {
      dispatch(setSelectedUser(null));
    };
  }, []);
  return (
    <div className="flex ml-[16%] h-screen">
      <section className="w-full md:w-1/4 my-0">
        <h1 className="font-bold mb-4 px-3 text-xl">{user?.username}</h1>
        <hr className="mb-4 border-gray-400" />
        <div className="overflow-y-auto h-[80vh]">
          {suggestedUsers.map((suggestedUser) => {
            const isOnline = onlineUsers.includes(suggestedUser?._id);
            return (
              <div
                onClick={() => dispatch(setSelectedUser(suggestedUser))}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
              >
                <Avatar className="">
                  <AvatarImage
                    src={suggestedUser?.profilePicture}
                  ></AvatarImage>
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{suggestedUser?.username}</span>
                  <span
                    className={`text-sm font-bold ${
                      isOnline ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isOnline ? "online" : "offline"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      {selectedUser ? (
        <section className="flex-1 border-1 border-l-gray-300 flex flex-col h-full">
          <div className="flex items-center px-3 py-2 gap-3 border-b border-gray-300 sticky bg-white top-0 z-10 ">
            <Avatar>
              <AvatarImage
                src={selectedUser?.profilePicture}
                alt="Profile"
              ></AvatarImage>
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span>{selectedUser?.username} </span>
            </div>
          </div>
          <Messages selectedUser={selectedUser} />

          <div className="flex items-center p-4 border-t-gray-300 border-t">
            <input
              type="text"
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              className="flex-1 focus-visible:ring-transparent mr-2"
              placeholder="Messages..."
            ></input>
            <Button onClick={() => sendMessageHandler(selectedUser?._id)}>
              Send
            </Button>
          </div>
        </section>
      ) : (
        <div className="align-middle justify-center items-center flex flex-col mx-auto">
          <MessageCircleCode className="w-32 h-32 my-4" />
          <h1 className="font-medium text-xl">Your Messages</h1>
          <span>Send a message to start a chat</span>
        </div>
      )}
    </div>
  );
}

export default ChatPage;
