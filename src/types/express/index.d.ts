import { HydratedDocument } from "mongoose";
import { IUser } from "../../models/user.models.js";

declare global {
  namespace Express {
    interface Request {
      user?: HydratedDocument<IUser>;
    }
  }
}

export {};
