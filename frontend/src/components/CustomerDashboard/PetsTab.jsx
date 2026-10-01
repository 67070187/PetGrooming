import React from 'react';

export default function PetsTab({
  pets,
  pet,
  setPet,
  busy,
  onAddPet,
}) {
  return (
    <section className="pets-layout">
      <div className="pet-form-panel">
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
              <option value="dog">
                สุนัข
              </option>

              <option value="cat">
                แมว
              </option>
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
      </div>

      <div>
        <h2>สัตว์เลี้ยงของฉัน</h2>

        {pets.length === 0 ? (
          <p className="empty-hint">
            ยังไม่มีสัตว์เลี้ยง
            เพิ่มจากฟอร์มด้านซ้ายได้เลย
          </p>
        ) : (
          <div className="pet-grid">
            {pets.map((p) => (
              <article
                key={p.id}
                className="pet-card"
              >
                <span className="pet-species-tag">
                  {p.species === 'dog'
                    ? 'สุนัข'
                    : 'แมว'}
                </span>

                <h3>{p.name}</h3>

                {p.breed && (
                  <p>{p.breed}</p>
                )}

                <p>
                  {p.weightKg} กก.
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}