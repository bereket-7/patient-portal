'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || '';
const GSI_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleAccountsId = {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: string;
      theme?: string;
      size?: string;
      text?: string;
      shape?: string;
      width?: number;
      logo_alignment?: string;
    },
  ) => void;
};

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleAccountsId } };
  }
}

function loadGsiScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('ssr'));
  if (window.google?.accounts?.id) return Promise.resolve();

  const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SCRIPT_SRC}"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('gsi_load_failed')), {
        once: true,
      });
      if (window.google?.accounts?.id) resolve();
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GSI_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('gsi_load_failed'));
    document.head.appendChild(script);
  });
}

type Props = {
  disabled?: boolean;
  onCredential: (idToken: string) => void | Promise<void>;
  onError?: (message: string) => void;
};

export function GoogleSignInButton({ disabled, onCredential, onError }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState('');

  callbackRef.current = onCredential;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setLoadError('');
      return;
    }

    let cancelled = false;

    loadGsiScript()
      .then(() => {
        if (cancelled || !hostRef.current || !window.google?.accounts?.id) return;
        hostRef.current.innerHTML = '';
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            const token = response.credential?.trim();
            if (!token) {
              onErrorRef.current?.(
                'Google sign-in did not return a credential. Try again.',
              );
              return;
            }
            void callbackRef.current(token);
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        const width = Math.min(hostRef.current.offsetWidth || 360, 400);
        window.google.accounts.id.renderButton(hostRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width,
          logo_alignment: 'left',
        });
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError('Unable to load Google Sign-In. Check your network and try again.');
          onErrorRef.current?.('Unable to load Google Sign-In.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-center text-xs text-muted-foreground">
        Google Sign-In is not configured. Set{' '}
        <span className="font-mono">NEXT_PUBLIC_GOOGLE_CLIENT_ID</span> (same value as gateway{' '}
        <span className="font-mono">GOOGLE_CLIENT_ID</span>).
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {loadError && (
        <p className="text-center text-xs text-red-600 dark:text-red-300">{loadError}</p>
      )}
      <div
        ref={hostRef}
        className={`flex min-h-11 w-full justify-center overflow-hidden ${
          disabled ? 'pointer-events-none opacity-50' : ''
        }`}
        aria-busy={!ready}
      />
      {!ready && !loadError && (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading Google…
        </div>
      )}
    </div>
  );
}

export function isGoogleSignInConfigured(): boolean {
  return Boolean(GOOGLE_CLIENT_ID);
}
