import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const isAuthenticated = async (req, res, next) => {
  try {
    // Getting the tokens  Agar token hai toh user registered hai nahi toh register nahi hai
    const token = req.cookies.token;

    // Agar token nahi toh humne registration nahi kiya hai
    if (!token) {
      res.status(401).json({
        success: false,
        message: "User Not Logged in For changing the profile",
      });
    }

    // Agar hame token mil bhi gaya hai toh bhi hum usse verify karenge
    const decode = jwt.verify(token, process.env.SECRET_KEY);

    // Agar hame verification nahi mila toh
    if (!decode) {
      res.status(401).json({
        success: false,
        message: "User Not Logged in For changing the profile",
      });
    }

    // Agar verification time se  mil jata hai toh req ki id me user id daal do
    req.id = decode.userId;

    // Aur seedhe next Route pass kar do
    next();

    // Agar verify nahi  pata hai toh
  } catch (error) {
    console.log(error);
  }
};

export default isAuthenticated;
