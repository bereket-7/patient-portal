'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Legacy dev auth route — redirects to the new login flow. */
export default function LegacyAuthPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/login');
  }, [router]);
  return null;
}
