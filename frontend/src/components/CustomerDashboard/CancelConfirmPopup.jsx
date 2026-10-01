import React from 'react';

export default function CancelConfirmPopup({
  show,
  onClose,
  onConfirm,
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
        className="success-popup cancel-confirm-popup"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cancel-confirm-title"
      >
        <div className="success-icon cancel-confirm-icon">
          ?
        </div>

        <h2 id="cancel-confirm-title">
          ยกเลิกการจอง?
        </h2>

        <p>
          คุณต้องการยกเลิกการจองนี้ใช่หรือไม่
        </p>

        <div className="cancel-confirm-actions">
          <button
            type="button"
            className="cancel-confirm-back"
            onClick={onClose}
          >
            กลับ
          </button>

          <button
            type="button"
            className="cancel-confirm-submit"
            onClick={onConfirm}
          >
            ยืนยันยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
}