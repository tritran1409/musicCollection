import { useEffect, useState } from "react";
import styles from "./AddCategoryModal.module.css";
import { Modal } from "../../modal/Modal";
import { X } from "lucide-react";

export const AddCategoryModal = ({ isOpen, onClose, parentLabel, onSubmit }) => {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setError("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError("");

    try {
      // Call the onSubmit callback passed from parent
      await onSubmit(name.trim());
      setName("");
      onClose();
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi tạo category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.modalHeader}>
        <h3 className={styles.modalTitle}>Thêm danh mục mới</h3>
        <button
          type="button"
          onClick={onClose}
          className={styles.modalCloseButton}
          disabled={isSubmitting}
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.modalBody}>
          {parentLabel && (
            <div className={styles.parentInfo}>
              <span className={styles.parentLabel}>Thêm vào: </span>
              <span className={styles.parentName}>{parentLabel}</span>
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="category-name" className={styles.formLabel}>
              Tên danh mục
            </label>
            <input
              id="category-name"
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên danh mục..."
              disabled={isSubmitting}
              autoFocus
              className={styles.formInput}
            />
          </div>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className={styles.buttonSecondary}
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className={styles.buttonPrimary}
          >
            {isSubmitting ? 'Đang tạo...' : 'Tạo danh mục'}
          </button>
        </div>
      </form>
    </Modal>
  );
};