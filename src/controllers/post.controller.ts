import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadAsset } from "./asset.controller.js";
import { ASSETS_PATHS } from "../types/global.types.js";
import { Post } from "../models/post.models.js";
import { User } from "../models/user.models.js";

export const createPost = asyncHandler(async (req, res, next) => {
  try {
    const { captions, hashtags } = req.body;

    const uploadedAsset = await uploadAsset(
      req,
      res,
      next,
      ASSETS_PATHS.postAssetPath
    );

    // req.body.folderPath = ASSETS_PATHS.postAssetPath;

    // console.log("uploadedAsset: ", uploadedAsset);

    // Post

    const createdPost = await Post.create({
      captions,
      hashtags,
      owner: req.user?._id,
      asset: uploadedAsset.map((asset) => asset._id),
    });

    if (!createdPost) {
      throw new ApiError(400, "Something went wrong while creating post");
    }

    await User.findByIdAndUpdate(req.user!._id, {
      $push: {
        post: createdPost._id,
      },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, "User Post Created Successfully", createdPost)
      );
  } catch (error: any) {
    throw new ApiError(
      400,
      error?.message || "Something went Wrong while creating the post"
    );
  }
});

export const getAllPost = asyncHandler(async (req, res, next) => {
  // 1. Get the user
  // 2. Get to whom is he following and what are public posts --> to be implemented later on
  // 3. Get all the posts together
  // 4. return the posts

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const user = req?.user;

  if (!user) {
    throw new ApiError(400, "No loggedin User Found");
  }
  // console.log("this is req.user",req.user);

  //   const posts = await Post.find();

  // const posts = await Post.find().populate("owner", "fullName userName avatar");

  const result = await Post.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: "$owner",
    },

    {
      $lookup: {
        from: "assets",
        localField: "asset",
        foreignField: "_id",
        as: "asset",
      },
    },
    {
      $project: {
        captions: 1,
        hashtags: 1,
        createdAt: 1,
        owner: {
          fullName: "$owner.fullName",
          userName: "$owner.userName",
          avatar: "$owner.avatar",
        },
        asset: {
          $map: {
            input: "$asset",
            as: "a",
            in: {
              _id: "$$a._id",
              url: "$$a.url",
            },
          },
        },
      },
    },
    {
      $facet: {
        posts: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    },
  ]);

  const posts = result[0].posts;
  const totalPosts = result[0].totalCount[0]?.count || 0;

  return res.status(200).json(
    new ApiResponse(200, "Posts fetched successfully", {
      posts,
      totalPosts,
      page,
      limit,
      totalPages: Math.ceil(totalPosts / limit),
      serialNumberStartFrom: skip + 1,
      hasPrevPage: page > 1,
      hasNextPage: page < Math.ceil(totalPosts / limit),
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < Math.ceil(totalPosts / limit) ? page + 1 : null,
    })
  );
});

export const getMyPosts = asyncHandler(async (req, res, next) => {
  // 1. Get the user
  // 2. Get to whom is he following and what are public posts --> to be implemented later on
  // 3. Get my posts  together
  // 4. return the posts

  const user = req!.user;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  //   console.log(user);

  const result = await Post.aggregate([
    {
      $match: {
        owner: req.user!._id,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
              userName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "assets",
        localField: "asset",
        foreignField: "_id",
        as: "asset",
      },
    },
    {
      $unwind: "$owner",
    },

    {
      $project: {
        captions: 1,
        hashtags: 1,
        createdAt: 1,
        likesCount: 1,
        commentCount: 1,
        isReel: 1,
        owner: {
          fullName: "$owner.fullName",
          userName: "$owner.userName",
          avatar: "$owner.avatar",
        },
        asset: {
          $map: {
            input: "$asset",
            as: "a",
            in: {
              _id: "$$a._id",
              url: "$$a.url",
            },
          },
        },
      },
    },
    {
      $facet: {
        posts: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    },
  ]);

  const posts = result[0].posts;
  const totalPosts = result[0].totalCount[0]?.count || 0;

  return res.status(200).json(
    new ApiResponse(200, "Successfully returned data", {
      posts,
      totalPosts,
      page,
      limit,
      totalPages: Math.ceil(totalPosts / limit),
      serialNumberStartFrom: skip + 1,
      hasPrevPage: page > 1,
      hasNextPage: page < Math.ceil(totalPosts / limit),
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < Math.ceil(totalPosts / limit) ? page + 1 : null,
    })
  );
});
