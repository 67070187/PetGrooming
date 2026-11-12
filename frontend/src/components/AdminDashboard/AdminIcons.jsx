import React from 'react';

// Line icons (24x24, stroke = currentColor) so they follow the surrounding text colour.
const paths = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4.5" width="18" height="16.5" rx="2" />
      <path d="M8 2.5v4M16 2.5v4M3 9.5h18" />
      <path d="m9 15 2 2 4-4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.3c2 .8 3.5 2.8 3.5 5.7" />
    </>
  ),
  paw: (
    <g fill="currentColor" stroke="none">
      <ellipse cx="5.2" cy="10.6" rx="2.1" ry="2.6" />
      <ellipse cx="9.4" cy="6" rx="2.1" ry="2.7" />
      <ellipse cx="14.6" cy="6" rx="2.1" ry="2.7" />
      <ellipse cx="18.8" cy="10.6" rx="2.1" ry="2.6" />
      <path d="M12 11.2c-2.9 0-6 3.8-6 6.6 0 1.8 1.3 2.9 3 2.9 1.3 0 2.1-.7 3-.7s1.7.7 3 .7c1.7 0 3-1.1 3-2.9 0-2.8-3.1-6.6-6-6.6Z" />
    </g>
  ),
  claw: (
    <>
      <g fill="currentColor" stroke="none">
        <ellipse cx="5.6" cy="12.4" rx="1.9" ry="2.3" />
        <ellipse cx="9.6" cy="8.6" rx="1.9" ry="2.4" />
        <ellipse cx="14.4" cy="8.6" rx="1.9" ry="2.4" />
        <ellipse cx="18.4" cy="12.4" rx="1.9" ry="2.3" />
        <path d="M12 13.4c-2.6 0-5.4 3.3-5.4 5.8 0 1.6 1.2 2.6 2.7 2.6 1.2 0 1.9-.6 2.7-.6s1.5.6 2.7.6c1.5 0 2.7-1 2.7-2.6 0-2.5-2.8-5.8-5.4-5.8Z" />
      </g>
      <path d="M4.6 8.2 4 6.4M9.2 4.2 9 2.4M14.8 4.2 15 2.4M19.4 8.2 20 6.4" />
    </>
  ),
  scissors: (
    <>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M8.1 8.1 20 20M8.1 15.9 20 4M14.5 12h.01" />
    </>
  ),
  bath: (
    <>
      <path d="M3 12h18v2a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6v-2Z" />
      <path d="M6 12V5.5A2.5 2.5 0 0 1 10.5 4" />
      <path d="M7 20l-1 2M17 20l1 2M14 5.5h.01M17 7.5h.01M14 9h.01" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M10 11v6M14 11v6" />
      <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
    </>
  ),
  sparkles: (
    <>
      <path d="M10 3.5 11.6 8 16 9.5 11.6 11 10 15.5 8.4 11 4 9.5 8.4 8 10 3.5Z" />
      <path d="M18 14v5M15.5 16.5h5M17 3v3M15.5 4.5h3" />
    </>
  ),
};

export function AdminIcon({ name, size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name] || paths.sparkles}
    </svg>
  );
}

// Pick an icon that matches a grooming service by its (Thai) name.
export function serviceIconName(name = '') {
  const bath = name.includes('อาบน้ำ');
  const cut = name.includes('ตัดขน') || name.includes('ขน');
  if (bath && cut) return 'sparkles';
  if (bath) return 'bath';
  if (name.includes('เล็บ')) return 'claw';
  if (cut) return 'scissors';
  return 'paw';
}
