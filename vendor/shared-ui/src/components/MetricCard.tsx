import React from 'react';

export function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem', minWidth: 160 }}>
      <div style={{ fontSize: '0.875rem', color: '#666' }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{value}</div>
    </div>
  );
}
