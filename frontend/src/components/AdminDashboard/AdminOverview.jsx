import React from 'react';

export default function AdminOverview({
  bookings = [],
  customers = [],
  pets = [],
  services = [],
  today,
}) {
  const todayBookings = bookings.filter(
    (booking) => booking.date === today
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
      description: 'ข้อมูลจาก Staff API',
      icon: '♙',
    },
    {
      title: 'สัตว์เลี้ยง',
      value: pets.length,
      description: 'ข้อมูลจาก Staff API',
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
          <p>สรุปข้อมูลการให้บริการ PetGrooming</p>
        </div>
      </div>

      {(customers.length === 0 || pets.length === 0) && (
        <div className="admin-data-note">
          ข้อมูลลูกค้าและสัตว์เลี้ยงยังไม่มี Staff API ใน Backend จึงยังไม่แสดงข้อมูลจำลอง
        </div>
      )}

      <div className="admin-stat-grid">
        {stats.map((stat) => (
          <div className="admin-stat-card" key={stat.title}>
            <div className="admin-stat-top">
              <div>
                <span className="admin-stat-title">
                  {stat.title}
                </span>

                <strong>{stat.value}</strong>
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
            <p>รายการคิวที่กำลังให้บริการ</p>
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
                <th>สัตว์เลี้ยง</th>
                <th>บริการ</th>
                <th>สถานะ</th>
              </tr>
            </thead>

            <tbody>
              {todayBookings.length === 0 && (
                <tr>
                  <td colSpan="5" className="admin-empty-cell">
                    วันนี้ยังไม่มีรายการจอง
                  </td>
                </tr>
              )}

              {todayBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <strong>#{booking.id}</strong>
                  </td>

                  <td>
                    {booking.startTime} - {booking.endTime}
                  </td>

                  <td>#{booking.petId}</td>

                  <td>#{booking.serviceId}</td>

                  <td>
                    <span
                      className={`admin-status ${booking.status}`}
                    >
                      {booking.status === 'confirmed' && 'ยืนยันแล้ว'}
                      {booking.status === 'in_progress' && 'กำลังให้บริการ'}
                      {booking.status === 'completed' && 'เสร็จสิ้น'}
                      {booking.status === 'cancelled' && 'ยกเลิก'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
