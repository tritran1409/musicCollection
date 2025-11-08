import { FileModel } from "../../.server/fileUpload.repo";
import { getUser } from "../../service/auth.server";

export const action = async ({ request, params }) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const classes = formData.get("classes") || "[]";
    const name = formData.get("name");
    const description = formData.get("description");
    const extraData = {
      name,
      description,
      classes: JSON.parse(classes),
    };
    const folder = params.path || "general";
    let user = await getUser(request);
    const fieldModel = new FileModel();
    const uploaded = await fieldModel.uploadFileToCloudinary(file, folder, user.id, extraData);
    return { success: true, file: uploaded };
  } catch (err) {
    console.error("Upload failed:", err);
    return { error: err.message };
  }
};