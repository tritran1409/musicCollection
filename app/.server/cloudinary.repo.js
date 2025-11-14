import { Readable } from "stream";
import cloudinary from "../utils/cloudinary.server";
import { sanitizeFileName } from "../helper/texthelper";

export class CloudinaryRepo {
  async upload(file, folder = "general") {
    if (!file || typeof file === "string") throw new Error("File không hợp lệ");

    const buffer = Buffer.from(await file.arrayBuffer());
    let resourceType = "auto";
    
    if (file.type.startsWith("image/")) {
      resourceType = "image";
    } else if (file.type.startsWith("video/")) {
      resourceType = "video";
    } else if (file.type.startsWith("audio/")) {
      resourceType = "auto";
    } else {
      resourceType = "raw";
    }
    
    const uploadStream = () =>
      new Promise((resolve, reject) => {
        const data = {
          folder: `mcollection/${folder}`,
          resource_type: resourceType,
        };
        
        let filename = sanitizeFileName(file.name);
        if (resourceType === "raw") {
          // For documents: remove extension, let Cloudinary handle it
          filename = filename.replace(/\.[^.]+$/, '');
          data.public_id = filename;
          data.overwrite = true;
        } else {
          // For images/videos: keep it simple, let Cloudinary auto-handle
          data.use_filename = true;
          data.unique_filename = false;
          data.filename = filename;
        }
        
        const stream = cloudinary.uploader.upload_stream(
          data,
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

  publicIdToUrl(publicId, resourceType = "auto") {
    return cloudinary.url(publicId, {
      resource_type: resourceType,
      secure: true,
    });
  }
  
  publicIdToDownloadUrl(publicId, resourceType = "auto") {
    return cloudinary.url(publicId, {
      resource_type: resourceType,
      secure: true,
    });
  }
}