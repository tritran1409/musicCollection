import { FileText, Music, Download, Trash2, Info } from "lucide-react";
import { useState } from "react";
import { useLoaderData } from "react-router";
import { FileModel } from "../.server/fileUpload.repo.js";
import ClassSelector from "../components/common/ClassSelector.jsx";
import FileUploader from "../components/common/FileUploader.jsx";
import Modal from "../components/modals/upload/Modal.jsx";
import styles from "../globals/styles/ImageGallery.module.css";
import useUpload from "../hooks/useUpload.js";
import { redirect } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

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
export async function loader({ params }) {
  let fileType = params.file_type;
  fileType = viTypemap[fileType];
  let classMate = params.class;
  if (!["videos", "audios", "images", "documents"].includes(fileType)) {
    return redirect("/bang-dieu-khien");
  }
  const query = {};
  if (fileType) query.type = typeMap[fileType];
  if (classMate) query.classes = { has: Number(classMate) };
  const files = await fileModel.findAll(query);
  return Response.json({ files, fileType, classMate });
}

export default function FileLibraryPage() {
  const { files, fileType, classMate } = useLoaderData();
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [classes, setClasses] = useState(classMate ? [Number(classMate)] : []);
  const [downloading, setDownloading] = useState(null);
  const { upload, loading, error, data } = useUpload();

  const handleUpload = () => {
    if (!selectedFile) return;
    upload(selectedFile, "/upload/videos", {
      name,
      description,
      classes: JSON.stringify(classMate ? [Number(classMate)] : [])
    });
  };

  const handleFileSelectd = (file) => {
    setSelectedFile(file);
  };

  const handleDownload = async (file) => {
  setDownloading(file.id);
  try {
    const response = await fetch(file.downloadUrl || file.url);
    
    if (!response.ok) {
      throw new Error('Failed to download file');
    }
    
    const blob = await response.blob();
    const finalFilename = file.filename;
    
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = finalFilename;
    
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    }, 100);
    
  } catch (error) {
    console.error('Download error:', error);
    alert('Không thể tải file. Vui lòng thử lại.');
  } finally {
    setDownloading(null);
  }
};

  const getFilePreview = (file) => {
    const type = (file.type || "").toLowerCase();
    switch (type) {
      case "image":
        return <img src={file.url} alt={file.filename} className={styles.imageCover} loading="lazy" />;
      case "video":
        return <video className={styles.thumbnail} src={file.url} muted />;
      case "audio":
        return <Music className={styles.fileIcon} />;
      default:
        return <FileText className={styles.fileIcon} />;
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedFile(null);
    setName("");
    setDescription("");
  };

  return (
    <div className={styles.container}>
      {/* LEFT SIDE */}
      <div className={styles.leftPane}>
        <div className={styles.header}>
          <h2>📁 Thư viện tệp</h2>
        </div>

        {files.length === 0 ? (
          <p className={styles.empty}>Chưa có tệp nào được tải lên</p>
        ) : (
          <div className={styles.grid}>
            {files.map((file) => (
              <motion.div
                key={file.id}
                className={`${styles.card} ${selectedFile?.id === file.id ? styles.activeCard : ""}`}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleFileSelectd(file)}
              >
                <div className={styles.previewWrapper}>{getFilePreview(file)}</div>
                <div className={styles.meta}>
                  <span className={styles.filename} title={file.filename}>{file.filename}</span>
                  <div className={styles.actions}>
                    {file.downloadUrl && (
                      <button
                        className={styles.iconBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(file);
                        }}
                        disabled={downloading === file.id}
                        title="Tải xuống"
                      >
                        <Download size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className={styles.rightPane}>
        <button className={styles.addBtn} onClick={() => setModalOpen(true)}>
          + TẢI LÊN
        </button>

        {/* FILE INFO SECTION */}
        <AnimatePresence>
          {selectedFile && (
            <motion.div
              className={styles.fileDetail}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
            >
              <div className={styles.sideActions}>
                <button
                  onClick={() => handleDownload(selectedFile)}
                  className={styles.viewBtn}
                >
                  <Download size={18} />
                </button>
              </div>
              <h3>📄 Chi tiết tệp</h3>
              <p><strong>Tên:</strong> {selectedFile.name || "Không có"}</p>
              <p><strong>Tên Tệp:</strong> {selectedFile.filename}</p>
              <p><strong>Người tạo:</strong> {selectedFile.ownerName || "Không có"}</p>
              <p><strong>Loại:</strong> {selectedFile.type}</p>
              <p><strong>Mô tả:</strong> {selectedFile.description || "Không có"}</p>
              <p><strong>Kích thước:</strong> {(selectedFile.size / 1024).toFixed(1)} KB</p>
              <p><strong>Ngày tải lên:</strong> {new Date(selectedFile.createdAt).toLocaleString()}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL UPLOAD */}
        <Modal isOpen={isModalOpen} onClose={handleModalClose} title="Tải tệp mới" width="500px">
          <div className={styles.form}>
            <FileUploader onFileSelect={setSelectedFile} accept={acceptMap[fileType] || "*/*"} />
            <div className={styles.field}>
              <label>Tên tệp</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Nhập tên..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label>Mô tả</label>
              <textarea
                className={styles.textarea}
                placeholder="Nhập mô tả..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <ClassSelector selected={classes} onChange={setClasses} fixedClasses={[1]} />
            {error && <p className={styles.error}>{error}</p>}
            {data?.success && <p className={styles.success}>Tải lên thành công!</p>}
          </div>
          <div className={styles.modalFooter}>
            <button
              disabled={loading || !selectedFile}
              className={`${styles.submitBtn} ${styles.button}`}
              onClick={handleUpload}
            >
              {loading ? "Đang tải lên..." : "Tải lên"}
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
