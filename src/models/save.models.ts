import mongoose,{Schema} from "mongoose";


const SaveSchema = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
    collection: {
         type: Schema.Types.ObjectId,
      ref: "SavedCollection",

    },
    comment: {
      type: String,
      required: true
    },
  },
  { timestamps: true }
);

export const Save = mongoose.model("Save", SaveSchema);