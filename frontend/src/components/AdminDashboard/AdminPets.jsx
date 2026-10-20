import React from 'react';

export default function AdminPets({ pets = [] }) {
  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <h2>สัตว์เลี้ยง</h2>
          <p>รายการสัตว์เลี้ยงที่ลงทะเบียน พร้อมข้อมูลเจ้าของ</p>
        </div>
        <span className="admin-heading-count">{pets.length} ตัว</span>
      </div>

      {pets.length === 0 ? (
        <div className="admin-empty-panel">
          <strong>ยังไม่มีข้อมูลสัตว์เลี้ยง</strong>
          <p>เมื่อมีลูกค้าลงทะเบียนสัตว์เลี้ยง รายการจะแสดงในหน้านี้</p>
        </div>
      ) : (
        <div className="admin-panel">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>สัตว์เลี้ยง</th>
                  <th>ประเภท</th>
                  <th>สายพันธุ์</th>
                  <th>น้ำหนัก</th>
                  <th>เจ้าของ</th>
                  <th>หมายเหตุการดูแล</th>
                </tr>
              </thead>
              <tbody>
                {pets.map((pet) => (
                  <tr key={pet.id}>
                    <td><strong>{pet.name}</strong></td>
                    <td>{pet.species === 'dog' ? 'สุนัข' : pet.species === 'cat' ? 'แมว' : pet.species || '-'}</td>
                    <td>{pet.breed || '-'}</td>
                    <td>{pet.weightKg != null ? `${pet.weightKg} กก.` : '-'}</td>
                    <td>{pet.ownerName || `ลูกค้า #${pet.ownerId}`}</td>
                    <td>{pet.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
