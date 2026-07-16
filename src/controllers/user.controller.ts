// history

import { decode } from "node:punycode";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import bcrypt from "bcrypt";

const generateAccessAndRefreshToken = async (
  UserID: Types.ObjectId | string
) => {
  try {
    const user = await User.findById(UserID);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error: any) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and accesstoken"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //Check any field is empty or not
  //Check if data exists or not
  //check avatar path is there or not
  // Upload it to cloud

  try {
    const { userName, fullName, email, password, bio } = req.body;

    // console.log("userName: ",userName);
    // console.log("fullName: ", fullName);
    // console.log("email: ", email);
    // console.log("password: ", password);


    if (
      [fullName, userName, email, password].some(
        (field) => !field || field.trim() === ""
      )
    ) {
      throw new ApiError(400, "All field are mandatory to enter");
    }

    const existingUser = await User.findOne({
      $or: [{ userName }, { email }],
    });

    if (existingUser) {
      throw new ApiError(400, "This userName or Email Already Exists");
    }

    const avatarLocalPath = req.file?.path;

    //   console.log(avatarLocalPath);

    if (!avatarLocalPath) {
      throw new ApiError(404, "Profile Pic is missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    console.log("this is the avatar", avatar);

    const user = await User.create({
      fullName,
      avatar: avatar?.url,
      email: email,
      password: password,
      userName: userName,
      bio: bio,
    });
    //   console.log("This is req.file console: ", req.files);
    //   console.log("This is req.file console: ", req.body);

    const createdUser = await User.findById(user._id).select(
      "-password -refreshtoken"
    );

    if (!createdUser) {
      throw new ApiError(
        500,
        "Something went wrong while registering the users"
      );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "User got registered", createdUser));
  } catch (error: any) {
    throw new ApiError(500, error.message || "Something went worng");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  console.log(userName)
  console.log(password);


  //take details
  //check it
  //check the passwor

  if (!userName && !email) {
    throw new ApiError(
      400,
      "Both UserName and Email Is missing please enter that"
    );
  }

  const user = (await User.findOne({
    $or: [{ userName }, { email }],
  })) as any;

  if (!user) {
    throw new ApiError(400, "No user exists with these parameters");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password Incorrect");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  //   console.log("AccessToken: ", accessToken);
  //   console.log("Refresh Token: ", refreshToken);

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,

        "User logged in Successfully",
        {
          user: loggedInUser,
          refreshToken,
          accessToken,
        }
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user!._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User Logged Out Successfully"));
});

const updateAvatarImage = asyncHandler(async (req, res) => {
  const newAvatarImage = req.file?.path;

  if (!newAvatarImage) {
    throw new ApiError(400, "No image has been uploaded");
  }

  //   console.log("This is new avatar Image:", newAvatarImage);

  const avatar = await uploadOnCloudinary(newAvatarImage);

  const user = await User.findByIdAndUpdate(
    req.user!._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  //   const avatar = await

  return res
    .status(200)
    .json(new ApiResponse(200, "Avatar Image Update Successfully", user));
});

const updateUserDetails = asyncHandler(async (req, res) => {
  const { userName, email, fullName, bio } = req.body;

  if (!userName && !email && !fullName) {
    throw new ApiError(400, "At least enter one field to update");
  }

  const user = await User.findByIdAndUpdate(
    req.user!._id,
    {
      $set: {
        userName: userName,
        email: email,
        fullName: fullName,
        bio: bio,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "User Details Updated Succesfully", user));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user!._id, { new: true });

    return res
      .status(200)
      .json(new ApiResponse(200, "User Data got succesffuly", user));
  } catch (error: any) {
    throw new ApiError(
      500,
      "Something went wrong while fetching current users"
    );
  }
});

const refeshAccessToken = asyncHandler(async (req, res) => {
  //Get the refresh token
  //check the refresh token
  //if correct refreshToken generate new token
  // get new tokens and return and save it

  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(400, "Invalid token");
  }

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET!
  );

  if (typeof decodedToken === "string") {
    throw new Error("Invalid token payload");
  }

  const user = await User.findById(decodedToken?._id);

  if (!user) {
    throw new ApiError(400, "Invalid User");
  }

  if (typeof user === "string") {
    throw new ApiError(400, "Invalid user type");
  }

  if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(400, "Token is Invalid or expired");
  }

  //   console.log(user._id);

  const { accessToken, refreshToken: newRefreshToken } =
    await generateAccessAndRefreshToken(user._id);

  // if(!decodeToken){
  //     throw new ApiError(400,Invalid refresh token)
  // }
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(new ApiResponse(200, "Work is going on"));
});

const updatePassword = asyncHandler(async (req, res) => {
  //Get all the data
  //check all fields are there or not
  // check new pass and confirm pass matches or not
  // check current pass is correct or not

  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const user = await User.findById(req.user!._id);
    if (!user) {
      throw new ApiError(400, "Current User is not found");
    }
    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new ApiError(400, "All the fields are mandatory");
    }

    if (newPassword !== confirmPassword) {
      throw new ApiError(
        400,
        "New Password and Current Password Does not match"
      );
    }

    const checkCurrentPassword = await user.isPasswordCorrect(currentPassword);

    if (!checkCurrentPassword) {
      throw new ApiError(400, "The current password is wrong...");
    }

   user.password = newPassword ;

   await user.save({
    validateBeforeSave: false
   })

   

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Password Changed Successfully")
      );
  } catch (error: any) {
    console.error(error);
    throw new ApiError(
      400,
      error?.message || "Something went wrong while updating password"
    );
  }
});
export {
  registerUser,
  loginUser,
  logoutUser,
  updateAvatarImage,
  updateUserDetails,
  getCurrentUser,
  refeshAccessToken,
  updatePassword,
};
