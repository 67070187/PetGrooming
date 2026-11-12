import React from 'react';
import { AdminIcon } from './AdminIcons';

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
      title: 'การจองทั้งหมด',
      value: bookings.length,
      description: 'รายการจองทุกวันในระบบ',
      icon: 'calendar',
    },
    {
      title: 'คิววันนี้',
      value: todayBookings.length,
      description: 'รายการจองของวันนี้',
      icon: 'clock',
    },
    {
      title: 'ลูกค้า',
      value: customers.length,
      description: 'ข้อมูลจาก Staff API',
      icon: 'users',
    },
    {
      title: 'สัตว์เลี้ยง',
      value: pets.length,
      description: 'ข้อมูลจาก Staff API',
      icon: 'paw',
    },
    {
      title: 'บริการ',
      value: services.length,
      description: `${services.filter((service) => service.active).length} บริการเปิดให้จอง`,
      icon: 'scissors',
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
          ยังไม่มีข้อมูลลูกค้าหรือสัตว์เลี้ยงให้แสดง
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
                <AdminIcon name={stat.icon} size={20} />
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

              {todayBookings.map((booking, index) => (
                <tr key={booking.id}>
                  <td>
                    <strong>#{index + 1}</strong>
                  </td>

                  <td>
                    {booking.startTime} - {booking.endTime}
                  </td>

                  <td>{booking.petName || `#${booking.petId}`}</td>

                  <td>{booking.serviceName || `#${booking.serviceId}`}</td>

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
