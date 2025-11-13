import { redirect, useLoaderData } from "react-router";
import { FileModel } from "../.server/fileUpload.repo.js";
import FileLibraryLayout from "../components/common/FileLibraryLayout.jsx";

const fileModel = new FileModel();
const typeMap = {
  videos: "video",
  audios: "audio",
  images: "image",
  documents: "raw",
};
const acceptMap = {
  videos: "video/*",
  audios: "audio/*",
  images: "image/*",
  documents: ".txt, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .pdf",
};
const viTypemap = {
    "am-thanh": "audios",
    "hinh-anh": "images",
    "tai-lieu": "documents",
    "video": "videos",
    "bai-giang": "lectures",
}
const viNameMap = {
    "audios": "âm thanh",
    "images": "hình ảnh",
    "documents": "tài liệu",
    "videos": "video",
    "lectures": "bài giảng",
}
export async function loader({ params }) {
  let fileType = params.file_type;
  fileType = viTypemap[fileType];
  if (!["videos", "audios", "images", "documents"].includes(fileType)) {
    return redirect("/bang-dieu-khien");
  }
  const query = {};
  if (fileType) query.type = typeMap[fileType];
  const files = await fileModel.findAll(query);
  return Response.json({ files, fileType });
}

export default function FileLibraryPage() {
  const { files, fileType } = useLoaderData();
  const pageName = `📁 Sưu tập ${viNameMap[fileType]}`;
  return <FileLibraryLayout files={files} fileType={fileType} accept={acceptMap[fileType]} pageName={pageName} />;
}
