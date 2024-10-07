import express from "express";
import {
  editProfile,
  followOrUnfollow,
  getSuggestedUser,
  login,
  logout,
  register,
  userProfile,
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

// Setting up of the router
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/:id/profile", isAuthenticated, userProfile);
router.post(
  "/profile/edit",
  isAuthenticated,
  upload.single("profilePicture"),
  editProfile
);
router.get("/suggested", isAuthenticated, getSuggestedUser);
router.post("/followorunfollow/:id", isAuthenticated, followOrUnfollow);

export default router;
