import React from 'react';

export default function AdminPets({
  pets = [],
}) {
  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <h2>สัตว์เลี้ยง</h2>
          <p>
            ข้อมูลสัตว์เลี้ยงของลูกค้า
          </p>
        </div>

        <span className="admin-heading-count">
          {pets.length} ตัว
        </span>
      </div>

      <div className="admin-panel">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ชื่อ</th>
                <th>ประเภท</th>
                <th>สายพันธุ์</th>
                <th>น้ำหนัก</th>
                <th>เจ้าของ</th>
              </tr>
            </thead>

            <tbody>
              {pets.map((pet) => (
                <tr key={pet.id}>
                  <td>
                    <strong>
                      {pet.name}
                    </strong>
                  </td>

                  <td>{pet.species}</td>

                  <td>{pet.breed}</td>

                  <td>
                    {pet.weightKg} กก.
                  </td>

                  <td>{pet.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}