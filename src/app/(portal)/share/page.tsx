'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Legacy mock share route — redirects to gateway-backed profile share. */
export default function ShareRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/profile/share');
  }, [router]);
  return (
    <p className="text-sm text-muted-foreground">Redirecting to secure share…</p>
  );
}
