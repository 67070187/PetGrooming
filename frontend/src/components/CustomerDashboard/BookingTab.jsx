import React, { useEffect, useMemo } from 'react';
import { AdminIcon, serviceIconName } from '../AdminDashboard/AdminIcons';

const DAYS_AHEAD = 14;
const WEEKDAY = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
const MONTH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const SPECIES = { dog: 'สุนัข', cat: 'แมว' };

// YYYY-MM-DD in the browser's local time (toISOString would shift to UTC).
function toDateValue(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatThaiDate(value) {
  if (!value) return '';
  const [y, m, d] = value.split('-').map(Number);
  const day = new Date(y, m - 1, d);
  return `${WEEKDAY[day.getDay()]} ${d} ${MONTH[m - 1]}`;
}

function Step({ number, title, children }) {
  return (
    <div className="book-step">
      <p className="book-step-title">
        <span className="book-step-num">{number}</span>
        {title}
      </p>
      {children}
    </div>
  );
}

export default function BookingTab({
  services,
  pets,
  petId,
  setPetId,
  serviceId,
  setServiceId,
  date,
  setDate,
  times,
  time,
  setTime,
  busy,
  onBook,
  onGoToPets,
}) {
  const sortedServices = useMemo(
    () => [...services].sort((a, b) => Number(a.priceThb) - Number(b.priceThb)),
    [services]
  );

  const days = useMemo(() => {
    const start = new Date();
    return Array.from({ length: DAYS_AHEAD }, (_, i) => {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      return { value: toDateValue(d), weekday: i === 0 ? 'วันนี้' : WEEKDAY[d.getDay()], day: d.getDate() };
    });
  }, []);

  // Start on today so customers see open slots straight away.
  useEffect(() => {
    if (!date) setDate(days[0].value);
  }, [date, days, setDate]);

  const selectedPet = pets.find((p) => String(p.id) === String(petId));
  const selectedService = sortedServices.find((s) => String(s.id) === String(serviceId));
  const ready = Boolean(selectedPet && selectedService && date && time);

  if (pets.length === 0) {
    return (
      <section className="book-empty">
        <span className="book-empty-icon"><AdminIcon name="paw" size={28} /></span>
        <h2>เพิ่มสัตว์เลี้ยงก่อนจองคิว</h2>
        <p>กรอกชื่อ ประเภท และน้ำหนักสักนิด แล้วกลับมาเลือกบริการและเวลาได้เลย</p>
        <button type="button" onClick={onGoToPets}>เพิ่มสัตว์เลี้ยง</button>
      </section>
    );
  }

  return (
    <form className="book-flow" onSubmit={onBook}>
      <div className="book-steps">
        <Step number="1" title="เลือกสัตว์เลี้ยง">
          <div className="book-pet-list" role="radiogroup" aria-label="สัตว์เลี้ยง">
            {pets.map((p) => {
              const on = String(p.id) === String(petId);
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  className={`book-pet ${on ? 'on' : ''}`}
                  onClick={() => setPetId(String(p.id))}
                >
                  <AdminIcon name="paw" size={16} />
                  <span>{p.name}</span>
                  {SPECIES[p.species] && <small>{SPECIES[p.species]}</small>}
                </button>
              );
            })}
            <button type="button" className="book-pet book-pet-add" onClick={onGoToPets}>
              + เพิ่มสัตว์เลี้ยง
            </button>
          </div>
        </Step>

        <Step number="2" title="เลือกบริการ">
          <div className="book-service-grid" role="radiogroup" aria-label="บริการ">
            {sortedServices.map((s) => {
              const on = String(s.id) === String(serviceId);
              return (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  className={`book-service ${on ? 'on' : ''}`}
                  onClick={() => setServiceId(String(s.id))}
                >
                  <span className="book-service-icon"><AdminIcon name={serviceIconName(s.name)} size={20} /></span>
                  <strong>{s.name}</strong>
                  <span className="book-service-meta">
                    {s.durationMinutes} นาที · ฿{Number(s.priceThb).toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>
        </Step>

        <Step number="3" title="เลือกวันและเวลา">
          <div className="book-day-strip" role="radiogroup" aria-label="วันที่">
            {days.map((d) => {
              const on = d.value === date;
              return (
                <button
                  key={d.value}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  className={`book-day ${on ? 'on' : ''}`}
                  onClick={() => setDate(d.value)}
                >
                  <small>{d.weekday}</small>
                  <strong>{d.day}</strong>
                </button>
              );
            })}
          </div>

          {times.length === 0 ? (
            <p className="book-slot-empty">วันที่เลือกไม่มีเวลาว่างแล้ว ลองเลือกวันอื่น</p>
          ) : (
            <div className="book-slot-grid" role="radiogroup" aria-label="เวลาที่ว่าง">
              {times.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={t === time}
                  className={`book-slot ${t === time ? 'on' : ''}`}
                  onClick={() => setTime(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </Step>
      </div>

      <aside className="book-summary" aria-label="สรุปการจอง">
        <h3>สรุปการจอง</h3>
        <dl>
          <div><dt><AdminIcon name="paw" size={16} />สัตว์เลี้ยง</dt><dd>{selectedPet?.name || '—'}</dd></div>
          <div><dt><AdminIcon name="scissors" size={16} />บริการ</dt><dd>{selectedService?.name || '—'}</dd></div>
          <div><dt><AdminIcon name="calendar" size={16} />วัน</dt><dd>{formatThaiDate(date) || '—'}</dd></div>
          <div><dt><AdminIcon name="clock" size={16} />เวลา</dt><dd>{time || 'ยังไม่ได้เลือก'}</dd></div>
        </dl>
        <div className="book-summary-total">
          <span>รวม</span>
          <strong>฿{Number(selectedService?.priceThb || 0).toLocaleString()}</strong>
        </div>
        <button type="submit" className="book-confirm" disabled={busy || !ready}>
          {busy ? 'กำลังจอง...' : ready ? 'ยืนยันการจอง' : 'เลือกเวลาเพื่อจอง'}
        </button>
        <p className="book-summary-note">ยกเลิกได้ภายหลังที่แท็บประวัติการจอง</p>
      </aside>
    </form>
  );
}
