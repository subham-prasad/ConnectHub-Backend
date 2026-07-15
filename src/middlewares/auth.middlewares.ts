import { decode } from "node:punycode";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt,{JwtPayload} from "jsonwebtoken";
import { User } from "../models/user.models.js";


interface DecodedToken extends JwtPayload {
    _id: String,
    email : String,
    userName: String,
    fullName : String
}
const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized Request");
    }

    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as DecodedToken;



    // console.log(decodedToken);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(400, "Invalid AccessToken");
    }

    req.user = user;
    
    next();
  } catch (error:any) {
      throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});

export { verifyJWT };
