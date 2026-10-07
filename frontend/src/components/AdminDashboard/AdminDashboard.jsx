import React, { useEffect, useMemo, useState } from 'react';
import logo from '../../assets/petgrooming-logo.png';
import { api } from '../../services/api';

import AdminOverview from './AdminOverview';
import AdminBookings from './AdminBookings';
import AdminCustomers from './AdminCustomers';
import AdminPets from './AdminPets';
import AdminServices from './AdminServices';

import '../../styles/admin.css';

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function AdminDashboard({
  token,
  user,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [customers] = useState([]);
  const [pets] = useState([]);
  const [busyBookingId, setBusyBookingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const today = useMemo(() => getToday(), []);

  const menu = [
    { id: 'overview', label: 'ภาพรวม', icon: '▦' },
    { id: 'bookings', label: 'การจอง', icon: '▣' },
    { id: 'customers', label: 'ลูกค้า', icon: '♙' },
    { id: 'pets', label: 'สัตว์เลี้ยง', icon: '♢' },
    { id: 'services', label: 'บริการ', icon: '✦' },
  ];

  useEffect(() => {
    let cancelled = false;

    async function loadAdminData() {
      setLoading(true);
      setMessage('');

      try {
        const [bookingData, serviceData] = await Promise.all([
          api(`/staff/bookings?date=${today}`, { token }),
          api('/services'),
        ]);

        if (cancelled) return;

        setBookings(bookingData);
        setServices(serviceData);
      } catch (e) {
        if (!cancelled) {
          setMessage(e.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAdminData();

    return () => {
      cancelled = true;
    };
  }, [token, today]);

  async function handleStatusChange(bookingId, status) {
    setBusyBookingId(bookingId);
    setMessage('');

    try {
      const updated = await api(
        `/staff/bookings/${bookingId}/status`,
        {
          method: 'PATCH',
          token,
          body: JSON.stringify({ status }),
        }
      );

      setBookings((current) =>
        current.map((booking) =>
          booking.id === bookingId
            ? { ...booking, ...updated }
            : booking
        )
      );
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusyBookingId(null);
    }
  }

  function renderContent() {
    if (loading) {
      return (
        <div className="admin-loading">
          กำลังโหลดข้อมูลจากระบบ...
        </div>
      );
    }

    switch (activeTab) {
      case 'bookings':
        return (
          <AdminBookings
            bookings={bookings}
            services={services}
            busyBookingId={busyBookingId}
            onStatusChange={handleStatusChange}
          />
        );

      case 'customers':
        return <AdminCustomers customers={customers} />;

      case 'pets':
        return <AdminPets pets={pets} />;

      case 'services':
        return <AdminServices services={services} />;

      default:
        return (
          <AdminOverview
            bookings={bookings}
            customers={customers}
            pets={pets}
            services={services}
            today={today}
          />
        );
    }
  }

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src={logo} alt="PetGrooming" />

          <div>
            <strong>PetGrooming</strong>
            <span>Staff Panel</span>
          </div>
        </div>

        <nav className="admin-nav">
          {menu.map((item) => (
            <button
              key={item.id}
              type="button"
              className={
                activeTab === item.id
                  ? 'admin-nav-item active'
                  : 'admin-nav-item'
              }
              onClick={() => setActiveTab(item.id)}
            >
              <span className="admin-nav-icon">
                {item.icon}
              </span>

              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-preview-badge staff-mode-badge">
            <span></span>
            Staff Mode
          </div>

          <button
            type="button"
            className="admin-back-button"
            onClick={onLogout}
          >
            ออกจากระบบ
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1>
              {menu.find((item) => item.id === activeTab)?.label}
            </h1>

            <p>จัดการข้อมูลระบบ PetGrooming</p>
          </div>

          <div className="admin-user">
            <div className="admin-avatar">
              {(user?.name || 'S').charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{user?.name || 'Staff'}</strong>
              <span>{user?.email || 'staff'}</span>
            </div>
          </div>
        </header>

        <section className="admin-content">
          {message && (
            <div className="admin-error" role="alert">
              {message}
            </div>
          )}

          {renderContent()}
        </section>
      </main>
    </div>
  );
}
