import { useLoaderData } from "react-router";
import { FileModel } from "../.server/fileUpload.repo.js";
import styles from "../globals/styles/ImageGallery.module.css";
import FileUploader from "../components/common/FileUploader.jsx";
import { FileText, Video, Music, Image as ImageIcon } from "lucide-react";
import Modal from "../components/modals/upload/Modal.jsx";
import { useState, useRef } from "react";
import useUpload from "../hooks/useUpload.js";
import useOutsideClick from "../hooks/useOutsideClick.js";
const fileModel = new FileModel();

export async function loader() {
  const files = await fileModel.findAll();
  return Response.json({ files });
}

export default function FileLibraryPage() {
  const { files } = useLoaderData();
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [classes, setClasses] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { upload, loading, error, data } = useUpload();
  const handleUpload = () => {
    if (!selectedFile) return;
    upload(selectedFile, "/upload/images");
  };
  const handleFileSelectd = (file) => {
    setSelectedFile(file);
    setModalOpen(true);
  };
  const allClasses = Array.from({ length: 12 }, (_, i) => `Lớp ${i + 1}`);

  const toggleClass = (cls) => {
    if (classes.includes(cls)) {
      setClasses(classes.filter((c) => c !== cls));
    } else {
      setClasses([...classes, cls]);
    }
  };
  const dropdownRef = useRef(null);

useOutsideClick(dropdownRef, () => setDropdownOpen(false));
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
    setDropdownOpen(false);
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
              accept="image/*,video/*,audio/*,application/*"
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

            <div className={styles.field}>
              <label>Lớp học</label>
              <div className={styles.multiSelect} ref={dropdownRef}>
                <div
                  className={styles.inputBox}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {classes.length === 0 ? (
                    <span className={styles.placeholder}>Chọn lớp...</span>
                  ) : (
                    classes.map((cls) => (
                      <span
                        key={cls}
                        className={styles.tag}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleClass(cls);
                        }}
                      >
                        {cls} ✕
                      </span>
                    ))
                  )}
                </div>
                {dropdownOpen && (
                  <div className={styles.dropdown}>
                    {allClasses.map((cls) => (
                      <div
                        key={cls}
                        className={`${styles.dropdownItem} ${
                          classes.includes(cls) ? styles.selected : ""
                        }`}
                        onClick={() => toggleClass(cls)}
                      >
                        {cls}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

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
