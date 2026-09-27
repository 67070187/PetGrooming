import React from 'react';
import logo from '../assets/petgrooming-logo.png';

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
  onHome,
}) {
  return (
    <main>

      <header>

        <button
          type="button"
          className="dashboard-logo-button"
          onClick={onHome}
          aria-label="กลับหน้า Home"
        >
          <img
            src={logo}
            className="dashboard-logo"
            alt="PetGrooming"
          />
        </button>

        <p>
          ระบบจองคิวอาบน้ำและตัดขนสัตว์เลี้ยง
        </p>

      </header>

      {message && (
        <p
          role="status"
          className="notice"
        >
          {message}
        </p>
      )}

      <section>

        <h2>บริการของร้าน</h2>

        <div className="cards">

          {services.map((s) => (
            <article key={s.id}>

              <h3>{s.name}</h3>

              <p>
                {s.durationMinutes} นาที
              </p>

              <strong>
                {s.priceThb} บาท
              </strong>

            </article>
          ))}

        </div>

      </section>

      <button
        className="link"
        onClick={onLogout}
      >
        ออกจากระบบ
      </button>

      <section>

        <h2>เพิ่มสัตว์เลี้ยง</h2>

        <form onSubmit={onAddPet}>

          <label>
            ชื่อ

            <input
              required
              value={pet.name}
              onChange={(e) =>
                setPet({
                  ...pet,
                  name: e.target.value,
                })
              }
            />
          </label>

          <label>
            ประเภท

            <select
              value={pet.species}
              onChange={(e) =>
                setPet({
                  ...pet,
                  species: e.target.value,
                })
              }
            >
              <option value="dog">สุนัข</option>
              <option value="cat">แมว</option>
            </select>
          </label>

          <label>
            สายพันธุ์

            <input
              value={pet.breed}
              onChange={(e) =>
                setPet({
                  ...pet,
                  breed: e.target.value,
                })
              }
            />
          </label>

          <label>
            น้ำหนัก (กก.)

            <input
              required
              type="number"
              step="0.01"
              min="0.01"
              value={pet.weightKg}
              onChange={(e) =>
                setPet({
                  ...pet,
                  weightKg: e.target.value,
                })
              }
            />
          </label>

          <button disabled={busy}>
            เพิ่มสัตว์เลี้ยง
          </button>

        </form>

      </section>

      <section>

        <h2>จองคิว</h2>

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
              {services.map((s) => (
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

      </section>

      <section>

        <h2>ประวัติการจอง</h2>

        {bookings.length === 0 ? (

          <p>
            ยังไม่มีการจอง
          </p>

        ) : (

          bookings.map((b) => (

            <article key={b.id}>

              <b>#{b.id}</b>
              {' — '}
              {b.date}
              {' '}
              {b.startTime}
              –
              {b.endTime}
              {' '}
              ({b.status})
              {' — '}
              {b.priceThb} บาท{' '}

              {b.status === 'confirmed' && (
                <button
                  onClick={() =>
                    onCancel(b.id)
                  }
                >
                  ยกเลิก
                </button>
              )}

            </article>

          ))

        )}

      </section>

    </main>
  );
}