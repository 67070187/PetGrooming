import React, { useEffect, useState } from 'react';
import { api } from './services/api';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import CustomerDashboard from './components/CustomerDashboard/CustomerDashboard';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';

function readStoredUser() {
  try {
    const stored = sessionStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [token, setToken] = useState(
    sessionStorage.getItem('token') || ''
  );

  const [user, setUser] = useState(readStoredUser);

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

  const showError = (e) => {
    setMessage(e.message);
  };

  const load = () => {
    if (!token || user?.role !== 'customer') return;

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
        const sortedServices = [...s].sort(
          (a, b) => Number(a.priceThb) - Number(b.priceThb)
        );
        setServices(sortedServices);

        if (sortedServices.length) {
          setServiceId(String(sortedServices[0].id));
        }
      })
      .catch(showError);
  }, []);

  useEffect(() => {
    if (token && user?.role === 'customer') {
      load();
    }
  }, [token, user?.role]);

  useEffect(() => {
    if (date && serviceId && user?.role === 'customer') {
      api(
        `/availability?date=${date}&serviceId=${serviceId}`
      )
        .then((d) => {
          setTimes(d.availableStartTimes);
          setTime('');
        })
        .catch(showError);
    }
  }, [date, serviceId, user?.role]);

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
        return true;
      }

      const d = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      sessionStorage.setItem('token', d.token);
      sessionStorage.setItem('user', JSON.stringify(d.user));

      setToken(d.token);
      setUser(d.user);
      setAuthOpen(false);


      return true;
    } catch (e) {
      showError(e);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function addPet(e) {
    e.preventDefault();

    setBusy(true);
    setMessage('');

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

      return true;
    } catch (e) {
      showError(e);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function book(e) {
    e.preventDefault();

    setBusy(true);
    setMessage('');

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

      load();

      const d = await api(
        `/availability?date=${date}&serviceId=${serviceId}`
      );

      setTimes(d.availableStartTimes);
      setTime('');

      return {
        success: true,
        bookingId: b.id,
        startTime: b.startTime,
        endTime: b.endTime,
      };
    } catch (e) {
      showError(e);

      return {
        success: false,
      };
    } finally {
      setBusy(false);
    }
  }

  async function cancel(id) {
    try {
      await api(`/bookings/${id}/cancel`, {
        method: 'POST',
        token,
      });

      load();

      return true;
    } catch (e) {
      showError(e);

      return false;
    }
  }

  function logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');

    setToken('');
    setUser(null);
    setPets([]);
    setBookings([]);
    setMessage('');
  }

  if (token && user?.role === 'staff') {
    return (
      <AdminDashboard
        token={token}
        user={user}
        onLogout={logout}
      />
    );
  }

  if (token && user?.role === 'customer') {
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
        time={time}
        setTime={setTime}
        bookings={bookings}
        busy={busy}
        onAddPet={addPet}
        onBook={book}
        onCancel={cancel}
        onLogout={logout}
      />
    );
  }

if (token && !user) {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  setToken('');
  return null;
}

  return (
    <>
      <LandingPage
        onLogin={() => openAuth('login')}
        onRegister={() => openAuth('register')}
        onGetStarted={() => openAuth('register')}
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
