import React, { useState } from 'react';
import logo from '../../assets/petgrooming-logo.png';
import PawMark from '../PawMark';

import BookingTab from './BookingTab';
import PetsTab from './PetsTab';
import HistoryTab from './HistoryTab';
import SuccessPopup from './SuccessPopup';
import CancelConfirmPopup from './CancelConfirmPopup';

export default function CustomerDashboard({
  message,
  services,
  pets,
  pet,
  setPet,
  petId,
  setPetId,
  serviceId,
  setServiceId,
  date,
  setDate,
  times,
  time,
  setTime,
  bookings,
  busy,
  onAddPet,
  onBook,
  onCancel,
  onLogout,
}) {
  const [tab, setTab] = useState('book');

  const [successPopup, setSuccessPopup] =
    useState({
      show: false,
      title: '',
      message: '',
    });

  const [cancelPopup, setCancelPopup] =
    useState({
      show: false,
      bookingId: null,
    });

  /* =========================================================
     Success Popup
     ========================================================= */

  function showSuccessPopup(
    title,
    popupMessage
  ) {
    setSuccessPopup({
      show: true,
      title,
      message: popupMessage,
    });
  }

  function closeSuccessPopup() {
    setSuccessPopup({
      show: false,
      title: '',
      message: '',
    });
  }

  /* =========================================================
     เพิ่มสัตว์เลี้ยง
     ========================================================= */

  async function handleAddPet(e) {
    const success = await onAddPet(e);

    if (success) {
      showSuccessPopup(
        'เพิ่มสัตว์เลี้ยงสำเร็จ!',
        'เพิ่มสัตว์เลี้ยงของคุณเรียบร้อยแล้ว'
      );
    }
  }

  /* =========================================================
     จองคิว
     ========================================================= */

  async function handleBook(e) {
    const result = await onBook(e);

    if (result?.success) {
      showSuccessPopup(
        'จองคิวสำเร็จ!',
        `จองคิวเรียบร้อยแล้ว เลขที่ #${result.bookingId}`
      );
    }
  }

  /* =========================================================
     เปิด Popup ยืนยันยกเลิก
     ========================================================= */

  function handleCancelClick(id) {
    setCancelPopup({
      show: true,
      bookingId: id,
    });
  }

  function closeCancelPopup() {
    setCancelPopup({
      show: false,
      bookingId: null,
    });
  }

  /* =========================================================
     ยืนยันยกเลิก
     ========================================================= */

  async function confirmCancel() {
    if (!cancelPopup.bookingId) {
      return;
    }

    const bookingId =
      cancelPopup.bookingId;

    closeCancelPopup();

    const success =
      await onCancel(bookingId);

    if (success) {
      showSuccessPopup(
        'ยกเลิกการจองสำเร็จ!',
        'ยกเลิกการจองของคุณเรียบร้อยแล้ว'
      );
    }
  }

  return (
    <div className="dashboard">

      {/* =====================================================
          Topbar
         ===================================================== */}

      <header className="dashboard-topbar">
        <div className="topbar-logo">
          <img
            className="dashboard-logo"
            src={logo}
            alt="PetGrooming"
          />
        </div>

        <button
          type="button"
          className="topbar-logout"
          onClick={onLogout}
        >
          <svg
            className="tab-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M16 8l4 4-4 4M20 12H9" />
          </svg>

          ออกจากระบบ
        </button>
      </header>

      {/* =====================================================
          Tabs
         ===================================================== */}

      <nav
        className="dashboard-tabs"
        role="tablist"
        aria-label="เมนูหลัก"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'book'}
          className={`dash-tab ${
            tab === 'book'
              ? 'active'
              : ''
          }`}
          onClick={() => setTab('book')}
        >
          <svg
            className="tab-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <rect
              x="3"
              y="5"
              width="18"
              height="16"
              rx="3"
            />

            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>

          จองคิว
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={tab === 'pets'}
          className={`dash-tab ${
            tab === 'pets'
              ? 'active'
              : ''
          }`}
          onClick={() => setTab('pets')}
        >
          <PawMark className="tab-icon tab-icon-fill" />

          สัตว์เลี้ยงของฉัน
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={tab === 'history'}
          className={`dash-tab ${
            tab === 'history'
              ? 'active'
              : ''
          }`}
          onClick={() => setTab('history')}
        >
          <svg
            className="tab-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
          </svg>

          ประวัติการจอง
        </button>
      </nav>

      {/* =====================================================
          Body
         ===================================================== */}

      <main className="dashboard-body">

        {message &&
          message !==
            'เพิ่มสัตว์เลี้ยงสำเร็จ' && (
            <p
              role="status"
              className="notice"
            >
              {message}
            </p>
          )}

        {/* จองคิว */}

        {tab === 'book' && (
          <BookingTab
            services={services}
            pets={pets}
            petId={petId}
            setPetId={setPetId}
            serviceId={serviceId}
            setServiceId={setServiceId}
            date={date}
            setDate={setDate}
            times={times}
            time={time}
            setTime={setTime}
            busy={busy}
            onBook={handleBook}
          />
        )}

        {/* สัตว์เลี้ยง */}

        {tab === 'pets' && (
          <PetsTab
            pets={pets}
            pet={pet}
            setPet={setPet}
            busy={busy}
            onAddPet={handleAddPet}
          />
        )}

        {/* ประวัติ */}

        {tab === 'history' && (
          <HistoryTab
            bookings={bookings}
            pets={pets}
            services={services}
            onCancel={handleCancelClick}
          />
        )}

      </main>

      {/* Popup สำเร็จ */}

      <SuccessPopup
        show={successPopup.show}
        title={successPopup.title}
        message={successPopup.message}
        onClose={closeSuccessPopup}
      />

      {/* Popup ยืนยันยกเลิก */}

      <CancelConfirmPopup
        show={cancelPopup.show}
        onClose={closeCancelPopup}
        onConfirm={confirmCancel}
      />

    </div>
  );
}