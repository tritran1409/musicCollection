import fs from "fs/promises";
import path from "path";

export async function action({ request }) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return { error: "Vui lòng chọn file để tải lên" };
    }

    const uploadsDir = path.join(process.cwd(), "app", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(uploadsDir, file.name);
    await fs.writeFile(filePath, buffer);

    return { success: `Đã tải lên: ${file.name}` };
  } catch (err) {
    console.error(err);
    return { error: "Lỗi khi tải file" };
  }
}
