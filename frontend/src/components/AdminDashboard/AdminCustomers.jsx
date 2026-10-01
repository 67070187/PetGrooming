import React from 'react';

export default function AdminCustomers({
  customers = [],
}) {
  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <h2>ลูกค้า</h2>
          <p>
            รายชื่อลูกค้าที่ใช้งานระบบ
          </p>
        </div>

        <span className="admin-heading-count">
          {customers.length} คน
        </span>
      </div>

      <div className="admin-panel">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ลูกค้า</th>
                <th>อีเมล</th>
                <th>สัตว์เลี้ยง</th>
                <th>ประวัติการจอง</th>
              </tr>
            </thead>

            <tbody>
              {customers.map(
                (customer) => (
                  <tr key={customer.id}>
                    <td>
                      <strong>
                        {customer.name}
                      </strong>
                    </td>

                    <td>
                      {customer.email}
                    </td>

                    <td>
                      {customer.petCount} ตัว
                    </td>

                    <td>
                      {customer.bookingCount}{' '}
                      รายการ
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}