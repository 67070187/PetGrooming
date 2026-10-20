import React from 'react';

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
}) {
  const sortedServices = [...services].sort(
    (a, b) => Number(a.priceThb) - Number(b.priceThb)
  );

  return (
    <section className="book-layout">
      <div className="service-reference">
        <h2>บริการของร้าน</h2>

        <div className="service-list">
          {sortedServices.map((s) => (
            <div
              key={s.id}
              className="service-chip"
            >
              <span className="service-chip-name">
                {s.name}
              </span>

              <span className="service-chip-meta">
                {s.durationMinutes} นาที ·{' '}
                {s.priceThb} บาท
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="book-form-panel">
        <h2>จองคิว</h2>

        {pets.length === 0 ? (
          <p className="empty-hint">
            ยังไม่มีสัตว์เลี้ยงในระบบ ไปที่แท็บ
            “สัตว์เลี้ยงของฉัน” เพื่อเพิ่มก่อนจองคิว
          </p>
        ) : (
          <form onSubmit={onBook}>
            <label>
              สัตว์เลี้ยง

              <select
                required
                value={petId}
                onChange={(e) =>
                  setPetId(e.target.value)
                }
              >
                <option value="">
                  เลือกสัตว์เลี้ยง
                </option>

                {pets.map((p) => (
                  <option
                    key={p.id}
                    value={p.id}
                  >
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              บริการ

              <select
                required
                value={serviceId}
                onChange={(e) =>
                  setServiceId(e.target.value)
                }
              >
                {sortedServices.map((s) => (
                  <option
                    key={s.id}
                    value={s.id}
                  >
                    {s.name} — {s.priceThb} บาท
                  </option>
                ))}
              </select>
            </label>

            <label>
              วันที่

              <input
                required
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(e.target.value)
                }
              />
            </label>

            <label>
              เวลาที่ว่าง

              <select
                required
                value={time}
                onChange={(e) =>
                  setTime(e.target.value)
                }
              >
                <option value="">
                  เลือกเวลา
                </option>

                {times.map((t) => (
                  <option key={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <button
              disabled={
                busy ||
                !petId ||
                !time
              }
            >
              ยืนยันการจอง
            </button>
          </form>
        )}
      </div>
    </section>
  );
}