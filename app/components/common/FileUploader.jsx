import { Form, useActionData } from "react-router";
import { useState } from "react";
import { Upload } from "lucide-react";
import styles from "./FileUploader.module.css";

/**
 * Component upload file tái sử dụng
 * @param {string} uploadUrl - đường dẫn route action xử lý upload
 * @param {string} label - nhãn hiển thị
 * @param {string} accept - định dạng file cho phép (VD: ".pdf,.jpg")
 */
export default function FileUploader({ uploadUrl, label, accept }) {
  const [fileName, setFileName] = useState("");
  const actionData = useActionData();

  return (
    <div className={styles.container}>
      {label && <h2 className={styles.title}>{label}</h2>}

      <Form method="post" encType="multipart/form-data" action={uploadUrl} className={styles.form}>
        <label className={styles.uploadLabel}>
          <Upload size={18} />
          <span>Chọn file để tải lên</span>
          <input
            type="file"
            name="file"
            accept={accept}
            onChange={(e) => setFileName(e.target.files[0]?.name || "")}
            className={styles.hiddenInput}
          />
        </label>

        {fileName && <p className={styles.fileName}>📁 {fileName}</p>}

        <button type="submit" className={styles.submitBtn}>
          Tải lên
        </button>

        {actionData?.success && (
          <p className={styles.success}>✅ {actionData.success}</p>
        )}
        {actionData?.error && (
          <p className={styles.error}>❌ {actionData.error}</p>
        )}
      </Form>
    </div>
  );
}
