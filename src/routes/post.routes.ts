import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { createPost, getAllPost, getMyPosts } from "../controllers/post.controller.js";

const router = Router();



router
  .route("/create-post")
  .post(verifyJWT, upload.array("photos", 12), createPost);

router.route("/get-all-posts").get(verifyJWT, getAllPost);

router.route("/get-my-posts").get(verifyJWT, getMyPosts);


export default router;


