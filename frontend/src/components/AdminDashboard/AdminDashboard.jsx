import React, { useState } from 'react';
import logo from '../../assets/petgrooming-logo.png';

import AdminOverview from './AdminOverview';
import AdminBookings from './AdminBookings';
import AdminCustomers from './AdminCustomers';
import AdminPets from './AdminPets';
import AdminServices from './AdminServices';

import '../../styles/admin.css';

const mockServices = [
  {
    id: 1,
    name: 'อาบน้ำ',
    durationMinutes: 60,
    priceThb: 300,
  },
  {
    id: 2,
    name: 'ตัดขน',
    durationMinutes: 90,
    priceThb: 450,
  },
  {
    id: 3,
    name: 'ตัดเล็บ',
    durationMinutes: 20,
    priceThb: 100,
  },
  {
    id: 4,
    name: 'อาบน้ำ + ตัดขน',
    durationMinutes: 120,
    priceThb: 650,
  },
];

const mockCustomers = [
  {
    id: 1,
    name: 'สมชาย ใจดี',
    email: 'somchai@example.com',
    petCount: 2,
    bookingCount: 5,
  },
  {
    id: 2,
    name: 'สุดา พักดี',
    email: 'suda@example.com',
    petCount: 1,
    bookingCount: 3,
  },
  {
    id: 3,
    name: 'กิตติ วัฒนะ',
    email: 'kitti@example.com',
    petCount: 3,
    bookingCount: 7,
  },
];

const mockPets = [
  {
    id: 1,
    name: 'Milo',
    species: 'สุนัข',
    breed: 'Golden Retriever',
    weightKg: 18,
    owner: 'สมชาย ใจดี',
  },
  {
    id: 2,
    name: 'Mochi',
    species: 'แมว',
    breed: 'Persian',
    weightKg: 4.5,
    owner: 'สมชาย ใจดี',
  },
  {
    id: 3,
    name: 'Lucky',
    species: 'สุนัข',
    breed: 'Poodle',
    weightKg: 7,
    owner: 'สุดา พักดี',
  },
  {
    id: 4,
    name: 'Coco',
    species: 'แมว',
    breed: 'Scottish Fold',
    weightKg: 4,
    owner: 'กิตติ วัฒนะ',
  },
];

const mockBookings = [
  {
    id: 1,
    date: '2026-10-01',
    startTime: '09:00',
    endTime: '10:00',
    customer: 'สมชาย ใจดี',
    pet: 'Milo',
    service: 'อาบน้ำ',
    priceThb: 300,
    status: 'confirmed',
  },
  {
    id: 2,
    date: '2026-10-01',
    startTime: '10:30',
    endTime: '12:00',
    customer: 'สุดา พักดี',
    pet: 'Lucky',
    service: 'ตัดขน',
    priceThb: 450,
    status: 'confirmed',
  },
  {
    id: 3,
    date: '2026-10-01',
    startTime: '13:00',
    endTime: '13:20',
    customer: 'กิตติ วัฒนะ',
    pet: 'Coco',
    service: 'ตัดเล็บ',
    priceThb: 100,
    status: 'completed',
  },
  {
    id: 4,
    date: '2026-10-01',
    startTime: '14:00',
    endTime: '16:00',
    customer: 'สมชาย ใจดี',
    pet: 'Mochi',
    service: 'อาบน้ำ + ตัดขน',
    priceThb: 650,
    status: 'cancelled',
  },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const menu = [
    {
      id: 'overview',
      label: 'ภาพรวม',
      icon: '▦',
    },
    {
      id: 'bookings',
      label: 'การจอง',
      icon: '▣',
    },
    {
      id: 'customers',
      label: 'ลูกค้า',
      icon: '♙',
    },
    {
      id: 'pets',
      label: 'สัตว์เลี้ยง',
      icon: '♢',
    },
    {
      id: 'services',
      label: 'บริการ',
      icon: '✦',
    },
  ];

  function renderContent() {
    switch (activeTab) {
      case 'bookings':
        return (
          <AdminBookings
            bookings={mockBookings}
          />
        );

      case 'customers':
        return (
          <AdminCustomers
            customers={mockCustomers}
          />
        );

      case 'pets':
        return (
          <AdminPets
            pets={mockPets}
          />
        );

      case 'services':
        return (
          <AdminServices
            services={mockServices}
          />
        );

      default:
        return (
          <AdminOverview
            bookings={mockBookings}
            customers={mockCustomers}
            pets={mockPets}
            services={mockServices}
          />
        );
    }
  }

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img
            src={logo}
            alt="PetGrooming"
          />

          <div>
            <strong>PetGrooming</strong>
            <span>Admin Panel</span>
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
          <div className="admin-preview-badge">
            <span></span>
            Preview Mode
          </div>

          <button
            type="button"
            className="admin-back-button"
            onClick={() => {
              window.location.href = '/';
            }}
          >
            ← กลับหน้าเว็บไซต์
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1>
              {menu.find(
                (item) => item.id === activeTab
              )?.label}
            </h1>

            <p>
              จัดการข้อมูลระบบ PetGrooming
            </p>
          </div>

          <div className="admin-user">
            <div className="admin-avatar">
              A
            </div>

            <div>
              <strong>Admin</strong>
              <span>ผู้ดูแลระบบ</span>
            </div>
          </div>
        </header>

        <section className="admin-content">
          {renderContent()}
        </section>
      </main>
    </div>
  );
}