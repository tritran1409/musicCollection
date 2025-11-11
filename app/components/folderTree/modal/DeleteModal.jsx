import { Modal } from "../../modal/Modal";

export const DeleteModal = ({ isOpen, onClose, title, message, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#dc3545' }}>
        {title}
      </h3>
      <p style={{ marginBottom: '24px' }}>
        {message}
      </p>
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
          onClick={onConfirm}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#dc3545',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Xóa
        </button>
      </div>
    </Modal>
  );
};