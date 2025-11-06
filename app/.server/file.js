// app/models/FileModel.js
import BaseModel from "./BaseModel";

export default class FileModel extends BaseModel {
  constructor() {
    super("file");
  }

  async findByLesson(lessonId) {
    return this.findMany({ lessonId });
  }

  async findByType(lessonId, type) {
    return this.findMany({
      lessonId,
      mimeType: { startsWith: `${type}/` },
    });
  }

  async createFile({ filename, url, mimeType, size, lessonId }) {
    return this.create({
      filename,
      url,
      mimeType,
      size,
      lessonId,
    });
  }

  async deleteByLesson(lessonId) {
    return this.model.deleteMany({ where: { lessonId } });
  }
}
