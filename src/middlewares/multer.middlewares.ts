import multer, { FileFilterCallback } from "multer";
import path from "path";
import { ALLOWED_ASSET_MIME_TYPES } from "../types/global.types.js";
import { Request } from "express";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, "./public/temp");
    cb(null, path.join(process.cwd(), "public", "temp"));
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // cb(null, file.fieldname + "-" + uniqueSuffix);
    cb(null, file.originalname);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const mimeType = file.mimetype.toLowerCase();
  const fileName = file.originalname;
  if (
    ALLOWED_ASSET_MIME_TYPES.includes(
      mimeType as (typeof ALLOWED_ASSET_MIME_TYPES)[number]
    )
  ) {
    cb(null, true);
  } else {
    // Reject the file and pass a custom error
    cb(
      new Error(
        `${fileName} belongs to unsupported file type. Only supported image and video formats are allowed.`
      )
    );
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
});
