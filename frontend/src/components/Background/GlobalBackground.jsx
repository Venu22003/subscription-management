import React from 'react';
import './GlobalBackground.css';

// Global background component with Shadcn-style variants
// Usage: <GlobalBackground variant="aurora" />
export default function GlobalBackground({ variant = 'aurora' }) {
  const valid = ['aurora', 'grid', 'dots'];
  const cls = valid.includes(variant) ? variant : 'aurora';

  return (
    <div className={`global-bg ${cls}`}>
      <div className="noise" />
    </div>
  );
}
