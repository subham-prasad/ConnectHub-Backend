import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadAsset } from "./asset.controller.js";
import { ASSETS_PATHS } from "../types/global.types.js";
import { Post } from "../models/post.models.js";

const createPost = asyncHandler(async (req, res, next) => {
  try {
    const { captions, hashtags } = req.body;

    // console.log("Captions: ", captions);
    // console.log("hashtags: ", hashtags);

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

export { createPost };

