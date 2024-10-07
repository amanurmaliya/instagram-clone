// This is the file that is used to find the information of the user
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({});

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB se Connection Ho Gaya hai Pareshan na hona");
  } catch (error) {
    console.log("Cannot connect to the db : ", error);
  }
};

export default dbConnect;
