import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useFetcherWithReset } from "../../hooks/useFetcherWithReset";
import toast from "react-hot-toast";
import styles from "../../globals/styles/documentEditor.module.css";
import RichTextEditor from "../editor/RichTextEditor";

/**
 * DocumentEditorComponent - Component tái sử dụng cho tạo/sửa tài liệu
 * @param {Object} props
 * @param {Object|null} props.document - Tài liệu cần sửa (null nếu tạo mới)
 * @param {boolean} props.isEdit - Chế độ chỉnh sửa hay tạo mới
 * @param {string} props.apiEndpoint - API endpoint để submit (mặc định: '/api/document')
 * @param {string} props.redirectPath - Đường dẫn redirect sau khi lưu thành công
 */
export default function DocumentEditorComponent({ 
  document = null,
  isEdit = false,
  apiEndpoint = '/api/document',
  redirectPath = '/bang-dieu-khien/thong-tin-suu-tam',
  categoryId = null,
}) {
  const navigate = useNavigate();
  const fetcher = useFetcherWithReset();
  
  const [formData, setFormData] = useState({
    title: document?.title || '',
    description: document?.description || '',
    content: document?.content || '',
    categoryId: document?.categoryId || '',
    classes: document?.classes || []
  });

  const [currentClass, setCurrentClass] = useState('');

  // Reset form data khi document thay đổi
  useEffect(() => {
    if (document) {
      setFormData({
        title: document.title || '',
        description: document.description || '',
        content: document.content || '',
        categoryId: document.categoryId || '',
        classes: document.classes || []
      });
    }
  }, [document]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  const handleAddClass = () => {
    const classNum = parseInt(currentClass);
    if (classNum && !formData.classes.includes(classNum)) {
      setFormData(prev => ({
        ...prev,
        classes: [...prev.classes, classNum]
      }));
      setCurrentClass('');
    }
  };

  const handleRemoveClass = (classToRemove) => {
    setFormData(prev => ({
      ...prev,
      classes: prev.classes.filter(c => c !== classToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Vui lòng nhập nội dung');
      return;
    }

    const submitData = new FormData();
    submitData.append('intent', isEdit ? 'update' : 'create');
    
    if (isEdit && document?.id) {
      submitData.append('documentId', document.id);
    }
    
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('content', formData.content);
    submitData.append('categoryId', categoryId);
    submitData.append('classes', JSON.stringify(formData.classes));
    if (redirectPath) {
        submitData.append('redirectPath', redirectPath);
    }

    fetcher.submit(submitData, {
      action: apiEndpoint,
      method: 'post'
    });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (fetcher.data?.success) {
      toast.success(isEdit ? 'Đã cập nhật tài liệu' : 'Đã tạo tài liệu mới');
      navigate(redirectPath);
      fetcher.reset();
    } else if (fetcher.data?.error) {
      toast.error(fetcher.data.error);
      fetcher.reset();
    }
  }, [fetcher.data, isEdit, navigate, redirectPath, fetcher]);

  return (
    <div className={styles.editorWrapper}>
      <div className={styles.editorHeader}>
        <div>
          <h1 className={styles.editorTitle}>
            {isEdit ? '✏️ Chỉnh sửa tài liệu' : '➕ Tạo tài liệu mới'}
          </h1>
          <p className={styles.editorSubtitle}>
            {isEdit ? `Đang chỉnh sửa: ${document?.title}` : 'Thêm tài liệu văn học mới vào hệ thống'}
          </p>
        </div>
        <div className={styles.headerActions}>
          <button 
            type="button"
            className={styles.cancelBtn}
            onClick={handleCancel}
            disabled={fetcher.state === 'submitting'}
          >
            ❌ Hủy
          </button>
          <button 
            type="button"
            className={styles.saveBtn}
            onClick={handleSubmit}
            disabled={fetcher.state === 'submitting'}
          >
            {fetcher.state === 'submitting' ? '⏳ Đang lưu...' : '💾 Lưu tài liệu'}
          </button>
        </div>
      </div>

      <form className={styles.editorForm} onSubmit={handleSubmit}>
        {/* Tiêu đề */}
        <div className={styles.formSection}>
          <label className={styles.formLabel} htmlFor="title">
            Tiêu đề <span className={styles.required}>*</span>
          </label>
          <input
            id="title"
            type="text"
            className={styles.formInput}
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Nhập tiêu đề tài liệu..."
            required
          />
        </div>

        {/* Mô tả */}
        <div className={styles.formSection}>
          <label className={styles.formLabel} htmlFor="description">
            Mô tả ngắn
          </label>
          <textarea
            id="description"
            className={styles.formTextarea}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Nhập mô tả ngắn gọn về tài liệu..."
            rows={3}
          />
        </div>

        {/* Lớp học */}
        <div className={styles.formSection}>
          <label className={styles.formLabel}>Áp dụng cho lớp</label>
          <div className={styles.tagInput}>
            <input
              type="number"
              className={styles.formInput}
              value={currentClass}
              onChange={(e) => setCurrentClass(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddClass();
                }
              }}
              placeholder="Nhập số lớp (VD: 10) và nhấn Enter..."
              min="1"
              max="12"
            />
            <button 
              type="button" 
              className={styles.addTagBtn}
              onClick={handleAddClass}
            >
              + Thêm lớp
            </button>
          </div>
          {formData.classes.length > 0 && (
            <div className={styles.tagList}>
              {formData.classes.sort((a, b) => a - b).map((classNum, index) => (
                <span key={index} className={styles.tag}>
                  Lớp {classNum}
                  <button
                    type="button"
                    className={styles.removeTag}
                    onClick={() => handleRemoveClass(classNum)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Rich Text Editor */}
        <div className={styles.formSection}>
          <label className={styles.formLabel}>
            Nội dung <span className={styles.required}>*</span>
          </label>
          <div className={styles.editorContainer}>
            <RichTextEditor
              value={formData.content}
              onChange={handleContentChange}
            />
          </div>
        </div>

        {/* Save button at bottom */}
        <div className={styles.formActions}>
          <button 
            type="button"
            className={styles.cancelBtnLarge}
            onClick={handleCancel}
            disabled={fetcher.state === 'submitting'}
          >
            ❌ Hủy bỏ
          </button>
          <button 
            type="submit"
            className={styles.saveBtnLarge}
            disabled={fetcher.state === 'submitting'}
          >
            {fetcher.state === 'submitting' ? '⏳ Đang lưu...' : '💾 Lưu tài liệu'}
          </button>
        </div>
      </form>
    </div>
  );
}