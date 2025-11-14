// ==========================================
// 1. models/category.model.js
// ==========================================
import { BaseModel } from "./base.repo";
import { UserModel } from "./user.repo";

export class LessonModel extends BaseModel {
  userRepo;
  constructor() {
    super("lesson");
    this.userRepo = new UserModel();
  }

  async findAll() {
    return this.model.findMany(
      {
        include: {
          files: true,
        },
      }
    );
  }
  // Tìm tất cả category của user
  async findByOwnerId(ownerId) {
    return this.model.findMany(
      {
        where: { ownerId },
        orderBy: { createdAt: "desc" },
        include: {
          files: true,
        },
      }
    );
  }

  // Tạo category mới
  async createLesson({ title, description, ownerId, classId, files = [] }) {
    const user = await this.userRepo.findById(ownerId);
    if (!user) throw new Error("User not found");
    // Kiểm tra slug đã tồn tại chưa
    const existing = await this.model.findUnique({
      where: { title },
    });

    if (existing) {
      return this.model.create(
        {
          data: {
            title,
            description,
            ownerName: user.name,
            ownerId,
            classId,
            files,
          },
        }
      );
    }

    return this.model.create(
      {
        data: {
          title,
        description,
        ownerName: user.name,
        ownerId,
        classId,
        files,
        },
      }
    );
  }

  // Cập nhật category
  async updateLesson(id, { title, description, ownerId, classId, files = [] }) {
    const data = {};
    
    if (title) {
      data.title = title;
    }
    
    if (description !== undefined) {
      data.description = description;
    }
    const user = await this.userRepo.findById(ownerId);
    if (!user) throw new Error("User not found");
    data.ownerName = user.name;
    if (classId) data.classId = classId;
    if (files) data.files = files;
    return this.model.update(
      {
        where: { id },
        data,
      }
    );
  }
}

export const lessonModel = new LessonModel();