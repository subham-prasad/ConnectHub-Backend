export const ASSETS_PATHS = {
  postAssetPath: "assets/post/",
  avatarAssetPath: "assets/avatar/",
  songsAssetPath: "assets/songs/",
} as const;

export interface CloudinaryResponse {
  asset_id: String;
  public_id: String;
  version: Number;
  version_id: String;
  width: Number;
  height: Number;
  format: String;
  resource_type: String;
  tags: String[];
  bytes: Number;
  created_at: String;
  type: String;
  etag: String;
  placeholder: Boolean;
  url: String;
  secure_url: String;
  asset_folder: String;
  display_name: String;
  original_filename: String;
  original_extension: String;
  api_key: String;
}

export const ALLOWED_ASSET_EXTENSIONS = [

  // Images
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
  ".heic",
  ".heif",
  ".svg",

  // Videos
  ".mp4",
  ".mov",
  ".avi",
  ".webm",
  ".wmv",
  ".mpeg",
  ".mpg",
  ".m4v",
  ".3gp"
] as const;


export const ALLOWED_ASSET_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/heic",
  "image/heif",

  "video/mp4",
  "video/quicktime", // .mov
  "video/x-msvideo", // .avi
  "video/webm",
  "video/x-ms-wmv", // .wmv
  "video/mpeg", // .mpeg, .mpg
  "video/3gpp", // .3gp
] as const;