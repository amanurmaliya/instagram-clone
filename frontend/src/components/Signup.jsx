import React, { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

function Signup() {
  // This is used to navigate to the login page when the user once sign up successfully
  const navigate = useNavigate();

  // Making the useState inorder to collect the data from the form
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
  });

  // Ye changes ko record karte hain ...input mtlb ye hai ki jo pahli values hain unhe lelo aur jo nayi value aayi hai usse bhi lelo
  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const signupHandler = async (e) => {
    e.preventDefault();
    console.log(input);

    try {
      // Yaha ye package database me data save karwane ke kaam me aata hai
      // pahle ye bataya hai ki api me jake data save karna haui aur phir kya data save karna hai
      const res = await axios.post(
        "https://instagramclone-5izy.onrender.com/api/v1/user/register",
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
        // Agar SuccessFul Registration ho jata hai toh redirect kar do login page me directly
        navigate("/login");

        // console me print kara lo sahi hai
        // Humne jo shadcn/ui se jo toaster install kiya hai usse dikha do
        toast.success(res.data.message);

        // ek baar jab data save ho jaye toh input field ko blank kar dena
        setInput({ username: "", email: "", password: "" });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const { user } = useSelector((store) => store.auth);
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
            SignUp to see photos and videos from your Friends
          </p>
        </div>
        <div className="flex flex-col">
          <label className="font-medium">Username</label>
          <input
            type="text"
            name="username"
            value={input.username}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent border m-2 border-gray-400"
          ></input>
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
        <button className="p-1 text-white bg-black rounded-sm" type="submit">
          Signup
        </button>
        <span className="text-center">
          Already Have Account?{" "}
          <Link to="/login" className="text-blue-600">
            Login
          </Link>
        </span>
      </form>
    </div>
  );
}

export default Signup;
