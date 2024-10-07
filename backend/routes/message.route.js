import experss from "express";

import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import { getMessage, sendMessage } from "../controllers/message.controller.js";

const router = experss.Router();

router.route("/send/:id").post(isAuthenticated, sendMessage);
router.route("/all/:id").get(isAuthenticated, getMessage);

export default router;