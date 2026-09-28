import React, { useState } from 'react';
import logo from '../assets/petgrooming-logo.png';
import PawMark from './PawMark';

const STATUS_LABEL = {
  confirmed: 'จองแล้ว',
  in_progress: 'กำลังให้บริการ',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิกแล้ว',
};

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

  return (
    <div className="dashboard">
      <header className="dashboard-topbar">
        <div className="topbar-logo">
          <img className="dashboard-logo" src={logo} alt="PetGrooming" />
        </div>
        <button type="button" className="topbar-logout" onClick={onLogout}>
          <svg className="tab-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M16 8l4 4-4 4M20 12H9" />
          </svg>
          ออกจากระบบ
        </button>
      </header>

      <nav className="dashboard-tabs" role="tablist" aria-label="เมนูหลัก">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'book'}
          className={`dash-tab ${tab === 'book' ? 'active' : ''}`}
          onClick={() => setTab('book')}
        >
          <svg className="tab-icon" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="3" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
          จองคิว
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'pets'}
          className={`dash-tab ${tab === 'pets' ? 'active' : ''}`}
          onClick={() => setTab('pets')}
        >
          <PawMark className="tab-icon tab-icon-fill" />
          สัตว์เลี้ยงของฉัน
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'history'}
          className={`dash-tab ${tab === 'history' ? 'active' : ''}`}
          onClick={() => setTab('history')}
        >
          <svg className="tab-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
          </svg>
          ประวัติการจอง
        </button>
      </nav>

      <main className="dashboard-body">
        {message && <p role="status" className="notice">{message}</p>}

        {tab === 'book' && (
          <section className="book-layout">
            <div className="service-reference">
              <h2>บริการของร้าน</h2>
              <div className="service-list">
                {services.map((s) => (
                  <div key={s.id} className="service-chip">
                    <span className="service-chip-name">{s.name}</span>
                    <span className="service-chip-meta">
                      {s.durationMinutes} นาที · {s.priceThb} บาท
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="book-form-panel">
              <h2>จองคิว</h2>
              {pets.length === 0 ? (
                <p className="empty-hint">
                  ยังไม่มีสัตว์เลี้ยงในระบบ ไปที่แท็บ “สัตว์เลี้ยงของฉัน” เพื่อเพิ่มก่อนจองคิว
                </p>
              ) : (
                <form onSubmit={onBook}>
                  <label>
                    สัตว์เลี้ยง
                    <select required value={petId} onChange={(e) => setPetId(e.target.value)}>
                      <option value="">เลือกสัตว์เลี้ยง</option>
                      {pets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    บริการ
                    <select required value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} — {s.priceThb} บาท
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    วันที่
                    <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </label>
                  <label>
                    เวลาที่ว่าง
                    <select required value={time} onChange={(e) => setTime(e.target.value)}>
                      <option value="">เลือกเวลา</option>
                      {times.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                  <button disabled={busy || !petId || !time}>ยืนยันการจอง</button>
                </form>
              )}
            </div>
          </section>
        )}

        {tab === 'pets' && (
          <section className="pets-layout">
            <div className="pet-form-panel">
              <h2>เพิ่มสัตว์เลี้ยง</h2>
              <form onSubmit={onAddPet}>
                <label>
                  ชื่อ
                  <input required value={pet.name} onChange={(e) => setPet({ ...pet, name: e.target.value })} />
                </label>
                <label>
                  ประเภท
                  <select value={pet.species} onChange={(e) => setPet({ ...pet, species: e.target.value })}>
                    <option value="dog">สุนัข</option>
                    <option value="cat">แมว</option>
                  </select>
                </label>
                <label>
                  สายพันธุ์
                  <input value={pet.breed} onChange={(e) => setPet({ ...pet, breed: e.target.value })} />
                </label>
                <label>
                  น้ำหนัก (กก.)
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={pet.weightKg}
                    onChange={(e) => setPet({ ...pet, weightKg: e.target.value })}
                  />
                </label>
                <button disabled={busy}>เพิ่มสัตว์เลี้ยง</button>
              </form>
            </div>

            <div>
              <h2>สัตว์เลี้ยงของฉัน</h2>
              {pets.length === 0 ? (
                <p className="empty-hint">ยังไม่มีสัตว์เลี้ยง เพิ่มจากฟอร์มด้านซ้ายได้เลย</p>
              ) : (
                <div className="pet-grid">
                  {pets.map((p) => (
                    <article key={p.id} className="pet-card">
                      <span className="pet-species-tag">{p.species === 'dog' ? 'สุนัข' : 'แมว'}</span>
                      <h3>{p.name}</h3>
                      {p.breed && <p>{p.breed}</p>}
                      <p>{p.weightKg} กก.</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {tab === 'history' && (
          <section>
            <h2>ประวัติการจอง</h2>
            {bookings.length === 0 ? (
              <p className="empty-hint">ยังไม่มีการจอง</p>
            ) : (
              <div className="booking-list">
                {bookings.map((b) => (
                  <article key={b.id} className="booking-card">
                    <div className="booking-main">
                      <b>#{b.id}</b>
                      <span>
                        {b.date} · {b.startTime}–{b.endTime}
                      </span>
                      <span className="booking-price">{b.priceThb} บาท</span>
                    </div>
                    <div className="booking-side">
                      <span className={`status-badge status-${b.status}`}>
                        {STATUS_LABEL[b.status] || b.status}
                      </span>
                      {b.status === 'confirmed' && (
                        <button className="btn-ghost-small" onClick={() => onCancel(b.id)}>
                          ยกเลิก
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}