import { v2 as cloudinary } from "cloudinary";

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
