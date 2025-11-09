// app/models/FileModel.js
import { BaseModel } from "./base.repo";
import { CloudinaryRepo } from "./cloudinary.repo";

export class FileModel extends BaseModel {
  cloudinaryRepo;
  constructor() {
    super("file");
    this.cloudinaryRepo = new CloudinaryRepo();
  }

  async uploadFileToCloudinary(file, folder = "general", userId = null, extraData = {}) {
    const originalFilename = file.name;
    const fileType = file.type;
    let customType = null;
    if (fileType === 'application/pdf') {
      customType = 'raw';
    }
    const result = await this.cloudinaryRepo.upload(file, folder);
    if (!result) throw new Error("Upload file thất bại");
    const url = this.cloudinaryRepo.publicIdToUrl(result.public_id, result.resource_type, result.format);
    return this.createFile({
      filename: originalFilename,
      url: result.url,
      publicId: result.public_id,
      downloadUrl: url,
      name: extraData?.name,
      description: extraData?.description,
      classes: extraData?.classes || [],
      type: customType || result.resource_type,
      size: result.bytes,
      src: 'cloudinary',
      detail: result,
      ownerId: userId,
    });
  }

  async findByLesson(lessonId) {
    return this.findMany({ lessonId });
  }


  async findByType(type) {
    return this.findMany({
      type,
    });
  }

  async createFile(data) {
    return this.create(data);
  }

  async deleteByLesson(lessonId) {
    return this.model.deleteMany({ where: { lessonId } });
  }
}
export default FileModel;
