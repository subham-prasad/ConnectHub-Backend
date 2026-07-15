import { Router } from "express";
import {
    getCurrentUser,
  loginUser,
  logoutUser,
  refeshAccessToken,
  registerUser,
  updateAvatarImage,
  updatePassword,
  updateUserDetails,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), registerUser);

router.route("/login").post(loginUser);

//Secure Routes

router.route("/logout").post(verifyJWT, logoutUser);

router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateAvatarImage);

router.route("/update-user-details").patch(verifyJWT, updateUserDetails);

router.route("/getCurrentUser").post(verifyJWT,getCurrentUser)
router.route("/refreshToken").post(verifyJWT, refeshAccessToken);

router.route("/update-password").post(verifyJWT, updatePassword);

// router.all("/login", (req, res, next) => {
//   if (req.method === "QUERY") {
//     return loginUser(req, res, next);
//   }

//   next();
// });

export default router;
