import React from 'react';

export default function AdminOverview({
  bookings = [],
  customers = [],
  pets = [],
  services = [],
}) {
  const todayBookings = bookings.filter(
    (booking) =>
      booking.date === '2026-10-01'
  );

  const stats = [
    {
      title: 'คิววันนี้',
      value: todayBookings.length,
      description: 'รายการจองทั้งหมดวันนี้',
      icon: '▣',
    },
    {
      title: 'ลูกค้า',
      value: customers.length,
      description: 'บัญชีลูกค้าทั้งหมด',
      icon: '♙',
    },
    {
      title: 'สัตว์เลี้ยง',
      value: pets.length,
      description: 'สัตว์เลี้ยงในระบบ',
      icon: '♢',
    },
    {
      title: 'บริการ',
      value: services.length,
      description: 'บริการที่เปิดให้จอง',
      icon: '✦',
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <h2>ภาพรวมระบบ</h2>
          <p>
            สรุปข้อมูลการให้บริการ PetGrooming
          </p>
        </div>
      </div>

      <div className="admin-stat-grid">
        {stats.map((stat) => (
          <div
            className="admin-stat-card"
            key={stat.title}
          >
            <div className="admin-stat-top">
              <div>
                <span className="admin-stat-title">
                  {stat.title}
                </span>

                <strong>
                  {stat.value}
                </strong>
              </div>

              <div className="admin-stat-icon">
                {stat.icon}
              </div>
            </div>

            <p>{stat.description}</p>
          </div>
        ))}
      </div>

      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h3>การจองวันนี้</h3>
            <p>
              รายการคิวที่กำลังให้บริการ
            </p>
          </div>

          <span className="admin-count">
            {todayBookings.length} รายการ
          </span>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>เลขที่</th>
                <th>เวลา</th>
                <th>ลูกค้า</th>
                <th>สัตว์เลี้ยง</th>
                <th>บริการ</th>
                <th>สถานะ</th>
              </tr>
            </thead>

            <tbody>
              {todayBookings.map(
                (booking) => (
                  <tr key={booking.id}>
                    <td>
                      <strong>
                        #{booking.id}
                      </strong>
                    </td>

                    <td>
                      {booking.startTime} -{' '}
                      {booking.endTime}
                    </td>

                    <td>
                      {booking.customer}
                    </td>

                    <td>
                      {booking.pet}
                    </td>

                    <td>
                      {booking.service}
                    </td>

                    <td>
                      <span
                        className={`admin-status ${booking.status}`}
                      >
                        {booking.status ===
                          'confirmed' &&
                          'ยืนยันแล้ว'}

                        {booking.status ===
                          'completed' &&
                          'เสร็จสิ้น'}

                        {booking.status ===
                          'cancelled' &&
                          'ยกเลิก'}
                      </span>
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