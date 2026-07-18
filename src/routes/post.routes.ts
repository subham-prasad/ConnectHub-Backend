import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { createPost } from "../controllers/post.controller.js";

const router = Router();

router
  .route("/create-post")
  .post(verifyJWT, upload.array("photos", 12), createPost);
export default router;
