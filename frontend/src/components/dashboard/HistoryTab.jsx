import React from 'react';

const STATUS_LABEL = {
  confirmed: 'จองแล้ว',
  in_progress: 'กำลังให้บริการ',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิกแล้ว',
};

function getPetById(pets, petId) {
  return pets.find(
    (p) => String(p.id) === String(petId)
  );
}

function getServiceById(services, serviceId) {
  return services.find(
    (s) => String(s.id) === String(serviceId)
  );
}

export default function HistoryTab({
  bookings,
  pets,
  services,
  onCancel,
}) {
  return (
    <section className="booking-history-section">
      <h2>ประวัติการจอง</h2>

      {bookings.length === 0 ? (
        <p className="empty-hint">
          ยังไม่มีการจอง
        </p>
      ) : (
        <div className="booking-history-list">
          {[...bookings]
            .sort(
              (a, b) =>
                Number(a.id) -
                Number(b.id)
            )
            .map((b) => {
              const bookingPet =
                getPetById(
                  pets,
                  b.petId
                );

              const bookingService =
                getServiceById(
                  services,
                  b.serviceId
                );

              return (
                <article
                  key={b.id}
                  className="booking-history-card"
                >
                  <div className="booking-history-top">
                    <b className="booking-history-number">
                      #{b.id}
                    </b>

                    <span
                      className={`status-badge status-${b.status}`}
                    >
                      {STATUS_LABEL[
                        b.status
                      ] || b.status}
                    </span>
                  </div>

                  <div className="booking-history-content">
                    <div className="booking-date-box">
                      <div className="booking-date-line">
                        <svg
                          className="booking-date-icon"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <rect
                            x="3"
                            y="4"
                            width="18"
                            height="17"
                            rx="3"
                          />

                          <path d="M3 9h18M8 2v4M16 2v4" />
                        </svg>

                        <div>
                          <div className="booking-date">
                            {b.date}
                          </div>
                        </div>
                      </div>

                      <div className="booking-time-line">
                        <svg
                          className="booking-date-icon"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                          />

                          <path d="M12 7v5l3 2" />
                        </svg>

                        <span>
                          {b.startTime} –{' '}
                          {b.endTime}
                        </span>
                      </div>
                    </div>

                    <div className="booking-history-details">
                      <div className="booking-detail-row">
                        <span className="booking-detail-label">
                          สัตว์เลี้ยง:
                        </span>

                        <strong>
                          {bookingPet?.name ||
                            `#${b.petId}`}
                        </strong>
                      </div>

                      <div className="booking-detail-row">
                        <span className="booking-detail-label">
                          ประเภท:
                        </span>

                        <span>
                          {bookingPet?.species ===
                          'dog'
                            ? 'สุนัข'
                            : bookingPet?.species ===
                                'cat'
                              ? 'แมว'
                              : '-'}
                        </span>
                      </div>

                      <div className="booking-detail-row">
                        <span className="booking-detail-label">
                          สายพันธุ์:
                        </span>

                        <span>
                          {bookingPet?.breed ||
                            '-'}
                        </span>
                      </div>

                      <div className="booking-detail-row">
                        <span className="booking-detail-label">
                          บริการ:
                        </span>

                        <span>
                          {bookingService?.name ||
                            `#${b.serviceId}`}
                        </span>
                      </div>

                      <div className="booking-detail-row">
                        <span className="booking-detail-label">
                          สถานะ:
                        </span>

                        <span>
                          {STATUS_LABEL[
                            b.status
                          ] || b.status}
                        </span>
                      </div>

                      <div className="booking-history-bottom">
                        <span className="booking-history-price">
                          {b.priceThb} บาท
                        </span>

                        {b.status ===
                          'confirmed' && (
                          <button
                            type="button"
                            className="booking-history-cancel"
                            onClick={() =>
                              onCancel(b.id)
                            }
                          >
                            ยกเลิก
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
        </div>
      )}
    </section>
  );
}