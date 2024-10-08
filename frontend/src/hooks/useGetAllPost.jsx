import { setPosts } from "@/redux/postSlice";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
const useGetAllPost = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchAllPost = async () => {
      try {
        const res = await axios.get(
          "https://instagramclone-5izy.onrender.com/api/v1/post/all",
          {
            withCredentials: true,
          }
        );

        if (res.data.success) {
          // console.log(res.data);
          dispatch(setPosts(res.data.posts));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllPost();
  }, []);
};

export default useGetAllPost;
