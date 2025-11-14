import { useEffect, useState } from "react";
import FilePicker from "../../components/filePicker/FilePicker";
import styles from "../../globals/styles/createLesson.module.css";

export default function CreateLessonPage() {
  const [title, setTitle] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  return (
    <div className={styles.pageWrapper}>
      <h1 className={styles.title}>Tạo bài giảng mới</h1>

      <label className={styles.label}>Tên bài giảng</label>
      <input
        type="text"
        className={styles.input}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Nhập tên bài giảng"
      />
      <FilePicker
          selectedFiles={selectedFiles}
          onSelectFiles={setSelectedFiles}
          multiple={true} // cho phép chọn nhiều file
        />
    </div>
  );
}
