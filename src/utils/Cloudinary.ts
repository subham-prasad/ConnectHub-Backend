// console.log("Cloudinary.ts loaded");

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";




//study cloudinary response log

const uploadOnCloudinary = async (localFilePath: string, folderPath: string): Promise<any> => {

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: folderPath
    });

    //file upload is successfull

    // console.log("The file is uploaded on cloudinary", response.url);
    fs.unlinkSync(localFilePath); //remove the locally saved data then only move forward for anything

    return response;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    throw error; //remove the locally saved data then only move forward for anything
  }
};

export { uploadOnCloudinary };
