import type { Metadata } from 'next';
import { AuthProvider } from '@trialcliniq/shared-ui';
import './globals.css';
import { PatientAccountProvider } from '@/providers/patient-account-provider';
import { PatientSessionSync } from '@/components/layout/patient-session-sync';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'Patient Portal — TrialClinIQ',
  description: 'Register, connect health records, and discover clinical trial matches',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider portal="patient">
          <PatientAccountProvider>
            <PatientSessionSync />
            {children}
            <Toaster />
          </PatientAccountProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
