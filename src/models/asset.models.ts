import mongoose, { Schema } from "mongoose";

const assetSchema = new Schema(
  {
    memeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: String,
      required: true,
    },
    //Original
    storageKey: {
      type: String,
    },
    variantKey: {
      type: String,
    },
    originalName: {
      type: String,
    },
    fileName: {
      type: String,
    },
    originalRatio: {
      type: String,
    },
    url: { type: String, required: true },
    secureUrl: { type: String, required: true },
  },
  { timestamps: true }
);

export const Asset = mongoose.model("Asset", assetSchema);
