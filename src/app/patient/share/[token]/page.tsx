'use client';

import { useParams } from 'next/navigation';
import { PatientDetailView } from '@/components/share/patient-detail-view';
import { ProviderChartShell } from '@/components/share/provider-chart-shell';

export default function ProviderShareViewPage() {
  const params = useParams<{ token: string }>();
  const token = decodeURIComponent(params.token ?? '');

  return (
    <ProviderChartShell token={token}>
      {({ detail, expiresAtLabel }) => (
        <PatientDetailView detail={detail} expiresAtLabel={expiresAtLabel} token={token} />
      )}
    </ProviderChartShell>
  );
}
