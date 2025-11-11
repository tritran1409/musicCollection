import { FileModel } from "../../.server/fileUpload.repo";

export const action = async ({ request }) => {
  try {
    const data = await request.json();
    const fileId = data.id;
    if (!fileId) throw new Error("File ID is required");
    const fieldModel = new FileModel();
    const result = await fieldModel.deleteFile(fileId);
    return { success: true, file: result };
  } catch (err) {
    console.error("Delete failed:", err);
    return { error: err.message };
  }
};