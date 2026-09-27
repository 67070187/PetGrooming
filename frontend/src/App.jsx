import React, { useEffect, useState } from 'react';
import { api } from './services/api';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import CustomerDashboard from './components/CustomerDashboard';

export default function App() {
  const [token, setToken] = useState(sessionStorage.getItem('token') || '');
  const [authOpen, setAuthOpen] = useState(false);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [services, setServices] = useState([]);
  const [pets, setPets] = useState([]);
  const [pet, setPet] = useState({
    name: '',
    species: 'dog',
    weightKg: '',
    breed: '',
  });

  const [petId, setPetId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState('');
  const [times, setTimes] = useState([]);
  const [time, setTime] = useState('');
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const showError = (e) => setMessage(e.message);

  const load = () => {
    api('/pets', { token })
      .then((p) => {
        setPets(p);

        if (p.length) {
          setPetId(String(p[0].id));
        }
      })
      .catch(showError);

    api('/bookings', { token })
      .then(setBookings)
      .catch(showError);
  };

  useEffect(() => {
    api('/services')
      .then((s) => {
        setServices(s);

        if (s.length) {
          setServiceId(String(s[0].id));
        }
      })
      .catch(showError);
  }, []);

  useEffect(() => {
    if (token) {
      load();
    }
  }, [token]);

  useEffect(() => {
    if (date && serviceId) {
      api(`/availability?date=${date}&serviceId=${serviceId}`)
        .then((d) => {
          setTimes(d.availableStartTimes);
          setTime('');
        })
        .catch(showError);
    }
  }, [date, serviceId]);

  function openAuth(nextMode) {
    setMode(nextMode);
    setMessage('');
    setAuthOpen(true);
  }

  async function sign(e) {
    e.preventDefault();

    setBusy(true);
    setMessage('');

    try {
      if (mode === 'register') {
        await api('/auth/register', {
          method: 'POST',
          body: JSON.stringify(form),
        });

        setMode('login');
        setMessage('สมัครสำเร็จ กรุณาเข้าสู่ระบบ');
      } else {
        const d = await api('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        });

        sessionStorage.setItem('token', d.token);
        setToken(d.token);
        setAuthOpen(false);
        setMessage('เข้าสู่ระบบสำเร็จ');
      }
    } catch (e) {
      showError(e);
    } finally {
      setBusy(false);
    }
  }

  async function addPet(e) {
    e.preventDefault();

    setBusy(true);

    try {
      await api('/pets', {
        method: 'POST',
        token,
        body: JSON.stringify({
          ...pet,
          weightKg: Number(pet.weightKg),
        }),
      });

      setPet({
        name: '',
        species: 'dog',
        weightKg: '',
        breed: '',
      });

      load();
      setMessage('เพิ่มสัตว์เลี้ยงสำเร็จ');
    } catch (e) {
      showError(e);
    } finally {
      setBusy(false);
    }
  }

  async function book(e) {
    e.preventDefault();

    setBusy(true);

    try {
      const b = await api('/bookings', {
        method: 'POST',
        token,
        body: JSON.stringify({
          petId: Number(petId),
          serviceId: Number(serviceId),
          date,
          startTime: time,
        }),
      });

      setMessage(
        `จองสำเร็จ เลขที่ #${b.id} เวลา ${b.startTime}–${b.endTime}`
      );

      setTime('');
      load();

      const d = await api(
        `/availability?date=${date}&serviceId=${serviceId}`
      );

      setTimes(d.availableStartTimes);
    } catch (e) {
      showError(e);
    } finally {
      setBusy(false);
    }
  }

  async function cancel(id) {
    if (!confirm('ยืนยันยกเลิกการจอง?')) return;

    try {
      await api(`/bookings/${id}/cancel`, {
        method: 'POST',
        token,
      });

      load();
      setMessage('ยกเลิกแล้ว');
    } catch (e) {
      showError(e);
    }
  }

  function logout() {
    sessionStorage.removeItem('token');

    setToken('');
    setPets([]);
    setBookings([]);
  }

  // กด Logo เพื่อกลับหน้า Home
  function goHome() {
    logout();
    setAuthOpen(false);
    setMessage('');
  }

  if (!token) {
    return (
      <>
        <LandingPage
          onLogin={() => openAuth('login')}
          onRegister={() => openAuth('register')}
          onGetStarted={() => openAuth('register')}
          onHome={goHome}
        />

        {authOpen && (
          <AuthModal
            mode={mode}
            setMode={setMode}
            form={form}
            setForm={setForm}
            busy={busy}
            message={message}
            onSubmit={sign}
            onClose={() => setAuthOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <CustomerDashboard
      message={message}
      services={services}
      pets={pets}
      pet={pet}
      setPet={setPet}
      petId={petId}
      setPetId={setPetId}
      serviceId={serviceId}
      setServiceId={setServiceId}
      date={date}
      setDate={setDate}
      times={times}
      time={time}a
      setTime={setTime}
      bookings={bookings}
      busy={busy}
      onAddPet={addPet}
      onBook={book}
      onCancel={cancel}
      onLogout={logout}
      onHome={goHome}
    />
  );
}