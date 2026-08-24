import { RegistrationShell } from '@/components/auth/registration-shell';

export default function RegistrationLayout({ children }: { children: React.ReactNode }) {
  return <RegistrationShell>{children}</RegistrationShell>;
}
