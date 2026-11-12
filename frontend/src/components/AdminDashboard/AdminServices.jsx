import React, { useState } from 'react';
import { api } from '../../services/api';
import { AdminIcon, serviceIconName } from './AdminIcons';

const emptyForm = { name: '', durationMinutes: '30', priceThb: '', active: true };

export default function AdminServices({ services = [], token, onServicesChange, onMessage }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const sortedServices = [...services].sort((a, b) => Number(a.priceThb) - Number(b.priceThb));

  function startAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setLocalError('');
    setShowForm(true);
  }

  function startEdit(service) {
    setEditingId(service.id);
    setForm({ name: service.name, durationMinutes: String(service.durationMinutes), priceThb: String(service.priceThb), active: service.active });
    setLocalError('');
    setShowForm(true);
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setLocalError('');
    if (onMessage) onMessage('');
    const payload = { name: form.name.trim(), durationMinutes: Number(form.durationMinutes), priceThb: Number(form.priceThb), active: Boolean(form.active) };
    try {
      const saved = await api(editingId ? `/staff/services/${editingId}` : '/staff/services', {
        method: editingId ? 'PATCH' : 'POST', token, body: JSON.stringify(payload),
      });
      onServicesChange((current) => {
        const next = editingId ? current.map((item) => item.id === saved.id ? saved : item) : [...current, saved];
        return next.sort((a, b) => Number(a.priceThb) - Number(b.priceThb));
      });
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch (error) {
      setLocalError(error.message || 'บันทึกบริการไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(service) {
    setLocalError('');
    try {
      const saved = await api(`/staff/services/${service.id}`, {
        method: 'PATCH', token, body: JSON.stringify({ active: !service.active }),
      });
      onServicesChange((current) => current.map((item) => item.id === saved.id ? saved : item).sort((a, b) => Number(a.priceThb) - Number(b.priceThb)));
    } catch (error) {
      setLocalError(error.message || 'เปลี่ยนสถานะบริการไม่สำเร็จ');
    }
  }

  async function confirmDelete() {
    const target = deleting;
    setDeleteBusy(true);
    setLocalError('');
    try {
      await api(`/staff/services/${target.id}`, { method: 'DELETE', token });
      onServicesChange((current) => current.filter((item) => item.id !== target.id));
      setDeleting(null);
    } catch (error) {
      setDeleting(null);
      setLocalError(error.message || 'ลบบริการไม่สำเร็จ');
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div><h2>บริการ</h2><p>เพิ่ม แก้ไข และเปิดหรือปิดบริการที่ลูกค้าจองได้</p></div>
        <div className="admin-service-heading-actions">
          <span className="admin-heading-count">{sortedServices.length} บริการ</span>
          <button type="button" className="admin-service-primary" onClick={startAdd}>+ เพิ่มบริการ</button>
        </div>
      </div>

      {localError && <div className="admin-error" role="alert">{localError}</div>}

      {showForm && (
        <form className="admin-service-form" onSubmit={submit}>
          <h3>{editingId ? 'แก้ไขบริการ' : 'เพิ่มบริการใหม่'}</h3>
          <label>ชื่อบริการ<input required maxLength="100" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="เช่น อาบน้ำและเป่าขน" /></label>
          <div className="admin-service-form-row">
            <label>ระยะเวลา (นาที)<input required type="number" min="1" max="540" step="1" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} /></label>
            <label>ราคา (บาท)<input required type="number" min="0" step="1" value={form.priceThb} onChange={(e) => setForm({ ...form, priceThb: e.target.value })} placeholder="เช่น 250" /></label>
          </div>
          <label className="admin-service-active-check"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> เปิดให้ลูกค้าจองบริการนี้</label>
          <div className="admin-service-form-actions">
            <button type="button" className="admin-service-secondary" onClick={() => setShowForm(false)} disabled={saving}>ยกเลิก</button>
            <button type="submit" className="admin-service-primary" disabled={saving}>{saving ? 'กำลังบันทึก...' : 'บันทึกบริการ'}</button>
          </div>
        </form>
      )}

      {!showForm && (sortedServices.length === 0 ? <div className="admin-empty-panel"><strong>ยังไม่มีบริการ</strong><p>กด “เพิ่มบริการ” เพื่อสร้างบริการแรก</p></div> : (
        <div className="admin-service-grid">
          {sortedServices.map((service) => (
            <div className={`admin-service-card ${service.active ? '' : 'inactive'}`} key={service.id}>
              <div className="admin-service-icon"><AdminIcon name={serviceIconName(service.name)} size={22} /></div>
              <div className="admin-service-info">
                <div className="admin-service-title-row"><h3>{service.name}</h3><span className={`admin-service-state ${service.active ? 'active' : 'inactive'}`}>{service.active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</span></div>
                <div className="admin-service-detail"><span>ระยะเวลา</span><strong>{service.durationMinutes} นาที</strong></div>
                <div className="admin-service-detail"><span>ราคา</span><strong>฿{Number(service.priceThb || 0).toLocaleString()}</strong></div>
                <div className="admin-service-card-actions">
                  <button type="button" className="admin-service-secondary" onClick={() => startEdit(service)}>แก้ไข</button>
                  <button type="button" className="admin-service-secondary" onClick={() => toggleActive(service)}>{service.active ? 'ปิดบริการ' : 'เปิดบริการ'}</button>
                  <button type="button" className="admin-service-delete" aria-label={`ลบ ${service.name}`} title="ลบบริการ" onClick={() => { setLocalError(''); setDeleting(service); }}>
                    <AdminIcon name="trash" size={17} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {deleting && (
        <div className="admin-confirm-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget && !deleteBusy) setDeleting(null); }}>
          <div className="admin-confirm" role="alertdialog" aria-modal="true" aria-labelledby="delete-service-title">
            <span className="admin-confirm-icon"><AdminIcon name="trash" size={24} /></span>
            <h3 id="delete-service-title">ลบบริการ “{deleting.name}”?</h3>
            <p>ลบได้เฉพาะบริการที่ยังไม่เคยมีการจอง ถ้าเคยมีการจองแล้วให้ใช้ “ปิดบริการ” แทน การลบกู้คืนไม่ได้</p>
            <div className="admin-confirm-actions">
              <button type="button" className="admin-service-secondary" onClick={() => setDeleting(null)} disabled={deleteBusy}>ยกเลิก</button>
              <button type="button" className="admin-service-danger" onClick={confirmDelete} disabled={deleteBusy}>{deleteBusy ? 'กำลังลบ...' : 'ลบบริการ'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
