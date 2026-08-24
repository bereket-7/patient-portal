import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { AuthProvider } from '@trialcliniq/shared-ui';
import './globals.css';
import { PatientAccountProvider } from '@/providers/patient-account-provider';
import { PatientSessionSync } from '@/components/layout/patient-session-sync';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { THEME_INIT_SCRIPT } from '@/lib/theme';
import { Toaster } from '@/components/ui/sonner';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Patient Portal — TrialClinIQ',
  description: 'Register, connect health records, and discover clinical trial matches',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <Script id="patient-portal-theme" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <ThemeProvider>
          <AuthProvider portal="patient">
            <PatientAccountProvider>
              <PatientSessionSync />
              {children}
              <Toaster />
            </PatientAccountProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
