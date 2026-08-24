import { LoginShell } from '@/components/auth/login-shell';

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <LoginShell>{children}</LoginShell>;
}
