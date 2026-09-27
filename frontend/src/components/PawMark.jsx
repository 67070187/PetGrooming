import React from 'react';

export default function PawMark({ className }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <ellipse cx="32" cy="42" rx="16" ry="13" />
      <circle cx="14" cy="20" r="7" />
      <circle cx="30" cy="12" r="7.5" />
      <circle cx="46" cy="20" r="7" />
      <circle cx="52" cy="34" r="6" />
    </svg>
  );
}