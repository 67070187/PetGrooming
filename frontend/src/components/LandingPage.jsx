import React from 'react';
import PawMark from './PawMark';
import logo from '../assets/petgrooming-logo.png';

export default function LandingPage({
  onLogin,
  onRegister,
  onGetStarted,
  onHome,
}) {
  return (
    <div className="landing">

      {/* Header */}
      <header className="site-header">

        {/* Logo */}
        <button
          type="button"
          className="brand brand-button"
          onClick={onHome}
          aria-label="กลับหน้า Home"
        >
          <img
            className="brand-logo"
            src={logo}
            alt="PetGrooming"
          />
        </button>

        <nav
          className="header-actions"
          aria-label="บัญชีผู้ใช้"
        >
          <button
            type="button"
            className="btn-ghost"
            onClick={onLogin}
          >
            เข้าสู่ระบบ
          </button>

          <button
            type="button"
            className="btn-solid"
            onClick={onRegister}
          >
            สมัครสมาชิก
          </button>
        </nav>

      </header>

      {/* Hero */}
      <section className="hero">

        <div
          className="hero-visual"
          aria-hidden="true"
        >
          <PawMark className="paw paw-1" />
          <PawMark className="paw paw-2" />
          <PawMark className="paw paw-3" />
          <PawMark className="paw paw-4" />
        </div>

        <div className="hero-content">

          <h1>
            ดูแลน้องๆ ให้สวย สะอาด จองง่าย ไม่ต้องยืนรอให้เสียเวลา
          </h1>

          <p>
            เช็กรอบเวลาว่าง เลือกบริการอาบน้ำ-ตัดขน แล้วจองคิวให้น้องๆ ได้ง่ายๆ ในไม่กี่คลิก
          </p>

          <button
            type="button"
            className="btn-cta"
            onClick={onGetStarted}
          >
            เริ่มจองคิวเลย
          </button>

        </div>

      </section>

      {/* Footer */}
      <footer className="site-footer">

        <div className="footer-grid">

          <div>

            <button
              type="button"
              className="brand brand-on-dark brand-button"
              onClick={onHome}
              aria-label="กลับหน้า Home"
            >
              <img
                className="brand-logo"
                src={logo}
                alt="PetGrooming"
              />
            </button>

            <p className="footer-tagline">
              บริการอาบน้ำและตัดขนสัตว์เลี้ยง
              จองง่าย ไม่ยุ่งยาก
            </p>

          </div>

          <div className="footer-col">
            <h2>ติดต่อเรา</h2>
            <p>เปิดบริการทุกวัน 06:07–07:06</p>
            <p>โทร. 086-767-6767</p>
            <p>676767@676767.com</p>
          </div>

          <div className="footer-col">

            <h2>ติดตามเรา</h2>

            <div className="social-row">

              <a
                className="social-btn"
                href="#"
                aria-label="Facebook"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect
                    x="2"
                    y="2"
                    width="20"
                    height="20"
                    rx="5"
                  />

                  <path
                    d="M14 8.5h-1.5c-.6 0-1 .4-1 1V11h2.4l-.3 2.3H11.5V19H9v-5.7H7.3V11H9V9.2C9 7.2 10.2 6 12.2 6H14v2.5Z"
                    fill="var(--footer-bg)"
                  />
                </svg>
              </a>

              <a
                className="social-btn"
                href="#"
                aria-label="Instagram"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect
                    x="2"
                    y="2"
                    width="20"
                    height="20"
                    rx="6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />

                  <circle
                    cx="12"
                    cy="12"
                    r="4.2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />

                  <circle
                    cx="17.3"
                    cy="6.7"
                    r="1.1"
                  />
                </svg>
              </a>

              <a
                className="social-btn"
                href="#"
                aria-label="Line"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect
                    x="2"
                    y="4"
                    width="20"
                    height="16"
                    rx="8"
                  />

                  <text
                    x="12"
                    y="15"
                    textAnchor="middle"
                    fontSize="9"
                    fill="var(--footer-bg)"
                    fontWeight="700"
                  >
                    LINE
                  </text>
                </svg>
              </a>

            </div>

          </div>

        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} PetGrooming KMITL DevTools Project
        </div>

      </footer>

    </div>
  );
}