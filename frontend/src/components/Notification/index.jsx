import "./style.css";

function Notification({ message, type = "success", onClose }) {
  if (!message) return null;

  return (
    <div className={`notification notification-${type}`}>
      <span>{message}</span>

      <button onClick={onClose} className="notification-close">
        ×
      </button>
    </div>
  );
}

export default Notification;