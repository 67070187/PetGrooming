import React, { useEffect, useState } from 'react';
import { AdminIcon } from '../AdminDashboard/AdminIcons';
import { formatThaiDate } from './BookingTab';

const SPECIES = {
  dog: { label: 'สุนัข', className: 'dog' },
  cat: { label: 'แมว', className: 'cat' },
};

function nextBookingFor(petId, bookings) {
  const now = new Date();
  return bookings
    .filter((b) => String(b.petId) === String(petId) && b.status === 'confirmed' && new Date(`${b.date}T${b.startTime}`) >= now)
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))[0];
}

function AddPetSheet({ pet, setPet, busy, onSubmit, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="pet-sheet-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form className="pet-sheet" role="dialog" aria-modal="true" aria-labelledby="pet-sheet-title" onSubmit={onSubmit}>
        <div className="pet-sheet-head">
          <h2 id="pet-sheet-title">เพิ่มสัตว์เลี้ยง</h2>
          <button type="button" className="pet-sheet-close" aria-label="ปิด" onClick={onClose}>×</button>
        </div>

        <div className="pet-field">
          <span>ประเภท</span>
          <div className="pet-species-toggle" role="radiogroup" aria-label="ประเภท">
            {Object.entries(SPECIES).map(([value, s]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={pet.species === value}
                className={pet.species === value ? 'on' : ''}
                onClick={() => setPet({ ...pet, species: value })}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <label className="pet-field">
          <span>ชื่อ</span>
          <input
            required
            autoFocus
            maxLength="100"
            placeholder="เช่น ถุงทอง"
            value={pet.name}
            onChange={(e) => setPet({ ...pet, name: e.target.value })}
          />
        </label>

        <div className="pet-field-row">
          <label className="pet-field">
            <span>สายพันธุ์ <small>(ไม่บังคับ)</small></span>
            <input
              placeholder="เช่น ปอมเมอเรเนียน"
              value={pet.breed}
              onChange={(e) => setPet({ ...pet, breed: e.target.value })}
            />
          </label>

          <label className="pet-field">
            <span>น้ำหนัก (กก.)</span>
            <input
              required
              type="number"
              step="0.01"
              min="0.01"
              placeholder="เช่น 4.5"
              value={pet.weightKg}
              onChange={(e) => setPet({ ...pet, weightKg: e.target.value })}
            />
          </label>
        </div>

        <div className="pet-sheet-actions">
          <button type="button" className="pet-btn-secondary" onClick={onClose} disabled={busy}>ยกเลิก</button>
          <button type="submit" className="pet-btn-primary" disabled={busy}>{busy ? 'กำลังบันทึก...' : 'บันทึกสัตว์เลี้ยง'}</button>
        </div>
      </form>
    </div>
  );
}

function DeletePetConfirm({ pet, busy, onCancel, onConfirm }) {
  return (
    <div
      className="success-popup-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="success-popup cancel-confirm-popup" role="alertdialog" aria-modal="true" aria-labelledby="delete-pet-title">
        <div className="success-icon pet-delete-icon"><AdminIcon name="trash" size={26} /></div>
        <h2 id="delete-pet-title">ลบ {pet.name}?</h2>
        <p>ข้อมูลของ {pet.name} จะถูกลบออกจากบัญชีของคุณ และกู้คืนไม่ได้</p>
        <div className="cancel-confirm-actions">
          <button type="button" className="cancel-confirm-back" onClick={onCancel} disabled={busy}>กลับ</button>
          <button type="button" className="cancel-confirm-submit pet-delete-submit" onClick={onConfirm} disabled={busy}>
            {busy ? 'กำลังลบ...' : 'ลบสัตว์เลี้ยง'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PetsTab({ pets, pet, setPet, busy, bookings = [], onAddPet, onDeletePet, onBookPet }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // The API only allows deleting pets that were never booked (any status), so only those get the button.
  const bookedPetIds = new Set(bookings.map((b) => String(b.petId)));

  async function confirmDelete() {
    const target = deleting;
    setDeleting(null);
    await onDeletePet(target.id);
  }

  async function submit(e) {
    const success = await onAddPet(e);
    if (success) setSheetOpen(false);
  }

  const sheet = sheetOpen && (
    <AddPetSheet pet={pet} setPet={setPet} busy={busy} onSubmit={submit} onClose={() => setSheetOpen(false)} />
  );

  if (pets.length === 0) {
    return (
      <>
        <section className="book-empty">
          <span className="book-empty-icon"><AdminIcon name="paw" size={28} /></span>
          <h2>ยังไม่มีสัตว์เลี้ยง</h2>
          <p>เพิ่มชื่อ ประเภท และน้ำหนัก แล้วจองคิวอาบน้ำตัดขนได้ทันที</p>
          <button type="button" onClick={() => setSheetOpen(true)}>เพิ่มสัตว์เลี้ยง</button>
        </section>
        {sheet}
      </>
    );
  }

  return (
    <section className="pets-page">
      <div className="pets-heading">
        <div>
          <h2>สัตว์เลี้ยงของฉัน</h2>
          <p>{pets.length} ตัว</p>
        </div>
        <button type="button" className="pet-btn-primary" onClick={() => setSheetOpen(true)}>+ เพิ่มสัตว์เลี้ยง</button>
      </div>

      <div className="pets-grid">
        {pets.map((p) => {
          const species = SPECIES[p.species] || { label: p.species, className: 'dog' };
          const next = nextBookingFor(p.id, bookings);
          return (
            <article key={p.id} className="pet-profile">
              <div className="pet-profile-head">
                <span className={`pet-avatar ${species.className}`}><AdminIcon name="paw" size={22} /></span>
                <div>
                  <h3>{p.name}</h3>
                  <span className={`pet-species-badge ${species.className}`}>{species.label}</span>
                </div>
                {!bookedPetIds.has(String(p.id)) && (
                  <button
                    type="button"
                    className="pet-delete"
                    aria-label={`ลบ ${p.name}`}
                    title="ลบสัตว์เลี้ยง"
                    onClick={() => setDeleting(p)}
                  >
                    <AdminIcon name="trash" size={18} />
                  </button>
                )}
              </div>

              <div className="pet-profile-meta">
                {p.breed && <span>{p.breed}</span>}
                <span>{Number(p.weightKg).toLocaleString()} กก.</span>
              </div>

              {next ? (
                <p className="pet-next">คิวถัดไป {formatThaiDate(next.date)} {next.startTime}</p>
              ) : (
                <p className="pet-next none">ยังไม่มีคิว</p>
              )}

              <button type="button" className="pet-book" onClick={() => onBookPet(p.id)}>
                จองคิวให้ {p.name}
              </button>
            </article>
          );
        })}

        <button type="button" className="pet-add-card" onClick={() => setSheetOpen(true)}>
          <AdminIcon name="paw" size={24} />
          เพิ่มสัตว์เลี้ยงตัวใหม่
        </button>
      </div>

      {sheet}
      {deleting && (
        <DeletePetConfirm pet={deleting} busy={busy} onCancel={() => setDeleting(null)} onConfirm={confirmDelete} />
      )}
    </section>
  );
}
