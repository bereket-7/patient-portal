import React from 'react';

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header style={{ marginBottom: '1.5rem' }}>
      <h1>{title}</h1>
      {subtitle && <p style={{ color: '#666' }}>{subtitle}</p>}
    </header>
  );
}
