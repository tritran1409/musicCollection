import { useLoaderData } from "react-router";
import FileUploader from "~/components/common/FileUploader";
import styles from "./AudioList.module.css";

export default function AudioList({ lessonId }) {
  const { files } = useLoaderData();
  const audios = Array.isArray(files) ? files.filter(f => f.mimeType?.startsWith("audio/")) : [];

  return (
    <div className={styles.container}>
      <FileUploader uploadUrl={`/lessons/${lessonId}/audio`} label="Tải audio cho bài giảng" accept="audio/*" />

      <div className={styles.list}>
        {audios.length === 0 && <p>Chưa có tệp âm thanh.</p>}
        {audios.map(a => (
          <div key={a.id} className={styles.item}>
            <div className={styles.info}>
              <div className={styles.name}>{a.filename}</div>
            </div>
            <audio controls src={a.url} className={styles.player}></audio>
          </div>
        ))}
      </div>
    </div>
  );
}
