import env from "../config/env.config";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const uploadAvatar = (buffer: Buffer, userId: string) =>
  new Promise<string>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          public_id: `avatars/${userId}`,
          overwrite: true,
          invalidate: true,
          resource_type: "image",
          transformation: [
            { width: 256, height: 256, crop: "fill", gravity: "auto" },
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, result) =>
          error || !result ? reject(error) : resolve(result.secure_url),
      )
      .end(buffer);
  });

export default cloudinary;
