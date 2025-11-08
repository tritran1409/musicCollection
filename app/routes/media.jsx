import { FileText, Music } from "lucide-react";
import { useState } from "react";
import { useLoaderData } from "react-router";
import { FileModel } from "../.server/fileUpload.repo.js";
import ClassSelector from "../components/common/ClassSelector.jsx";
import FileUploader from "../components/common/FileUploader.jsx";
import Modal from "../components/modals/upload/Modal.jsx";
import styles from "../globals/styles/ImageGallery.module.css";
import useUpload from "../hooks/useUpload.js";
const fileModel = new FileModel();
const typeMap = {
  videos: "video",
  audios: "audio",
  images: "image",
  documents: "raw",
};

export async function loader({params}) {
  let fileType = params.file_type;
  let classMate = params.class;
  const query = {};
  if (fileType) query.type = typeMap[fileType];
  if (classMate) query.classes = { has: Number(classMate) };
  const files = await fileModel.findAll(query);
  return Response.json({ files });
}

export default function FileLibraryPage() {
  const { files } = useLoaderData();
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [classes, setClasses] = useState([1]);
  const { upload, loading, error, data } = useUpload();
  const handleUpload = () => {
    if (!selectedFile) return;
    upload(selectedFile, "/upload/videos", {
      name,
      description,
      classes: JSON.stringify(classes)
    });
  };
  const handleFileSelectd = (file) => {
    setSelectedFile(file);
    setModalOpen(true);
  };

  const getFilePreview = (file) => {
    const type = (file.type || "").toLowerCase();

    switch (type) {
      case "image":
        return (
          <div className={styles.imageWrapper}>
            <img
              src={file.url}
              alt={file.filename}
              className={styles.imageCover}
              loading="lazy"
            />
          </div>
        );

      case "video":
        return (
          <div className={styles.videoWrapper}>
            <video className={styles.thumbnail} controls>
              <source src={file.url} />
            </video>
          </div>
        );

      case "audio":
        return (
          <div className={styles.iconWrapper}>
            <Music className={styles.fileIcon} />
          </div>
        );

      case "document":
      case "file":
      default:
        return (
          <div className={styles.iconWrapper}>
            <FileText className={styles.fileIcon} />
          </div>
        );
    }
  };
  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedFile(null);
    setName("");
    setDescription("");
    setClasses([]);
  };
  return (
    <div className={styles.container}>
      <div className={styles.leftPane}>
        <div className={styles.header}>
          <h2>📁 Thư viện tệp</h2>
        </div>

        {files.length === 0 ? (
          <p className={styles.empty}>Chưa có tệp nào được tải lên</p>
        ) : (
          <div className={styles.grid}>
            {files.map((file) => (
              <div key={file.id} className={styles.card}>
                {getFilePreview(file)}
                <div className={styles.meta}>
                  <span className={styles.filename}>{file.filename}</span>
                  <span className={styles.size}>
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                  <span className={styles.typeTag}>{file.type}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.rightPane}>
        <button
          className={styles.addBtn}
          onClick={() => setModalOpen(true)}
        >
          + TẢI LÊN
        </button>
        <Modal
          isOpen={isModalOpen}
          onClose={() => handleModalClose()}
          title="Tải ảnh mới"
          width="500px"
        >
          <div className={styles.form}>
            <FileUploader
              onFileSelect={handleFileSelectd}
              accept="video/*"
            />

            <div className={styles.field}>
              <label>Tên hình ảnh</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Nhập tên cho hình ảnh..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label>Mô tả</label>
              <textarea
                className={styles.textarea}
                placeholder="Nhập mô tả cho hình ảnh..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <ClassSelector
              selected={classes}
              onChange={setClasses}
              fixedClasses={[1]}
            />

            {error && <p className={styles.error}>{error}</p>}
            {data?.success && <p className={styles.success}>Tải lên thành công!</p>}
          </div>
          <div className={styles.modalFooter}>
            <button disabled={loading || !selectedFile} className={`${styles.submitBtn} ${styles.button}`} onClick={handleUpload}>
              Tải lên
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
