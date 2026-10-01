import React from 'react';

export default function AdminBookings({
  bookings = [],
}) {
  const sortedBookings = [...bookings].sort(
    (a, b) => a.id - b.id
  );

  function getStatus(status) {
    if (status === 'confirmed') {
      return 'ยืนยันแล้ว';
    }

    if (status === 'completed') {
      return 'เสร็จสิ้น';
    }

    if (status === 'cancelled') {
      return 'ยกเลิก';
    }

    return status;
  }

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <h2>การจองทั้งหมด</h2>
          <p>
            ดูและจัดการรายการจองคิวของลูกค้า
          </p>
        </div>

        <span className="admin-heading-count">
          {bookings.length} รายการ
        </span>
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
              </tr>
            </thead>

            <tbody>
              {sortedBookings.map(
                (booking) => (
                  <tr key={booking.id}>
                    <td>
                      <strong>
                        #{booking.id}
                      </strong>
                    </td>

                    <td>{booking.date}</td>

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
                      ฿
                      {booking.priceThb.toLocaleString()}
                    </td>

                    <td>
                      <span
                        className={`admin-status ${booking.status}`}
                      >
                        {getStatus(
                          booking.status
                        )}
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