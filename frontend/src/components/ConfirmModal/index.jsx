import "./style.css";

function ConfirmModal({
  title = "Confirmar ação",
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "warning",
  onConfirm,
  onCancel
}) {
  return (
    <div className="confirm-overlay">
      <div className={`confirm-box confirm-${type}`}>
        <div className="confirm-header">
          <h2>{title}</h2>
          <button
            type="button"
            className="confirm-close"
            onClick={onCancel}
          >
            ×
          </button>
        </div>

        <p className="confirm-message">{message}</p>

        <div className="confirm-actions">
          <button
            type="button"
            className="confirm-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className="confirm-button"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;