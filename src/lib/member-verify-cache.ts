import {
  createMemberVerifyToken,
  type MemberVerifyTokenResult,
} from '@/lib/member-verify-api';

const STORAGE_PREFIX = 'trialcliniq.memberVerify.';

type CachedVerify = MemberVerifyTokenResult & { cachedFor: string };

function cacheKey(enterprisePatientId: string): string {
  return `${STORAGE_PREFIX}${enterprisePatientId}`;
}

function readCache(enterprisePatientId: string): CachedVerify | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(cacheKey(enterprisePatientId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedVerify;
    if (!parsed?.verifyUrl || !parsed?.expiresAt) return null;
    if (parsed.cachedFor !== enterprisePatientId) return null;
    if (Date.parse(parsed.expiresAt) <= Date.now() + 60_000) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(enterprisePatientId: string, value: MemberVerifyTokenResult): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: CachedVerify = { ...value, cachedFor: enterprisePatientId };
    sessionStorage.setItem(cacheKey(enterprisePatientId), JSON.stringify(payload));
  } catch {
    /* ignore quota */
  }
}

/** Mint or reuse a Member ID verify URL until near expiry — avoids QR flicker. */
export async function getStableMemberVerifyUrl(params: {
  enterprisePatientId: string;
  firstName: string;
  lastName: string;
}): Promise<MemberVerifyTokenResult> {
  const cached = readCache(params.enterprisePatientId);
  if (cached) {
    return {
      token: cached.token,
      verifyUrl: cached.verifyUrl,
      expiresAt: cached.expiresAt,
    };
  }
  const minted = await createMemberVerifyToken(params);
  writeCache(params.enterprisePatientId, minted);
  return minted;
}
