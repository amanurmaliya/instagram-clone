import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { setMessages } from "@/redux/chatSlice";

const useGetRTM = () => {
  const dispatch = useDispatch();
  const { socket } = useSelector((store) => store.socketio);
  const { selectedUser } = useSelector((store) => store.auth);

  const { messages } = useSelector((store) => store.chat);

  useEffect(() => {
    socket?.on("newMessage", (newMessage) => {
      dispatch(setMessages([...messages, newMessage]));
    });

    // inhe clean up  message bolte hain yani ki aagr koi chod ke challa hata hai toh usse message receive nahi hone chahiye
    return () => {
      socket?.off("newMessage");
    };
  }, [messages, setMessages]);
};

export default useGetRTM;
