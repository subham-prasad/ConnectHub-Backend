import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import {
  ALLOWED_ASSET_MIME_TYPES,
  CloudinaryResponse,
} from "../types/global.types.js";
import { Asset } from "../models/asset.models.js";
import { fileTypeFromFile } from "file-type";
import fs from "fs/promises";

const deleteTempFiles = async (files: Express.Multer.File[]) => {
  await Promise.all(files.map((file) => fs.unlink(file.path).catch(() => {})));
};

async function uploadCloudAssets(uploadedData: CloudinaryResponse[]) {
  const formattedData = uploadedData.map((item) => {
    const ratio =
      item.width && item.height ? `${item.width}:${item.height}` : undefined;

    return {
      memeType: `${item.resource_type}/${item.format}`,
      fileSize: String(item.bytes),
      storageKey: item.public_id,
      variantKey: "",
      originalName: item.original_filename,
      fileName: item.display_name,
      originalRatio: ratio,
      url: item.url,
      secureUrl: item.secure_url,
    };
  });

  //   console.log("cloduinary response:",uploadedData);
  return await Asset.insertMany(formattedData);
}

export const uploadAsset = async (
  req: Request,
  res: Response,
  next: NextFunction,
  folderPath: string
) => {
  const files = req.files as Express.Multer.File[];

  //   console.log("This is the console for files:", files);

  for (const file of files) {
    const detectedType = await fileTypeFromFile(file.path);

    if (!detectedType) {
      throw new ApiError(
        400,
        `${file.originalname} is not a valid image or video.`
      );
    }

    if (
      !ALLOWED_ASSET_MIME_TYPES.includes(
        detectedType.mime as (typeof ALLOWED_ASSET_MIME_TYPES)[number]
      )
    ) {
      await deleteTempFiles(files);
      throw new ApiError(
        400,
        `${file.originalname} has an invalid file signature.`
      );
    }
  }
  if (!req.files || !Array.isArray(req.files)) {
    throw new ApiError(400, "No files have been selected to upload");
  }

  try {
    const postAssets = req.files;

    const uploadedData: CloudinaryResponse[] = [];

    // console.log("This is the post assests: ", postAssets);

    for (const pa of postAssets) {
      //   console.log("Uploading:", pa.originalname);
      const uploadedAssetOnCloud = await uploadOnCloudinary(
        pa?.path,
        folderPath
      );

      uploadedData.push(uploadedAssetOnCloud);
    }
    // console.log(uploadedData);
    const savedDataBaseAssets = await uploadCloudAssets(uploadedData);
    return savedDataBaseAssets;
  } catch (error: any) {
    // return uploadedAssetOnCloud;
    throw new ApiError(
      400,
      error?.message || "Some thing went wrong on multer"
    );
  }
};
