const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function api(path, opts = {}) {
  const r = await fetch(API + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
  });
  const data = await r.json();
  if (!r.ok) {
    const err = new Error(data.message || 'เกิดข้อผิดพลาด');
    err.status = r.status;
    err.code = data.code;
    throw err;
  }
  return data;
}