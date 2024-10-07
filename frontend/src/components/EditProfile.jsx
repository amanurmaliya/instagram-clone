import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { setAuthUser } from "@/redux/authSlice";

function EditProfile() {
  const { user } = useSelector((store) => store.auth);
  const [loading, setLoading] = useState(false);
  const imageRef = useRef();
  const [input, setInput] = useState({
    profilePicture: user?.profilePicture,
    bio: user?.bio,
    gender: user?.gender,
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setInput({ ...input, profilePicture: file });
    }
  };

  const selectChangeHandler = (value) => {
    setInput({ ...input, gender: value });
  };
  const editProfileHandler = async () => {
    const formData = new FormData();

    formData.append("bio", input.bio);
    formData.append("gender", input.gender);

    // Agar Profile photo hoti hai toh hi chnage karna
    if (input.profilePicture) {
      formData.append("profilePicture", input.profilePicture);
    }
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:3000/api/v1/user/profile/edit",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        const updatedData = {
          ...user,
          bio: res.data.user?.bio,
          profilePicture: res.data.user?.profilePicture,
          gender: res.data.user?.gender,
        };

        dispatch(setAuthUser(updatedData));
        navigate(`/profile/${user?._id}`);
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(Error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex max-w-2xl pl-10 mx-auto">
      <section className="flex flex-col gap-6 w-full my-8">
        <h1 className="font-bold text-xl items-center justify-center text-center">
          Edit Profile
        </h1>
        <div className="flex gap-3 items-center justify-between  bg-gray-100 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <Avatar className="rounded-full h-8 w-8">
              <AvatarImage src={user?.profilePicture} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>

            <div>
              <h1 className="font-bold text-sm"></h1>
              <span className="text-gray-600 text-sm">
                {user?.bio || "Bio here..."}
              </span>
            </div>
            <input
              ref={imageRef}
              onChange={fileChangeHandler}
              type="file"
              className="hidden"
            />
          </div>
          <Button
            onClick={() => imageRef?.current.click()}
            className="bg-[#0095F6] hover:bg-[#2d80b7]"
          >
            Change Photo
          </Button>
        </div>
        <div>
          <h1 className="font-bold text-xl mb-2">Bio</h1>
          <Textarea
            name="bio"
            value={input.bio}
            onChange={(e) => setInput({ ...input, bio: e.target.value })}
            className="focus-visible:ring-transparent"
          />
        </div>
        <div>
          <h1 className="font-bold  mb-2">Gender</h1>
          <Select
            defaultValue={input.gender}
            onValueChange={(value) => selectChangeHandler(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end">
          {loading ? (
            <Button className="w-fit bg-[#0095F6] hover:bg-[#2d80b7]">
              <Loader2 className="mr-2 animate-spin h-4 w-4" />
              Please wait
            </Button>
          ) : (
            <Button
              onClick={editProfileHandler}
              className="w-fit bg-[#0095F6] hover:bg-[#2d80b7]"
            >
              Submit
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}

export default EditProfile;
