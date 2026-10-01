import React from 'react';
import PawMark from './PawMark';
import logo from '../assets/petgrooming-logo.png';
import ig from '../assets/ig.png';
import git from '../assets/github.svg'

export default function LandingPage({
  onLogin,
  onRegister,
  onGetStarted,
  onHome,
}) {
  return (
    <div className="landing">

      {/* ==================== Header ==================== */}
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

        {/* Header Actions */}
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

      {/* ==================== Hero ==================== */}
      <section className="hero">

        {/* Paw Background */}
        <div
          className="hero-visual"
          aria-hidden="true"
        >
          <PawMark className="paw paw-1" />
          <PawMark className="paw paw-2" />
          <PawMark className="paw paw-3" />
          <PawMark className="paw paw-4" />
        </div>

        {/* Hero Content */}
        <div className="hero-content">

          <h1>
            ดูแลน้อง ๆ ให้สวย สะอาด
            <br />
            จองง่าย ไม่ต้องยืนรอให้เสียเวลา
          </h1>

          <p>
            เช็กรอบเวลาว่าง เลือกบริการอาบน้ำ-ตัดขน
            แล้วจองคิวให้น้องๆ ได้ง่ายๆ ในไม่กี่คลิก
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

      {/* ==================== Footer ==================== */}
      <footer className="site-footer">

        <div className="footer-grid">

          {/* Brand */}
          <div className="footer-brand">

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
              <br />
              จองง่าย ไม่ยุ่งยาก
            </p>

          </div>

          {/* Contact */}
          <div className="footer-col">

            <h2>
              ติดต่อเราได้ที่ :
            </h2>

            <p>
              เปิดบริการทุกวัน 06:07–07:06
            </p>

            <p>
              โทร. 086-767-6767
            </p>

            <p>
              676767@676767.com
            </p>

          </div>

          {/* Social */}
          <div className="footer-col">

            <h2>
              ติดตามเราได้ที่ :
            </h2>

           <div className="social-row">

          <a
            className="social-btn"
            href="https://www.instagram.com/s.alixm.s/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <img src={ig} alt="ig" />
          </a>

          <a
            className="social-btn"
            href="https://github.com/67070187/PetGrooming"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <img src={git} alt="github" />
          </a>

        </div>

          </div>

        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          © {new Date().getFullYear()} PetGrooming KMITL DevTools Project
        </div>

      </footer>

    </div>
  );
}