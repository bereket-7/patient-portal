const PATIENT_AUTH_KEY = 'trialcliniq.patient.authenticated';

export function isPatientAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(PATIENT_AUTH_KEY) === '1';
}

export function setPatientAuthenticated(value: boolean): void {
  if (typeof window === 'undefined') return;
  if (value) {
    window.localStorage.setItem(PATIENT_AUTH_KEY, '1');
  } else {
    window.localStorage.removeItem(PATIENT_AUTH_KEY);
  }
}

export const AUTH_PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/verify-email',
  '/verify-phone',
  '/auth',
] as const;

export function isAuthPublicPath(pathname: string): boolean {
  return AUTH_PUBLIC_PATHS.some((p) => pathname === p || (p !== '/' && pathname.startsWith(`${p}/`)));
}
