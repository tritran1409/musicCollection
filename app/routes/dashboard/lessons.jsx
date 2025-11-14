import React, { useState } from "react";
import styles from "../../globals/styles/lessonList.module.css";
import { useNavigate } from "react-router";

export async function loader({ params }) {
  const { classId } = params;

  const lessons = [
    { id: 1, title: "Giới thiệu Toán học cơ bản", creator: "Thầy Nguyễn Văn A" },
    { id: 2, title: "Cộng trừ trong phạm vi 10", creator: "Cô Trần Thị B" },
    { id: 3, title: "Làm quen chữ cái A, B, C", creator: "Cô Lê Minh C" },
  ];

  return { classId, lessons };
}

export default function LessonList({ loaderData }) {
  const { classId, lessons } = loaderData;
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [newLesson, setNewLesson] = useState({ title: "", creator: "" });
  const [allLessons, setAllLessons] = useState(lessons);

  const handleCreate = () => {
    const newItem = {
      id: Date.now(),
      title: newLesson.title,
      creator: newLesson.creator,
    };

    setAllLessons([...allLessons, newItem]);
    setShowModal(false);
    setNewLesson({ title: "", creator: "" });

    alert("Tạo bài giảng mới thành công!");
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>📚 Danh sách bài giảng – Lớp {classId}</h1>

        {/* Nút Add New */}
        <button className={styles.addBtn} onClick={() => navigate(`/bang-dieu-khien/chuong-trinh-hoc/bai-giang/create/${classId}`)}>
          ➕ Add New Lesson
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tên bài giảng</th>
              <th>Người tạo</th>
            </tr>
          </thead>
          <tbody>
            {allLessons.map((lesson) => (
              <tr
                key={lesson.id}
                className={styles.row}
                onClick={() => alert(`Mở bài giảng: ${lesson.title}`)}
              >
                <td>{lesson.title}</td>
                <td>{lesson.creator}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
