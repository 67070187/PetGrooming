import React, { useEffect, useRef, useState } from 'react';
import { AdminIcon, serviceIconName } from '../AdminDashboard/AdminIcons';

const REFRESH_MS = 30000;
const WEEKDAY = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
const MONTH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

const STATUS_LABEL = {
  confirmed: 'จองแล้ว',
  in_progress: 'กำลังให้บริการ',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิกแล้ว',
};

const FILTERS = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'upcoming', label: 'กำลังจะถึง' },
  { id: 'completed', label: 'เสร็จสิ้น' },
  { id: 'cancelled', label: 'ยกเลิก' },
];

// Wording and motion for the middle ("in service") step, matched to the service icon.
const SERVICE_STEP = {
  bath: { label: 'กำลังอาบน้ำ', motion: 'anim-rock' },
  scissors: { label: 'กำลังตัดขน', motion: 'anim-snip' },
  claw: { label: 'กำลังตัดเล็บ', motion: 'anim-bob' },
  sparkles: { label: 'กำลังอาบน้ำและตัดขน', motion: 'anim-twinkle' },
  paw: { label: 'กำลังให้บริการ', motion: 'anim-bob' },
};

const startOf = (b) => new Date(`${b.date}T${b.startTime}`);
const endOf = (b) => new Date(`${b.date}T${b.endTime}`);

function isUpcoming(b, now) {
  return b.status === 'in_progress' || (b.status === 'confirmed' && endOf(b) >= now);
}

function dateParts(value) {
  const [y, m, d] = value.split('-').map(Number);
  return { weekday: WEEKDAY[new Date(y, m - 1, d).getDay()], day: d, month: MONTH[m - 1] };
}

function hintFor(b, now) {
  if (b.status === 'in_progress') {
    // The shop may start before the booked time; only count down once the slot has begun.
    if (now < startOf(b)) return 'เริ่มให้บริการแล้ว';
    const mins = Math.ceil((endOf(b) - now) / 60000);
    return mins > 0 ? `เหลืออีกประมาณ ${mins} นาที` : 'ใกล้เสร็จแล้ว';
  }
  const start = startOf(b);
  const mins = Math.round((start - now) / 60000);
  if (mins <= 0) return 'ถึงเวลานัดแล้ว';
  if (mins < 60) return `อีก ${mins} นาทีถึงเวลานัด`;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((new Date(start.getFullYear(), start.getMonth(), start.getDate()) - today) / 86400000);
  if (days === 0) return `วันนี้ ${b.startTime}`;
  if (days === 1) return `พรุ่งนี้ ${b.startTime}`;
  return `อีก ${days} วันถึงเวลานัด`;
}

function StatusBadge({ status, changed }) {
  return (
    <span className={`hist-badge hb-${status} ${changed ? 'just-changed' : ''}`}>
      {(status === 'confirmed' || status === 'in_progress') && <span className="hist-dot" />}
      {status === 'completed' && (
        <svg className="hist-check" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2 6.5 5 9l5-6" />
        </svg>
      )}
      <span className="hist-badge-text">{STATUS_LABEL[status] || status}</span>
    </span>
  );
}

function StatusTracker({ booking, iconName, now }) {
  const step = SERVICE_STEP[iconName] || SERVICE_STEP.paw;
  const current = booking.status === 'in_progress' ? 1 : 0;
  const nodes = [
    { icon: 'calendar', label: 'จองแล้ว', motion: 'anim-bob' },
    { icon: iconName, label: step.label, motion: step.motion },
    { icon: 'sparkles', label: 'เสร็จแล้ว', motion: 'anim-twinkle' },
  ];

  return (
    <div className="hist-tracker">
      <div className="hist-tracker-head">
        <span>สถานะคิว</span>
        <span className={`hist-hint ${current === 1 ? 'amber' : ''}`}>{hintFor(booking, now)}</span>
      </div>
      <ol className="hist-steps">
        {nodes.map((n, i) => {
          const state = i < current ? 'done' : i === current ? 'now' : 'todo';
          return (
            <li key={i} className={`hist-step ${state} ${state === 'now' && i === 1 ? 'amber' : ''}`}>
              {i > 0 && <span className="hist-step-line"><i style={{ width: i <= current ? '100%' : '0%' }} /></span>}
              <span className="hist-step-node">
                <span className={state === 'now' ? n.motion : ''}>
                  <AdminIcon name={n.icon} size={20} />
                </span>
              </span>
              <span className="hist-step-label">{n.label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default function HistoryTab({ bookings, pets, services, onCancel, onRebook, onRefresh, onGoToBook }) {
  const [filter, setFilter] = useState('all');
  const [now, setNow] = useState(() => new Date());

  // Re-fetch bookings so status changes made by the shop show up while this tab is open.
  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
      if (onRefresh) onRefresh();
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [onRefresh]);

  // One-shot animations (pop, check, strike) play only when a status changes while the page is open.
  const seen = useRef(null);
  const changed = new Set();
  if (seen.current) {
    bookings.forEach((b) => {
      const before = seen.current.get(b.id);
      if (before && before !== b.status) changed.add(b.id);
    });
  }
  const changedRef = useRef(new Set());
  changed.forEach((id) => changedRef.current.add(id));
  useEffect(() => {
    seen.current = new Map(bookings.map((b) => [b.id, b.status]));
  }, [bookings]);

  const petOf = (b) => pets.find((p) => String(p.id) === String(b.petId));
  const serviceOf = (b) => services.find((s) => String(s.id) === String(b.serviceId));

  if (bookings.length === 0) {
    return (
      <section className="book-empty">
        <span className="book-empty-icon"><AdminIcon name="calendar" size={28} /></span>
        <h2>ยังไม่มีการจอง</h2>
        <p>เลือกบริการและเวลาที่สะดวก แล้วคิวของคุณจะมาแสดงที่นี่</p>
        <button type="button" onClick={onGoToBook}>จองคิว</button>
      </section>
    );
  }

  const upcoming = bookings.filter((b) => isUpcoming(b, now)).sort((a, b) => startOf(a) - startOf(b));
  const past = bookings.filter((b) => !isUpcoming(b, now)).sort((a, b) => startOf(b) - startOf(a));
  const showUpcoming = filter === 'all' || filter === 'upcoming' ? upcoming : [];
  const showPast = filter === 'all' ? past : filter === 'upcoming' ? [] : past.filter((b) => b.status === filter);

  return (
    <section className="hist-page">
      <div className="pets-heading">
        <div>
          <h2>ประวัติการจอง</h2>
          <p>ทั้งหมด {bookings.length} รายการ</p>
        </div>
        <div className="hist-filters" role="radiogroup" aria-label="กรองรายการ">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={filter === f.id}
              className={`hist-filter ${filter === f.id ? 'on' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {showUpcoming.length > 0 && (
        <>
          <h3 className="hist-section">กำลังจะถึง</h3>
          <div className="hist-list">
            {showUpcoming.map((b) => {
              const d = dateParts(b.date);
              const service = serviceOf(b);
              const iconName = serviceIconName(service?.name);
              return (
                <article key={b.id} className={`hist-upcoming ${b.status === 'in_progress' ? 'amber' : ''}`}>
                  <div className="hist-upcoming-main">
                    <div className="hist-date big">
                      <small>{d.weekday}</small><strong>{d.day}</strong><small>{d.month}</small>
                    </div>
                    <div className="hist-info">
                      <div className="hist-title">
                        <span>{service?.name || `บริการ #${b.serviceId}`}</span>
                        <StatusBadge status={b.status} changed={changedRef.current.has(b.id)} />
                      </div>
                      <p className="hist-sub">
                        {b.startTime} – {b.endTime} · {petOf(b)?.name || `#${b.petId}`} · ฿{Number(b.priceThb).toLocaleString()}
                      </p>
                      <p className="hist-ref">เลขที่จอง #{b.id}</p>
                    </div>
                    {b.status === 'confirmed' && (
                      <button type="button" className="hist-action danger" onClick={() => onCancel(b.id)}>
                        ยกเลิกการจอง
                      </button>
                    )}
                  </div>
                  <StatusTracker booking={b} iconName={iconName} now={now} />
                </article>
              );
            })}
          </div>
        </>
      )}

      {showPast.length > 0 && (
        <>
          <h3 className="hist-section">ที่ผ่านมา</h3>
          <div className="hist-list">
            {showPast.map((b) => {
              const d = dateParts(b.date);
              const service = serviceOf(b);
              const isChanged = changedRef.current.has(b.id);
              return (
                <article key={b.id} className={`hist-row is-${b.status}`}>
                  <div className="hist-date"><small>{d.weekday}</small><strong>{d.day}</strong><small>{d.month}</small></div>
                  <div className="hist-info">
                    <div className="hist-title">
                      <span className={b.status === 'cancelled' ? `hist-struck ${isChanged ? 'just-changed' : ''}` : ''}>
                        {service?.name || `บริการ #${b.serviceId}`}
                      </span>
                      <StatusBadge status={b.status} changed={isChanged} />
                    </div>
                    <p className="hist-sub">
                      {b.startTime} – {b.endTime} · {petOf(b)?.name || `#${b.petId}`} · ฿{Number(b.priceThb).toLocaleString()} · เลขที่จอง #{b.id}
                    </p>
                  </div>
                  {b.status === 'completed' && (
                    <button type="button" className="hist-action" onClick={() => onRebook(b)}>จองอีกครั้ง</button>
                  )}
                </article>
              );
            })}
          </div>
        </>
      )}

      {showUpcoming.length === 0 && showPast.length === 0 && (
        <p className="book-slot-empty">ไม่มีรายการในหมวดนี้</p>
      )}
    </section>
  );
}
