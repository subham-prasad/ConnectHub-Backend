import mongoose, { Model, Schema, Types } from "mongoose";

export interface Ipost {
  captions: string;
  hashtags: string[];
  owner: Types.ObjectId;

  asset: Types.ObjectId[];

  likesCount: number;
  commentCount: number;
  isReel: boolean;
}

export type PostModel = Model<Ipost, {}>;

const postSchema = new Schema<Ipost, PostModel>(
  {
    captions: {
      type: String,
      default: "",
    },
    hashtags: {
      type: [
        {
          type: String,
          trim: true,
          lowercase: true,
        },
      ],
      default: [],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    asset: {
      type: [{ type: Schema.Types.ObjectId, ref: "Asset" }],
      default: [],
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    isReel: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);
