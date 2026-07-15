import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { Types, HydratedDocument, Model } from "mongoose";

export interface IUser {
  userName: string;
  email: string;
  password: string;
  fullName: string;

  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  post: Types.ObjectId[];

  followersCount: number;
  followingCount: number;

  avatar: string;
  bio: string;
  refreshToken: string}

interface IUserMethods {
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}


export type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password Must be entered"],
    },
    fullName: {
      type: String,
      required: true,
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    post: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    followersCount: {
      type: Number,
      default: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      maxlength: 200,
    },
    refreshToken: {
      type: String,
    },

  },
  { timestamps: true }
);

userSchema.pre("save", async function (this: any) {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (
  this: HydratedDocument<IUser, IUserMethods>,
  password: string
) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function (
  this: HydratedDocument<IUser, IUserMethods>
) {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined");
  }

  if (!process.env.ACCESS_TOKEN_EXPIRY) {
    throw new Error("ACCESS_TOKEN_EXPIRY is not defined");
  }

  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      userName: this.userName,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET!,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY! as SignOptions["expiresIn"],
    }
  );
};

userSchema.methods.generateRefreshToken = function (
  this: HydratedDocument<IUser, IUserMethods>
) {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("REFRESH_TOKEN_SECRET is not defined");
  }
  if (!process.env.REFRESH_TOKEN_EXPIRY) {
    throw new Error("REFRESH_TOKEN_EXPIRY is not defined");
  }

  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY! as SignOptions["expiresIn"],
    }
  );
};

export const User = mongoose.model("User", userSchema);
