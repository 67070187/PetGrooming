import React from 'react';

export default function AdminBookings({
  bookings = [],
  services = [],
  busyBookingId = null,
  onStatusChange,
}) {
  const sortedBookings = [...bookings].sort(
    (a, b) => a.id - b.id
  );

  const serviceMap = new Map(
    services.map((service) => [service.id, service])
  );

  function getStatus(status) {
    if (status === 'confirmed') return 'ยืนยันแล้ว';
    if (status === 'in_progress') return 'กำลังให้บริการ';
    if (status === 'completed') return 'เสร็จสิ้น';
    if (status === 'cancelled') return 'ยกเลิก';
    return status;
  }

  function getNextAction(booking) {
    if (booking.status === 'confirmed') {
      return [
        { status: 'in_progress', label: 'เริ่มให้บริการ' },
        { status: 'cancelled', label: 'ยกเลิก' },
      ];
    }

    if (booking.status === 'in_progress') {
      return [
        { status: 'completed', label: 'เสร็จสิ้น' },
      ];
    }

    return [];
  }

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <h2>การจองทั้งหมด</h2>
          <p>รายการจองของวันนี้จาก Staff API</p>
        </div>

        <span className="admin-heading-count">
          {bookings.length} รายการ
        </span>
      </div>

      <div className="admin-data-note">
        API การจองปัจจุบันส่งข้อมูลรหัสสัตว์เลี้ยงและรหัสบริการมาให้
        ส่วนข้อมูลชื่อลูกค้าและชื่อสัตว์เลี้ยงจะเชื่อมได้เมื่อมี Staff API รองรับ
      </div>

      <div className="admin-panel">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>เลขที่</th>
                <th>วันที่</th>
                <th>เวลา</th>
                <th>ลูกค้า</th>
                <th>สัตว์เลี้ยง</th>
                <th>บริการ</th>
                <th>ราคา</th>
                <th>สถานะ</th>
                <th>จัดการ</th>
              </tr>
            </thead>

            <tbody>
              {sortedBookings.length === 0 && (
                <tr>
                  <td colSpan="9" className="admin-empty-cell">
                    วันนี้ยังไม่มีรายการจอง
                  </td>
                </tr>
              )}

              {sortedBookings.map((booking) => {
                const service = serviceMap.get(booking.serviceId);
                const actions = getNextAction(booking);

                return (
                  <tr key={booking.id}>
                    <td>
                      <strong>#{booking.id}</strong>
                    </td>

                    <td>{booking.date}</td>

                    <td>
                      {booking.startTime} - {booking.endTime}
                    </td>

                    <td>ข้อมูลจาก API ยังไม่มี</td>

                    <td>#{booking.petId}</td>

                    <td>
                      {service?.name || `#${booking.serviceId}`}
                    </td>

                    <td>
                      ฿{Number(booking.priceThb || 0).toLocaleString()}
                    </td>

                    <td>
                      <span
                        className={`admin-status ${booking.status}`}
                      >
                        {getStatus(booking.status)}
                      </span>
                    </td>

                    <td>
                      <div className="admin-status-actions">
                        {actions.map((action) => (
                          <button
                            key={action.status}
                            type="button"
                            className="admin-status-button"
                            disabled={busyBookingId === booking.id}
                            onClick={() =>
                              onStatusChange(booking.id, action.status)
                            }
                          >
                            {busyBookingId === booking.id
                              ? 'กำลังบันทึก...'
                              : action.label}
                          </button>
                        ))}

                        {actions.length === 0 && (
                          <span className="admin-no-action">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
