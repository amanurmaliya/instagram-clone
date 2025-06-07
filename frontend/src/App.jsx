import { useEffect, useState } from "react";
import {
  createBrowserRouter,
  Routes,
  Route,
  BrowserRouter,
  RouterProvider,
} from "react-router-dom"; // Correct imports
// import Signup from './components/Signup';
import Signup from "./components/Signup.jsx";
import Login from "./components/Login.jsx";
import MainLayout from "./components/MainLayout.jsx";
import Home from "./components/Home.jsx";
import Profile from "./components/Profile.jsx";
import EditProfile from "./components/EditProfile.jsx";
import ChatPage from "./components/ChatPage.jsx";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { setSocket } from "./redux/socketSlice.js";
import { setOnlineUsers } from "./redux/chatSlice.js";
import { setLikeNotification } from "./redux/rtnSlice.js";
import ProtectedRoutes from "./components/ProtectedRoutes.jsx";

// Creating the Router
const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoutes>
        <MainLayout />
      </ProtectedRoutes>
    ),
    children: [
      // Yaha iske children ka mtlb ye hai ki iska parent same rahenga baki sab ke liye aur neeche wale same rahnege
      {
        path: "/",
        element: (
          <ProtectedRoutes>
            <Home />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/profile/:id",
        element: (
          <ProtectedRoutes>
            <Profile />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/account/edit",
        element: (
          <ProtectedRoutes>
            <EditProfile />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/chat",
        element: (
          <ProtectedRoutes>
            <ChatPage />
          </ProtectedRoutes>
        ),
      },
    ],
  },
  // Make the route For the Login Page
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
]);

function App() {
  const { user } = useSelector((store) => store.auth);
  const { socket } = useSelector((store) => store.socketio);
  const dispatch = useDispatch();
  useEffect(() => {
    if (user) {
      const socketio = io("https://amanoer.onrender.com", {
        query: {
          userId: user?._id,
        },
        transports: ["websocket"],
      });

      dispatch(setSocket(socketio));

      // sabhi events ko sun rahe hain
      // yha callback functions me online user ki jagah kuch bhi de skte ho
      socketio.on("getOnlineUsers", (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      // yaha pe ye har ek notification ko listeen karega taki jaise hi koi user like ya comment kare toh uska notification send kar de

      socketio.on("notification", (notification) => {
        dispatch(setLikeNotification(notification));
      });

      // ye wala function tab kaam karrega jab user directly page ko chod ke chala jayega yani ki bina logout kiye browser ko cut kar deta hai ya  phir tab close kar deta hai tab
      return () => {
        socketio.close();
        dispatch(setSocket(null));
      };
    } else if (socket) {
      socket?.close();
      dispatch(setSocket(null));
    }
  }, [user, dispatch]);

  return (
    <>
      {/* <h1>Radhe Radhe</h1> */}
      <RouterProvider router={browserRouter} />
    </>
  );
}

export default App;
