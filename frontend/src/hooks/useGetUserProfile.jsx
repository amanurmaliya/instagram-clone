import axios from "axios";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { setUserProfile } from "@/redux/authSlice";
const useGetUserProfile = (userId) => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(
          `https://instagramclone-5izy.onrender.com/api/v1/user/${userId}/profile`,
          {
            withCredentials: true,
          }
        );

        if (res.data.success) {
          // console.log(res.data);
          dispatch(setUserProfile(res.data.user));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchUserProfile();
  }, [userId]);
};

export default useGetUserProfile;
