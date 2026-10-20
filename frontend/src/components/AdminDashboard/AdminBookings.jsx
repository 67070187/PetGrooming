import React, { useMemo, useState } from 'react';

export default function AdminBookings({ bookings = [], services = [], busyBookingId = null, onStatusChange }) {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const serviceMap = new Map(services.map((service) => [service.id, service]));

  function getStatus(status) {
    if (status === 'confirmed') return 'ยืนยันแล้ว';
    if (status === 'in_progress') return 'กำลังให้บริการ';
    if (status === 'completed') return 'เสร็จสิ้น';
    if (status === 'cancelled') return 'ยกเลิก';
    return status || '-';
  }

  function getNextAction(booking) {
    if (booking.status === 'confirmed') return [{ status: 'in_progress', label: 'เริ่มให้บริการ' }, { status: 'cancelled', label: 'ยกเลิก' }];
    if (booking.status === 'in_progress') return [{ status: 'completed', label: 'เสร็จสิ้น' }];
    return [];
  }

  const filteredBookings = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...bookings]
      .filter((booking) => !dateFilter || booking.date === dateFilter)
      .filter((booking) => statusFilter === 'all' || booking.status === statusFilter)
      .filter((booking) => !term || [booking.id, booking.customerName, booking.customerEmail, booking.petName, booking.serviceName, booking.petId].some((value) => String(value ?? '').toLowerCase().includes(term)))
      .sort((a, b) => `${b.date} ${b.startTime}`.localeCompare(`${a.date} ${a.startTime}`));
  }, [bookings, search, dateFilter, statusFilter]);

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div><h2>การจองทั้งหมด</h2><p>ดูรายการจองทุกวัน ค้นหา และกรองตามสถานะได้</p></div>
        <span className="admin-heading-count">{filteredBookings.length} / {bookings.length} รายการ</span>
      </div>

      <div className="admin-booking-filters">
        <label>ค้นหา<input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ชื่อลูกค้า สัตว์เลี้ยง บริการ หรือเลขที่จอง" /></label>
        <label>วันที่<input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} /></label>
        <label>สถานะ<select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="all">ทุกสถานะ</option><option value="confirmed">ยืนยันแล้ว</option><option value="in_progress">กำลังให้บริการ</option><option value="completed">เสร็จสิ้น</option><option value="cancelled">ยกเลิก</option></select></label>
        {(search || dateFilter || statusFilter !== 'all') && <button type="button" className="admin-service-secondary" onClick={() => { setSearch(''); setDateFilter(''); setStatusFilter('all'); }}>ล้างตัวกรอง</button>}
      </div>

      <div className="admin-panel">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead><tr><th>เลขที่</th><th>วันที่</th><th>เวลา</th><th>ลูกค้า</th><th>สัตว์เลี้ยง</th><th>บริการ</th><th>ราคา</th><th>สถานะ</th><th>จัดการ</th></tr></thead>
            <tbody>
              {filteredBookings.length === 0 && <tr><td colSpan="9" className="admin-empty-cell">ไม่พบรายการจองตามเงื่อนไขที่เลือก</td></tr>}
              {filteredBookings.map((booking) => {
                const service = serviceMap.get(booking.serviceId);
                const actions = getNextAction(booking);
                return <tr key={booking.id}>
                  <td><strong>#{booking.id}</strong></td>
                  <td>{booking.date}</td>
                  <td>{booking.startTime} - {booking.endTime}</td>
                  <td><strong>{booking.customerName || `ลูกค้า #${booking.customerId || '?'}`}</strong><small className="admin-cell-subtext">{booking.customerEmail || ''}</small></td>
                  <td>{booking.petName || `สัตว์เลี้ยง #${booking.petId}`}</td>
                  <td>{booking.serviceName || service?.name || `บริการ #${booking.serviceId}`}</td>
                  <td>฿{Number(booking.priceThb || 0).toLocaleString()}</td>
                  <td><span className={`admin-status ${booking.status}`}>{getStatus(booking.status)}</span></td>
                  <td><div className="admin-status-actions">{actions.map((action) => <button key={action.status} type="button" className="admin-status-button" disabled={busyBookingId === booking.id} onClick={() => onStatusChange(booking.id, action.status)}>{busyBookingId === booking.id ? 'กำลังบันทึก...' : action.label}</button>)}{actions.length === 0 && <span className="admin-no-action">—</span>}</div></td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
