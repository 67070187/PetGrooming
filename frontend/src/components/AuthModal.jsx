import React, { useEffect, useState } from 'react';

export default function AuthModal({
  mode,
  setMode,
  form,
  setForm,
  busy,
  message,
  onSubmit,
  onClose
}) {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        if (showSuccess) {
          setShowSuccess(false);
        } else {
          onClose();
        }
      }
    }

    document.addEventListener('keydown', onKey);

    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, showSuccess]);

  async function handleSubmit(e) {
    e.preventDefault();

    const result = await onSubmit(e);

    if (mode === 'register' && result === true) {
      setShowSuccess(true);
    }
  }

  function handleSuccessClose() {
    setShowSuccess(false);
    onClose();
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !showSuccess) {
          onClose();
        }
      }}
    >
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <button
          type="button"
          className="modal-close"
          aria-label="ปิด"
          onClick={onClose}
        >
          ×
        </button>

        <div className="modal-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={`modal-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            เข้าสู่ระบบ
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            className={`modal-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => setMode('register')}
          >
            สมัครสมาชิก
          </button>
        </div>

        <h2 id="auth-modal-title" className="sr-only">
          {mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
        </h2>

        {message && (
          <p role="status" className="notice">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="name-row">
              <label>
                First Name
                <input
                  type="text"
                  required
                  maxLength="50"
                  value={form.firstName || ''}
                  onChange={(e) => {
                    const firstName = e.target.value;

                    setForm({
                      ...form,
                      firstName,
                      name: `${firstName} ${form.lastName || ''}`.trim()
                    });
                  }}
                />
              </label>

              <label>
                Last Name
                <input
                  type="text"
                  required
                  maxLength="50"
                  value={form.lastName || ''}
                  onChange={(e) => {
                    const lastName = e.target.value;

                    setForm({
                      ...form,
                      lastName,
                      name: `${form.firstName || ''} ${lastName}`.trim()
                    });
                  }}
                />
              </label>
            </div>
          )}

          <label>
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value
                })
              }
            />
          </label>

          <label>
            Password
            <input
              type="password"
              required
              minLength="8"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value
                })
              }
            />
          </label>

          <button type="submit" disabled={busy}>
            {busy
              ? 'กำลังดำเนินการ...'
              : mode === 'login'
                ? 'เข้าสู่ระบบ'
                : 'สมัครสมาชิก'}
          </button>
        </form>
      </div>

      {/* ---------- Register Success Popup ---------- */}

      {showSuccess && (
        <div
          className="success-popup-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              handleSuccessClose();
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
              สมัครสมาชิกสำเร็จ!
            </h2>

            <p>
              ยินดีต้อนรับสู่ PetGrooming
            </p>

            <button
              type="button"
              onClick={handleSuccessClose}
            >
              ตกลง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}