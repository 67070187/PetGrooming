import React from 'react';

export default function SuccessPopup({
  show,
  title,
  message,
  onClose,
}) {
  if (!show) {
    return null;
  }

  return (
    <div
      className="success-popup-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="success-popup"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="success-popup-title"
      >
        <div className="success-icon">
          ✓
        </div>

        <h2 id="success-popup-title">
          {title}
        </h2>

        <p>
          {message}
        </p>

        <button
          type="button"
          onClick={onClose}
        >
          ตกลง
        </button>
      </div>
    </div>
  );
}