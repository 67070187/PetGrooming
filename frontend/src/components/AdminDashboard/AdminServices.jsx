import React from 'react';

export default function AdminServices({ services = [] }) {
  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <h2>บริการ</h2>
          <p>บริการที่เปิดให้ลูกค้าจองคิวจากระบบจริง</p>
        </div>

        <span className="admin-heading-count">
          {services.length} บริการ
        </span>
      </div>

      <div className="admin-service-grid">
        {services.map((service) => (
          <div className="admin-service-card" key={service.id}>
            <div className="admin-service-icon">✦</div>

            <div className="admin-service-info">
              <h3>{service.name}</h3>

              <div className="admin-service-detail">
                <span>ระยะเวลา</span>
                <strong>{service.durationMinutes} นาที</strong>
              </div>

              <div className="admin-service-detail">
                <span>ราคา</span>
                <strong>
                  ฿{Number(service.priceThb || 0).toLocaleString()}
                </strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
