import { useLoaderData } from "react-router";
import FileUploader from "~/components/common/FileUploader";
import styles from "./ImageGallery.module.css";

export default function ImageGallery({ lessonId }) {
  const { files } = useLoaderData(); // note: loader of route returns { files }

  // show only images (if route loader returns mixed, filter)
  const images = Array.isArray(files)
    ? files.filter((f) => f.mimeType?.startsWith("image/"))
    : [];

  return (
    <div className={styles.container}>
      <FileUploader
        uploadUrl={`/lessons/${lessonId}/images`}
        label="Tải ảnh cho bài giảng"
        accept="image/*"
      />

      <div className={styles.grid}>
        {images.length === 0 && <p>Chưa có ảnh nào.</p>}
        {images.map((img) => (
          <div key={img.id} className={styles.card}>
            <img src={img.url} alt={img.filename} className={styles.thumb} />
            <div className={styles.meta}>
              <div className={styles.name}>{img.filename}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
