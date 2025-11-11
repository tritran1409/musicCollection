import { useState } from "react";
import { Modal } from "../../modal/Modal";

export const EditCategoryModal = ({ isOpen, onClose, currentName, onSubmit }) => {
  const [name, setName] = useState(currentName);

  const handleSubmit = () => {
    if (name.trim() && name !== currentName) {
      onSubmit(name);
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 style={{ marginTop: 0, marginBottom: '16px' }}>
        Chỉnh sửa danh mục
      </h3>
      <div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tên danh mục"
          autoFocus
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#007bff',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Cập nhật
          </button>
        </div>
      </div>
    </Modal>
  );
};