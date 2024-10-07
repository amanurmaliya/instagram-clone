import react from "react";
import Post from "./Post.jsx";
import { useSelector } from "react-redux";

const Posts = () => {
  const { posts } = useSelector((store) => store.post);
  // console.log("Kya koi post aayi ", posts);
  return (
    <div>
      {posts?.map((post) => (
        <Post key={post._id} post={post} />
      ))}
    </div>
  );
};

export default Posts;
