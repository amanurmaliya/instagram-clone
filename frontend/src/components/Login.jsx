import React, { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice.js";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
function Login() {
  // This is used to navigate to the home page when successfully gets login
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const [loading, setLoading] = useState(true);
  // Making the useState inorder to collect the data from the form
  const [input, setInput] = useState({
    email: "",
    password: "",
  });

  // Ye changes ko record karte hain ...input mtlb ye hai ki jo pahli values hain unhe lelo aur jo nayi value aayi hai usse bhi lelo
  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const signupHandler = async (e) => {
    e.preventDefault();
    // console.log(input);

    try {
      // jaise hi login me click kare waise hi loading wali button honi chahiye
      setLoading(true);
      // Yaha ye package database me data save karwane ke kaam me aata hai
      // pahle ye bataya hai ki api me jake data save karna haui aur phir kya data save karna hai
      const res = await axios.post(
        "https://amanoer.onrender.com/api/v1/user/login",
        input,
        {
          headers: {
            "Content-type": "application/json",
          },
          withCredentials: true,
        }
      );

      // Agar data save ho jata hai toh response show kar do
      if (res.data.success) {
        // Redux me user ssend kar do
        dispatch(setAuthUser(res.data.data));
        // Agar login ho jaye toh usse sidhe redirect kar lo home page me
        navigate("/");

        // console me print kara lo sahi hai
        // Humne jo shadcn/ui se jo toaster install kiya hai usse dikha do
        toast.success(res.data.message);

        // ek baar jab data save ho jaye toh input field ko blank kar dena
        setInput({
          email: "",
          password: "",
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      // Chahe login huaa ho ya fail ho gaya ho loading so band kar dena
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, []);
  return (
    <div className="flex items-center justify-center h-screen w-screen">
      <form
        onSubmit={signupHandler}
        className="shadow-lg flex flex-col gap-1 p-8"
      >
        <div>
          <h1 className="text-center text-xl font-bold ">LOGO</h1>
          <p className="text-sm text-center">
            Login to see photos and videos from your Friends
          </p>
        </div>

        <div className="flex flex-col">
          <label className="font-medium">Email</label>
          <input
            type="email"
            value={input.email}
            onChange={changeEventHandler}
            name="email"
            className="focus-visible:ring-transparent border m-2 border-gray-400"
          ></input>
        </div>
        <div className="flex flex-col">
          <label className="font-medium">Password</label>
          <input
            type="password"
            value={input.password}
            onChange={changeEventHandler}
            name="password"
            className="focus-visible:ring-transparent border m-2 border-gray-400"
          ></input>
        </div>
        {loading ? (
          <Button>
            <Loader2 className="mr-2 animate-spin h-4 w-4" />
            Please Wait
          </Button>
        ) : (
          <button className="p-1 text-white bg-black rounded-sm" type="submit">
            Login
          </button>
        )}
        <span className="text-center">
          Do Not Have Account?{" "}
          <Link to="/signup" className="text-blue-600">
            SignUp
          </Link>
        </span>
      </form>
    </div>
  );
}

export default Login;
