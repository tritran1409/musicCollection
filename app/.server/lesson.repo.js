import { BaseModel } from "./base.repo";
import { prisma } from "../utils/db.server";

export class LessonModel extends BaseModel {
  constructor() {
    super("lesson");
  }

  async findAll() {
    const lessons = await this.model.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return this.populateFilesAndDocumentsForLessons(lessons);
  }

  async findByOwnerId(ownerId) {
    const lessons = await this.model.findMany({
      where: { ownerId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return this.populateFilesAndDocumentsForLessons(lessons);
  }

  async findById(id) {
    const lesson = await this.model.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!lesson) return null;

    const [populatedLesson] = await this.populateFilesAndDocumentsForLessons([lesson]);
    return populatedLesson;
  }

  async findByClass(classId) {
    const lessons = await this.model.findMany({
      where: { classId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    
    return this.populateFilesAndDocumentsForLessons(lessons);
  }

  /**
   * Populate both files and documents for lessons
   */
  async populateFilesAndDocumentsForLessons(lessons) {
    if (!lessons || lessons.length === 0) return lessons;

    // Populate files
    const allFileIds = lessons.flatMap(lesson => lesson.fileIds || []);
    const uniqueFileIds = [...new Set(allFileIds)];

    let filesMap = new Map();
    if (uniqueFileIds.length > 0) {
      const files = await prisma.file.findMany({
        where: {
          id: { in: uniqueFileIds },
        },
        include: {
          category: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      filesMap = new Map(files.map(file => [file.id, file]));
    }

    // Populate documents
    const allDocumentIds = lessons.flatMap(lesson => lesson.documentIds || []);
    const uniqueDocumentIds = [...new Set(allDocumentIds)];

    let documentsMap = new Map();
    if (uniqueDocumentIds.length > 0) {
      const documents = await prisma.document.findMany({
        where: {
          id: { in: uniqueDocumentIds },
        },
        include: {
          category: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      documentsMap = new Map(documents.map(doc => [doc.id, doc]));
    }

    // Map files and documents to lessons
    return lessons.map(lesson => ({
      ...lesson,
      files: (lesson.fileIds || [])
        .map(fileId => filesMap.get(fileId))
        .filter(Boolean),
      documents: (lesson.documentIds || [])
        .map(docId => documentsMap.get(docId))
        .filter(Boolean),
    }));
  }

  async createLesson({ 
    title, 
    description, 
    ownerId, 
    classId, 
    fileIds = [], 
    documentIds = [] 
  }) {
    // Validate owner exists
    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
    });
    
    if (!owner) throw new Error("User not found");

    // Validate files exist
    if (fileIds.length > 0) {
      const filesCount = await prisma.file.count({
        where: { id: { in: fileIds } },
      });
      
      if (filesCount !== fileIds.length) {
        throw new Error("Some files not found");
      }
    }

    // Validate documents exist
    if (documentIds.length > 0) {
      const documentsCount = await prisma.document.count({
        where: { id: { in: documentIds } },
      });
      
      if (documentsCount !== documentIds.length) {
        throw new Error("Some documents not found");
      }
    }

    const lesson = await this.model.create({
      data: {
        title,
        description,
        ownerId,
        ownerName: owner.name,
        classId,
        fileIds,
        documentIds,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const [populatedLesson] = await this.populateFilesAndDocumentsForLessons([lesson]);
    return populatedLesson;
  }

  async updateLesson(id, { 
    title, 
    description, 
    ownerId, 
    classId, 
    fileIds, 
    documentIds 
  }) {
    const data = {};
    
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (classId !== undefined) data.classId = classId;
    
    if (ownerId) {
      const owner = await prisma.user.findUnique({
        where: { id: ownerId },
      });
      
      if (!owner) throw new Error("User not found");
      
      data.ownerId = ownerId;
      data.ownerName = owner.name;
    }
    
    // Validate and update files
    if (fileIds !== undefined) {
      if (fileIds.length > 0) {
        const filesCount = await prisma.file.count({
          where: { id: { in: fileIds } },
        });
        
        if (filesCount !== fileIds.length) {
          throw new Error("Some files not found");
        }
      }

      if (fileIds.length > 10) {
        throw new Error("Maximum 10 files allowed per lesson");
      }

      data.fileIds = fileIds;
    }

    // Validate and update documents
    if (documentIds !== undefined) {
      if (documentIds.length > 0) {
        const documentsCount = await prisma.document.count({
          where: { id: { in: documentIds } },
        });
        
        if (documentsCount !== documentIds.length) {
          throw new Error("Some documents not found");
        }
      }

      if (documentIds.length > 10) {
        throw new Error("Maximum 10 documents allowed per lesson");
      }

      data.documentIds = documentIds;
    }

    const lesson = await this.model.update({
      where: { id },
      data,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const [populatedLesson] = await this.populateFilesAndDocumentsForLessons([lesson]);
    return populatedLesson;
  }

  async delete(id) {
    return this.model.delete({
      where: { id },
    });
  }
}

export const lessonModel = new LessonModel();