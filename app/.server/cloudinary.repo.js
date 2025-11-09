import { Readable } from "stream";
import cloudinary from "../utils/cloudinary.server";
import { sanitizeFileName } from "../helper/texthelper";

export class CloudinaryRepo {
    async upload(file, folder = "general") {
    if (!file || typeof file === "string") throw new Error("File không hợp lệ");

    const buffer = Buffer.from(await file.arrayBuffer());
    let resourceType = "auto";
    if (file.type.startsWith("image/")) resourceType = "image";
    else if (file.type.startsWith("video/")) resourceType = "video";
    else resourceType = "raw";
    const filename = sanitizeFileName(file.name);
    if (filename.includes(".pdf")) {
      resourceType = "auto";
    }
    
    const uploadStream = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `mcollection/${folder}`,
            resource_type: resourceType,
            use_filename: true,
            unique_filename: false,
            filename: filename,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        Readable.from(buffer).pipe(stream);
      });

    const result = await uploadStream();

    return result;
  }

  async deleteByPublicId(publicId, resourceType = "auto") {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return { success: true };
  }

  publicIdToUrl(publicId, resourceType = "auto", format = null) {
    const data = {
      resource_type: resourceType,
      secure: true,
    }
    // if (format) data.format = format;
    // if (data.format) data.resource_type = "raw";
    return cloudinary.url(publicId, data);
  }
}
    