const WELCOME_LETTER_FLAG = 'trialcliniq.patient.welcome-letter.available';

export function markWelcomeLetterAvailable(accountId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${WELCOME_LETTER_FLAG}:${accountId}`, '1');
}

export function isWelcomeLetterAvailable(accountId: string): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(`${WELCOME_LETTER_FLAG}:${accountId}`) === '1';
}
